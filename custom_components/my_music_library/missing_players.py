"""Clean up media_players whose Music Assistant player no longer exists.

Music Assistant identifies a player by an id its provider chooses: the MAC
address for Squeezelite, one id per browser for the web player. A device that
comes back under another id (Squeezelite started before the network is up
reports 00:00:00:00:00:00, or the MAC of another network interface) is a new
player for MA, so we create a new entity for it — and the old one stays
behind, unavailable, under the same name.

- MA removes a player (PLAYER_REMOVED): its entity and device go at once, as
  with the official integration.
- MA no longer knows a player at all (it forgets disconnected players when it
  restarts): a fixable Repairs issue lists them, and the fix flow deletes the
  ones the user ticks. Never automatic: a speaker that is merely switched off
  when MA starts is missing from its list too.
- Such a device can also be deleted from its device page
  (`async_remove_config_entry_device` in `__init__.py`).
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.event import async_call_later
from music_assistant_models.enums import EventType
from music_assistant_models.event import MassEvent

from .const import DOMAIN
from .entity import UNIQUE_ID_PREFIX

if TYPE_CHECKING:
    from .mass_connection import MyMusicLibraryConfigEntry

_LOGGER = logging.getLogger(__name__)

ISSUE_MISSING_PLAYERS = "missing_players"

# Players reconnect to MA in the minutes after it (or HA) starts: only report
# the ones still missing after this delay.
MISSING_CHECK_DELAY = 600


@dataclass(frozen=True)
class MissingPlayer:
    """One of our media_players whose MA player is gone."""

    player_id: str
    entity_id: str
    name: str


@callback
def async_find_missing(
    hass: HomeAssistant, entry: MyMusicLibraryConfigEntry
) -> list[MissingPlayer]:
    """Return our media_players whose player Music Assistant does not know anymore."""
    mass = entry.runtime_data.mass
    if not mass.connection.connected:
        # An empty or outdated players list proves nothing.
        return []
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    missing: list[MissingPlayer] = []
    for reg_entry in er.async_entries_for_config_entry(ent_reg, entry.entry_id):
        if reg_entry.domain != "media_player" or not reg_entry.unique_id.startswith(UNIQUE_ID_PREFIX):
            continue
        player_id = reg_entry.unique_id[len(UNIQUE_ID_PREFIX):]
        if mass.players.get(player_id) is not None:
            continue
        device = dev_reg.async_get(reg_entry.device_id) if reg_entry.device_id else None
        name = (
            reg_entry.name
            or (device and (device.name_by_user or device.name))
            or reg_entry.original_name
            or player_id
        )
        missing.append(MissingPlayer(player_id, reg_entry.entity_id, name))
    return sorted(missing, key=lambda player: player.entity_id)


def format_missing(players: list[MissingPlayer]) -> str:
    """Markdown list used in the issue description."""
    return "\n".join(f"- `{player.entity_id}` ({player.name})" for player in players)


@callback
def async_remove_player(
    hass: HomeAssistant, entry: MyMusicLibraryConfigEntry, player_id: str
) -> None:
    """Remove the media_player of `player_id` and our link to its device."""
    ent_reg = er.async_get(hass)
    if entity_id := ent_reg.async_get_entity_id("media_player", DOMAIN, f"{UNIQUE_ID_PREFIX}{player_id}"):
        ent_reg.async_remove(entity_id)
        _LOGGER.info("Removed %s (Music Assistant player %s is gone)", entity_id, player_id)
    if device := async_get_player_device(hass, entry, player_id):
        dev_reg = dr.async_get(hass)
        if hasattr(dev_reg, "async_get_device_by_identifier"):
            # HA 2026.10+: a device belongs to one config entry only.
            dev_reg.async_remove_device(device.id)
        else:
            dev_reg.async_update_device(device.id, remove_config_entry_id=entry.entry_id)


@callback
def async_get_player_device(
    hass: HomeAssistant, entry: MyMusicLibraryConfigEntry, player_id: str
) -> dr.DeviceEntry | None:
    """Return our device for `player_id`.

    HA 2026.10 deprecates `async_get_device` (identifiers are no longer unique
    across config entries) in favour of `async_get_device_by_identifier`,
    which older versions (down to 2026.2) do not have.
    """
    dev_reg = dr.async_get(hass)
    identifier = (DOMAIN, player_id)
    if hasattr(dev_reg, "async_get_device_by_identifier"):
        return dev_reg.async_get_device_by_identifier(identifier, entry.entry_id)
    return dev_reg.async_get_device(identifiers={identifier})


@callback
def async_update_issue(hass: HomeAssistant, entry: MyMusicLibraryConfigEntry) -> None:
    """Create, refresh or delete the missing-players Repairs issue."""
    players = async_find_missing(hass, entry)
    if not players:
        ir.async_delete_issue(hass, DOMAIN, ISSUE_MISSING_PLAYERS)
        return
    ir.async_create_issue(
        hass,
        DOMAIN,
        ISSUE_MISSING_PLAYERS,
        is_fixable=True,
        is_persistent=False,
        severity=ir.IssueSeverity.WARNING,
        translation_key=ISSUE_MISSING_PLAYERS,
        translation_placeholders={"players": format_missing(players)},
    )


@callback
def async_track_missing(hass: HomeAssistant, entry: MyMusicLibraryConfigEntry) -> CALLBACK_TYPE:
    """Check for missing players MISSING_CHECK_DELAY after setup, then on every change.

    Changes: a player added to or removed from MA, a media_player registry
    entry changed (deleted from the UI, for instance). Returns the unsubscribe
    callback.
    """
    mass = entry.runtime_data.mass
    started = False

    @callback
    def _update_issue() -> None:
        # Must be a @callback: Debouncer runs plain functions in the executor.
        if started:
            async_update_issue(hass, entry)

    debouncer = Debouncer(hass, _LOGGER, cooldown=2, immediate=False, function=_update_issue)

    @callback
    def _start(_now: object) -> None:
        nonlocal started
        started = True
        _update_issue()

    cancel_start = async_call_later(hass, MISSING_CHECK_DELAY, _start)

    def _on_player_event(event: MassEvent) -> None:
        debouncer.async_schedule_call()

    unsub_players = [
        mass.subscribe(_on_player_event, event_type)
        for event_type in (EventType.PLAYER_ADDED, EventType.PLAYER_REMOVED)
    ]

    @callback
    def _is_media_player(event_data: er.EventEntityRegistryUpdatedData) -> bool:
        return event_data["entity_id"].startswith("media_player.")

    @callback
    def _on_registry_updated(event: Event[er.EventEntityRegistryUpdatedData]) -> None:
        debouncer.async_schedule_call()

    unsub_registry = hass.bus.async_listen(
        er.EVENT_ENTITY_REGISTRY_UPDATED, _on_registry_updated, event_filter=_is_media_player
    )

    @callback
    def _unsubscribe() -> None:
        cancel_start()
        for unsub in unsub_players:
            unsub()
        unsub_registry()
        debouncer.async_cancel()
        ir.async_delete_issue(hass, DOMAIN, ISSUE_MISSING_PLAYERS)

    return _unsubscribe
