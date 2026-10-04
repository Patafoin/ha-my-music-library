"""Push Music Assistant queue changes to the card instead of fixed-delay polling.

The card used to reload the queue "a bit later" after every action (500 ms to
1.5 s timers), because it had no way to know when the queue had actually
changed. MA already tells us: QUEUE_UPDATED (current item, state, shuffle…) and
QUEUE_ITEMS_UPDATED (items added, removed, moved). We relay those events on a
dispatcher signal, and the card listens through a WebSocket subscription.

The dispatcher decouples the two sides: the MA client is replaced on every
entry reload (auto-reload on disconnect), while card subscriptions live as long
as the browser's WebSocket connection.
"""
from __future__ import annotations

from typing import TYPE_CHECKING, Any

import voluptuous as vol
from homeassistant.components.websocket_api import (
    ActiveConnection,
    event_message,
    websocket_command,
)
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from music_assistant_models.enums import EventType
from music_assistant_models.event import MassEvent

from .const import SIGNAL_QUEUE_EVENT, WS_SUBSCRIBE_QUEUE_COMMAND

if TYPE_CHECKING:
    from music_assistant_client import MusicAssistantClient

QUEUE_EVENTS = (EventType.QUEUE_UPDATED, EventType.QUEUE_ITEMS_UPDATED)


@callback
def async_relay_queue_events(hass: HomeAssistant, mass: MusicAssistantClient) -> CALLBACK_TYPE:
    """Forward MA queue events to SIGNAL_QUEUE_EVENT. Returns the unsubscribe callback."""

    @callback
    def _on_queue_event(event: MassEvent) -> None:
        # A plain (non-coroutine) callback: the client calls it in the event loop.
        async_dispatcher_send(
            hass, SIGNAL_QUEUE_EVENT, {"queue_id": event.object_id, "event": event.event.value}
        )

    return mass.subscribe(_on_queue_event, QUEUE_EVENTS)


@websocket_command({vol.Required("type"): WS_SUBSCRIBE_QUEUE_COMMAND})
@callback
def ws_subscribe_queue(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    """Stream `{queue_id, event}` messages to the card until it unsubscribes."""

    @callback
    def _forward(payload: dict[str, Any]) -> None:
        connection.send_message(event_message(msg["id"], payload))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, SIGNAL_QUEUE_EVENT, _forward)
    connection.send_result(msg["id"])
