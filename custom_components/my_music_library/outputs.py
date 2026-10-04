"""Audio outputs: what the card's output panel shows and the actions it runs.

The card's output panel (switch / group / control modes) needs facts that only
Music Assistant knows — who leads a group, which players can be grouped
together, whether a player is powered — plus the HA area of each output for
short display names. Every action goes to Music Assistant directly (the
media_player join/unjoin services were used before, with a copy of the group
kept by the card; MA is the only source of truth now).

Group presets ("Whole house"…) are stored server-side so every device sees them.
"""
from __future__ import annotations

import logging
import uuid
from collections.abc import Iterable
from typing import TYPE_CHECKING, Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from music_assistant_models.errors import MusicAssistantError

from .const import DOMAIN
from .entity import UNIQUE_ID_PREFIX

if TYPE_CHECKING:
    from music_assistant_client import MusicAssistantClient
    from music_assistant_models.player import Player

_LOGGER = logging.getLogger(__name__)

MEDIA_PLAYER = "media_player"
# MA player types that are not audio outputs one would pick (protocol sub-players, lights…)
NOT_OUTPUTS = {"protocol", "visualizer", "light"}


def get_mass(hass: HomeAssistant) -> MusicAssistantClient | None:
    """Return the MA client of our loaded config entry, if any."""
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.state == ConfigEntryState.LOADED:
            return entry.runtime_data.mass
    return None


def entity_id_for(hass: HomeAssistant, player_id: str) -> str | None:
    """HA entity_id of our media_player for a MA player_id."""
    return er.async_get(hass).async_get_entity_id(MEDIA_PLAYER, DOMAIN, f"{UNIQUE_ID_PREFIX}{player_id}")


def player_id_for(hass: HomeAssistant, entity_id: str) -> str | None:
    """MA player_id behind one of our media_player entities."""
    entry = er.async_get(hass).async_get(entity_id)
    if entry is None or entry.platform != DOMAIN or not entry.unique_id.startswith(UNIQUE_ID_PREFIX):
        return None
    return entry.unique_id[len(UNIQUE_ID_PREFIX):]


def _area_name(hass: HomeAssistant, entity_id: str) -> str | None:
    """Area of the entity (its own, else its device's)."""
    entry = er.async_get(hass).async_get(entity_id)
    if entry is None:
        return None
    area_id = entry.area_id
    if area_id is None and entry.device_id and (device := dr.async_get(hass).async_get(entry.device_id)):
        area_id = device.area_id
    if area_id is None:
        return None
    area = ar.async_get(hass).async_get_area(area_id)
    return area.name if area else None


def _value(enum_or_str: Any) -> Any:
    return getattr(enum_or_str, "value", enum_or_str)


def _mdi(icon: str | None) -> str | None:
    """MA icons come as "speaker" or "mdi-speaker": HA wants "mdi:speaker"."""
    if not icon:
        return None
    return icon.replace("mdi-", "mdi:", 1) if icon.startswith("mdi") else f"mdi:{icon}"


def _hidden(player: Player) -> bool:
    """Whether MA hides the player from its UI for good.

    Recent models: `hide_in_ui` (bool). Older ones (client 1.3.3): `hide_player_in_ui`, a set of
    conditions ("when_unavailable", "when_synced"…) that is never empty — only "always" hides.
    """
    flag = getattr(player, "hide_in_ui", None)
    if isinstance(flag, bool):
        return flag
    return any(_value(option) == "always" for option in getattr(player, "hide_player_in_ui", None) or ())


def _entity_ids(hass: HomeAssistant, player_ids: Iterable[str], exclude: str | None = None) -> list[str]:
    return [eid for pid in player_ids if pid != exclude and (eid := entity_id_for(hass, pid))]


def _groupable_ids(player: Player, players: list[Player]) -> set[str]:
    """Players this one can be grouped with.

    MA's `can_group_with` mixes player ids and provider instance ids, the latter
    meaning "any player of that provider".
    """
    allowed = set(player.can_group_with or ())
    return {
        other.player_id
        for other in players
        if other.player_id != player.player_id
        and (other.player_id in allowed or other.provider in allowed)
    }


def describe_outputs(hass: HomeAssistant, mass: MusicAssistantClient) -> list[dict[str, Any]]:
    """One entry per MA player that has an entity of ours (hidden-in-UI players skipped)."""
    players = [p for p in mass.players if not _hidden(p) and _value(p.type) not in NOT_OUTPUTS]
    outputs: list[dict[str, Any]] = []
    for player in players:
        entity_id = entity_id_for(hass, player.player_id)
        if entity_id is None:
            continue
        device = player.device_info
        outputs.append({
            "entity_id": entity_id,
            "player_id": player.player_id,
            "name": player.name,
            "provider": player.provider,
            "type": _value(player.type),
            "icon": _mdi(player.icon),
            "available": bool(player.available),
            "powered": player.powered,
            "can_power": _value(getattr(player, "power_control", None)) not in (None, "none"),
            "model": getattr(device, "model", None),
            "manufacturer": getattr(device, "manufacturer", None),
            "area": _area_name(hass, entity_id),
            # A leader lists itself among its members: keep the others only.
            "members": _entity_ids(hass, player.group_members or (), exclude=player.player_id),
            "leader": entity_id_for(hass, player.synced_to) if player.synced_to else None,
            "groupable": sorted(_entity_ids(hass, _groupable_ids(player, players))),
        })
    return outputs


