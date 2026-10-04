"""Detect and fix media_player duplicates with the official Music Assistant integration.

When the official integration (`music_assistant`, formerly `mass`) is still set
up, it already owns the natural entity_id of every MA player
(`media_player.kitchen`), so the entities created by our own media_player
platform get a numeric suffix (`media_player.kitchen_2`). Existing
automations, scripts and dashboards keep driving the official entities.

We never touch those entities on our own: a fixable Repairs issue lists the
duplicates, and only when the user confirms do we swap the entity_ids (the
official entity is renamed `<object_id>_music_assistant`, ours takes the
original id). Both renames can be undone from the entity settings dialog.
"""
from __future__ import annotations

import asyncio
import logging
import re
from dataclasses import dataclass

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.debounce import Debouncer

from .const import CONF_DEFAULT_PLAYER, CONF_EXCLUDED_PLAYERS, DOMAIN
from .entity import UNIQUE_ID_PREFIX

_LOGGER = logging.getLogger(__name__)

ISSUE_DUPLICATE_ENTITIES = "duplicate_entities"

# Platforms of the official integration whose media_player unique_id is the
# raw MA player_id (ours is UNIQUE_ID_PREFIX + player_id).
OFFICIAL_PLATFORMS = ("music_assistant", "mass")

# Suffix given to the official entity when the user accepts the swap.
OFFICIAL_SUFFIX = "music_assistant"

# How long to wait for HA to release the official entity_ids after renaming
# them (the entity platform re-adds the entity under its new id in a task).
_RELEASE_TIMEOUT = 10
_RELEASE_POLL_INTERVAL = 0.1

_SUFFIX_RE = re.compile(r"^(?P<base>.+?)_(?P<num>\d+)$")


@dataclass(frozen=True)
class DuplicatePair:
    """One MA player exposed by both the official integration and ours."""

    player_id: str
    official_entity_id: str
    mml_entity_id: str


def _split_suffix(entity_id: str) -> tuple[str, int]:
    """Split `media_player.kitchen_2` into ("media_player.kitchen", 2).

    An entity_id without numeric suffix counts as 1: HA gives `_2` to the
    second entity that asks for the same object_id.
    """
    if match := _SUFFIX_RE.match(entity_id):
        return match["base"], int(match["num"])
    return entity_id, 1


@callback
def async_find_duplicates(hass: HomeAssistant) -> list[DuplicatePair]:
    """Return MA players where our entity only got a suffixed variant of the official id.

    Pairs the user already fixed (official entity renamed) or renamed by hand
    no longer share the same base id, so they are not reported again.
    """
    ent_reg = er.async_get(hass)
    official: dict[str, er.RegistryEntry] = {
        entry.unique_id: entry
        for entry in ent_reg.entities.values()
        if entry.domain == "media_player" and entry.platform in OFFICIAL_PLATFORMS
    }
    if not official:
        return []

    pairs: list[DuplicatePair] = []
    for entry in ent_reg.entities.values():
        if (
            entry.domain != "media_player"
            or entry.platform != DOMAIN
            or not entry.unique_id.startswith(UNIQUE_ID_PREFIX)
        ):
            continue
        player_id = entry.unique_id[len(UNIQUE_ID_PREFIX):]
        if (official_entry := official.get(player_id)) is None:
            continue
        official_base, official_num = _split_suffix(official_entry.entity_id)
        mml_base, mml_num = _split_suffix(entry.entity_id)
        if official_base == mml_base and mml_num > official_num:
            pairs.append(DuplicatePair(player_id, official_entry.entity_id, entry.entity_id))

    return sorted(pairs, key=lambda pair: pair.official_entity_id)


@callback
def async_find_references(hass: HomeAssistant, entity_ids: list[str]) -> list[str]:
    """Return the automations and scripts that reference any of `entity_ids`."""
    # Imported here: both components are optional and may not be loaded.
    from homeassistant.components.automation import automations_with_entity
    from homeassistant.components.script import scripts_with_entity

    references: set[str] = set()
    for entity_id in entity_ids:
        references.update(automations_with_entity(hass, entity_id))
        references.update(scripts_with_entity(hass, entity_id))
    return sorted(references)


def format_pairs(pairs: list[DuplicatePair]) -> str:
    """Markdown list used in the issue and the fix flow descriptions."""
    return "\n".join(
        f"- `{pair.mml_entity_id}` → `{pair.official_entity_id}`" for pair in pairs
    )


@callback
def async_update_issue(hass: HomeAssistant) -> None:
    """Create, refresh or delete the duplicate-entities Repairs issue."""
    pairs = async_find_duplicates(hass)
    if not pairs:
        ir.async_delete_issue(hass, DOMAIN, ISSUE_DUPLICATE_ENTITIES)
        return
    ir.async_create_issue(
        hass,
        DOMAIN,
        ISSUE_DUPLICATE_ENTITIES,
        is_fixable=True,
        is_persistent=False,
        severity=ir.IssueSeverity.WARNING,
        translation_key=ISSUE_DUPLICATE_ENTITIES,
        translation_placeholders={"entities": format_pairs(pairs)},
    )


