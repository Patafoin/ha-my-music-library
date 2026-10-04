"""Resume a queue that Music Assistant leaves stopped although it has a next track.

Music Assistant (seen on 2.10.4) hands the next track to a player while the
current one starts, from `_preload_next_item`. That step bails out when the
queue has no current item yet, which is the case when playback starts on a
queue that was empty just before (e.g. emptied by a failed "replace" of a
dynamic playlist that had nothing to play). Nothing retries it: the player
plays the first track, then stops, with the next track still in the queue —
pressing "next" works, because that is a direct command.

This watchdog spots exactly that end state — a queue going from playing to
idle on a track played to its end, not marked ended, with a next track — and
does what the user would do: `player_queues/next`. A stop pressed by the user
mid-track does not match (track not played to its end).
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later
from music_assistant_models.enums import EventType
from music_assistant_models.errors import MusicAssistantError
from music_assistant_models.event import MassEvent

if TYPE_CHECKING:
    from datetime import datetime

    from music_assistant_client import MusicAssistantClient

_LOGGER = logging.getLogger(__name__)

WATCHED_EVENTS = (EventType.QUEUE_UPDATED, EventType.QUEUE_TIME_UPDATED)
# Music Assistant considers a track fully played within 5 s of its end: same margin.
FULLY_PLAYED_MARGIN = 5
# Leave Music Assistant time to resume on its own (its own idle checks run for 5 s).
RESUME_DELAY = 6


@dataclass
class _Seen:
    """Last known state of a queue."""

    state: str | None
    item_id: str | None
    elapsed: float


def _value(enum_or_str: Any) -> Any:
    """Raw event data carries enums as plain strings; tolerate both."""
    return getattr(enum_or_str, "value", enum_or_str)


class QueueWatchdog:
    """Watch Music Assistant queues and resume the ones stalled after a track."""

    def __init__(self, hass: HomeAssistant, mass: MusicAssistantClient) -> None:
        """Initialize the watchdog (call `async_start` to subscribe)."""
        self._hass = hass
        self._mass = mass
        self._seen: dict[str, _Seen] = {}
        self._pending: dict[str, CALLBACK_TYPE] = {}

    @callback
    def async_start(self) -> CALLBACK_TYPE:
        """Subscribe to queue events. Returns the callback that stops the watchdog."""
        unsub = self._mass.subscribe(self._on_event, WATCHED_EVENTS)

        @callback
        def _stop() -> None:
            unsub()
            for cancel in self._pending.values():
                cancel()
            self._pending.clear()

        return _stop

    @callback
    def _on_event(self, event: MassEvent) -> None:
        queue_id = event.object_id
        if queue_id is None:
            return
        prev = self._seen.get(queue_id)

        if event.event == EventType.QUEUE_TIME_UPDATED:
            if prev is not None and isinstance(event.data, (int, float)):
                prev.elapsed = max(prev.elapsed, float(event.data))
            return

        data: dict[str, Any] = event.data if isinstance(event.data, dict) else {}
        state = _value(data.get("state"))
        current = data.get("current_item") or {}
        item_id = current.get("queue_item_id")
        elapsed = float(data.get("elapsed_time") or 0)
        if prev is not None and prev.item_id == item_id:
            # the idle update may report a reset elapsed time: keep the furthest point reached
            elapsed = max(elapsed, prev.elapsed)
        self._seen[queue_id] = _Seen(state, item_id, elapsed)

        if state != "idle":
            self._cancel(queue_id)
            return
        if prev is None or prev.state != "playing" or prev.item_id != item_id or item_id is None:
            return
        if not self._stalled(data, current, elapsed):
            return
        self._cancel(queue_id)

        @callback
        def _check(_now: datetime) -> None:
            self._pending.pop(queue_id, None)
            self._hass.async_create_task(self._async_resume(queue_id, item_id))

        self._pending[queue_id] = async_call_later(self._hass, RESUME_DELAY, _check)

    @staticmethod
    def _stalled(data: dict[str, Any], current: dict[str, Any], elapsed: float) -> bool:
        """Whether an idle queue stopped after a fully played track, with a next one waiting."""
        duration = current.get("duration") or 0
        return bool(
            not data.get("ended")
            and not data.get("flow_mode")
            and _value(data.get("repeat_mode")) != "one"
            and data.get("next_item")
            and duration > 0
            and elapsed >= duration - FULLY_PLAYED_MARGIN
        )

    @callback
    def _cancel(self, queue_id: str) -> None:
        if cancel := self._pending.pop(queue_id, None):
            cancel()

    async def _async_resume(self, queue_id: str, item_id: str) -> None:
        """Skip to the next track if the queue is still stopped on the same track."""
        queue = self._mass.player_queues.get(queue_id)
        if (
            queue is None
            or _value(queue.state) != "idle"
            or queue.current_item is None
            or queue.current_item.queue_item_id != item_id
            or getattr(queue, "ended", False)
            or queue.next_item is None
        ):
            return
        _LOGGER.warning(
            "Queue %s stopped after %r although %r is next (Music Assistant did not hand it "
            "to the player): skipping to it",
            queue.display_name,
            queue.current_item.name,
            queue.next_item.name,
        )
        try:
            await self._mass.player_queues.next(queue_id)
        except MusicAssistantError as err:
            _LOGGER.warning("Could not resume queue %s: %s", queue.display_name, err)