def _require(hass: HomeAssistant, entity_id: str) -> str:
    if (player_id := player_id_for(hass, entity_id)) is None:
        raise HomeAssistantError(f"{entity_id} is not a My Music Library player")
    return player_id


def _require_mass(hass: HomeAssistant) -> MusicAssistantClient:
    if (mass := get_mass(hass)) is None:
        raise HomeAssistantError("Music Assistant is not connected")
    return mass


async def async_transfer(hass: HomeAssistant, source: str, targets: list[str]) -> None:
    """Move what `source` plays to `targets`; with several targets, the first leads a group of them all.

    The current track and position are kept: MA's transfer reads them on the source
    right before stopping it. Nothing may touch the source's group before that —
    ungrouping one of its members ourselves made the source's player re-set its
    stream, and the transfer then started the queue from its first track. MA frees
    a target that is synced to a group itself (and waits for it). The other targets
    are ungrouped afterwards, once the source is stopped, then join the new leader.
    If the source (or its group's leader) is among the targets, nothing moves: the group
    is set to exactly the targets.
    """
    mass = _require_mass(hass)
    source_id = _require(hass, source)
    target_ids = list(dict.fromkeys(_require(hass, t) for t in targets))
    if not target_ids:
        raise HomeAssistantError("No target player")
    if (player := mass.players.get(source_id)) and player.synced_to:
        source_id = player.synced_to  # a group member plays its leader's queue: move the group's music
    try:
        if source_id in target_ids:
            leader = source_id
            # the group becomes exactly the targets: members left out are dropped
            leader_player = mass.players.get(source_id)
            current = [m for m in (leader_player.group_members if leader_player else ()) if m != source_id]
            if dropped := [m for m in current if m not in target_ids]:
                await mass.players.set_members(leader, player_ids_to_remove=dropped)
        else:
            leader = target_ids[0]
            source_queue = await mass.player_queues.get_active_queue(source_id)
            queue_id = source_queue.queue_id if source_queue else source_id
            await mass.player_queues.transfer(queue_id, leader, auto_play=True)
        if others := [pid for pid in target_ids if pid != leader and not ((p := mass.players.get(pid)) and p.synced_to == leader)]:
            if synced := [pid for pid in others if (p := mass.players.get(pid)) and p.synced_to not in (None, leader)]:
                await mass.players.ungroup_many(synced)
            await mass.players.set_members(leader, player_ids_to_add=others)
    except MusicAssistantError as err:
        raise HomeAssistantError(str(err) or err.__class__.__name__) from err


async def async_set_members(
    hass: HomeAssistant, leader: str, add: list[str] | None = None, remove: list[str] | None = None
) -> None:
    """Add players to / remove players from `leader`'s group."""
    mass = _require_mass(hass)
    leader_id = _require(hass, leader)
    to_add = [_require(hass, e) for e in add or ()]
    to_remove = [_require(hass, e) for e in remove or ()]
    try:
        if synced := [pid for pid in to_add if (p := mass.players.get(pid)) and p.synced_to not in (None, leader_id)]:
            await mass.players.ungroup_many(synced)
        await mass.players.set_members(
            leader_id, player_ids_to_add=to_add or None, player_ids_to_remove=to_remove or None
        )
    except MusicAssistantError as err:
        raise HomeAssistantError(str(err) or err.__class__.__name__) from err


async def async_group_volume(hass: HomeAssistant, leader: str, volume: int) -> None:
    """Set the volume of a whole group (MA scales each member proportionally)."""
    mass = _require_mass(hass)
    try:
        await mass.players.group_volume(_require(hass, leader), max(0, min(100, int(volume))))
    except MusicAssistantError as err:
        raise HomeAssistantError(str(err) or err.__class__.__name__) from err


async def async_power(hass: HomeAssistant, entity_id: str, powered: bool) -> None:
    """Power a player on or off."""
    mass = _require_mass(hass)
    try:
        await mass.players.power(_require(hass, entity_id), powered)
    except MusicAssistantError as err:
        raise HomeAssistantError(str(err) or err.__class__.__name__) from err


# ── Group presets ─────────────────────────────────────────────────────────────


def get_presets(hass: HomeAssistant) -> list[dict[str, Any]]:
    """Saved group presets: [{id, name, leader, members}]."""
    return list(hass.data.get(DOMAIN, {}).get("presets", []))


async def async_save_preset(
    hass: HomeAssistant, name: str, leader: str, members: list[str], preset_id: str | None = None
) -> dict[str, Any]:
    """Create (or replace, when `preset_id` is given) a group preset."""
    name = name.strip()
    if not name:
        raise HomeAssistantError("Preset name is empty")
    preset = {
        "id": preset_id or uuid.uuid4().hex[:8],
        "name": name,
        "leader": leader,
        "members": [m for m in dict.fromkeys(members) if m != leader],
    }
    presets = [p for p in get_presets(hass) if p["id"] != preset["id"]] + [preset]
    await _async_store_presets(hass, presets)
    return preset


async def async_delete_preset(hass: HomeAssistant, preset_id: str) -> None:
    """Delete a group preset (no-op if unknown)."""
    await _async_store_presets(hass, [p for p in get_presets(hass) if p["id"] != preset_id])


async def _async_store_presets(hass: HomeAssistant, presets: list[dict[str, Any]]) -> None:
    from . import async_save_store  # noqa: PLC0415 — avoids an import cycle with __init__

    hass.data.setdefault(DOMAIN, {})["presets"] = presets
    await async_save_store(hass)