@callback
def async_track_duplicates(hass: HomeAssistant) -> CALLBACK_TYPE:
    """Re-check duplicates whenever a media_player registry entry changes.

    The official integration may set up before or after us, and entities can
    be renamed at any time from the UI. Returns the unsubscribe callback.
    """
    @callback
    def _update_issue() -> None:
        # Must be a @callback: Debouncer runs plain functions in the executor.
        async_update_issue(hass)

    debouncer = Debouncer(hass, _LOGGER, cooldown=2, immediate=False, function=_update_issue)

    @callback
    def _is_media_player(event_data: er.EventEntityRegistryUpdatedData) -> bool:
        return event_data["entity_id"].startswith("media_player.")

    @callback
    def _on_registry_updated(event: Event[er.EventEntityRegistryUpdatedData]) -> None:
        debouncer.async_schedule_call()

    unsub = hass.bus.async_listen(
        er.EVENT_ENTITY_REGISTRY_UPDATED, _on_registry_updated, event_filter=_is_media_player
    )

    @callback
    def _unsubscribe() -> None:
        unsub()
        debouncer.async_cancel()

    return _unsubscribe


def _free_entity_id(hass: HomeAssistant, wanted: str, reserved: set[str]) -> str:
    """Return `wanted`, or `wanted_2`, `wanted_3`… — the first id nobody uses."""
    ent_reg = er.async_get(hass)
    candidate, num = wanted, 1
    while (
        candidate in reserved
        or ent_reg.async_is_registered(candidate)
        or not hass.states.async_available(candidate)
    ):
        num += 1
        candidate = f"{wanted}_{num}"
    return candidate


async def async_swap_entity_ids(
    hass: HomeAssistant, pairs: list[DuplicatePair], disable_official: bool
) -> None:
    """Give our entities the official entity_ids, renaming the official ones.

    Two passes: the official entities are renamed first, then — once HA has
    actually released their old ids (the state lingers until the entity is
    re-added under its new id) — ours take them over.
    """
    ent_reg = er.async_get(hass)
    reserved: set[str] = set()
    renamed_official: dict[str, str] = {}

    for pair in pairs:
        new_official_id = _free_entity_id(
            hass, f"{pair.official_entity_id}_{OFFICIAL_SUFFIX}", reserved
        )
        reserved.add(new_official_id)
        renamed_official[pair.official_entity_id] = new_official_id
        changes: dict[str, object] = {"new_entity_id": new_official_id}
        if disable_official:
            changes["disabled_by"] = er.RegistryEntryDisabler.USER
        ent_reg.async_update_entity(pair.official_entity_id, **changes)
        _LOGGER.info(
            "Renamed official Music Assistant entity %s → %s%s",
            pair.official_entity_id,
            new_official_id,
            " (disabled)" if disable_official else "",
        )

    targets = [pair.official_entity_id for pair in pairs]
    async with asyncio.timeout(_RELEASE_TIMEOUT):
        while not all(hass.states.async_available(entity_id) for entity_id in targets):
            await asyncio.sleep(_RELEASE_POLL_INTERVAL)

    for pair in pairs:
        ent_reg.async_update_entity(pair.mml_entity_id, new_entity_id=pair.official_entity_id)
        _LOGGER.info("Renamed %s → %s", pair.mml_entity_id, pair.official_entity_id)

    _async_update_options(
        hass, {pair.mml_entity_id: pair.official_entity_id for pair in pairs}, renamed_official
    )


@callback
def _async_update_options(
    hass: HomeAssistant, renamed_mml: dict[str, str], renamed_official: dict[str, str]
) -> None:
    """Keep our own options pointing at the same players after the swap.

    - default player: one of ours, so it follows our renames only (a 3.x
      default player pointing at the official id now names our entity for the
      same player, which is what the user meant);
    - hidden players: may list ours and official ones, each follows its own
      rename (otherwise a hidden official player would hide ours instead).
    """
    for entry in hass.config_entries.async_entries(DOMAIN):
        options = dict(entry.options)
        default_player = options.get(CONF_DEFAULT_PLAYER)
        if default_player in renamed_mml:
            options[CONF_DEFAULT_PLAYER] = renamed_mml[default_player]
        if excluded := options.get(CONF_EXCLUDED_PLAYERS):
            options[CONF_EXCLUDED_PLAYERS] = [
                renamed_mml.get(entity_id, renamed_official.get(entity_id, entity_id))
                for entity_id in excluded
            ]
        if options != entry.options:
            hass.config_entries.async_update_entry(entry, options=options)
