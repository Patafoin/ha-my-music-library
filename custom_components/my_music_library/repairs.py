"""Repairs fix flows for My Music Library."""
from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components.repairs import ConfirmRepairFlow, RepairsFlow
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN
from .duplicates import (
    ISSUE_DUPLICATE_ENTITIES,
    async_find_duplicates,
    async_find_references,
    async_swap_entity_ids,
    format_pairs,
)
from .missing_players import (
    ISSUE_MISSING_PLAYERS,
    async_find_missing,
    async_remove_player,
    format_missing,
)

CONF_DISABLE_OFFICIAL = "disable_official"
CONF_PLAYERS = "players"


class DuplicateEntitiesRepairFlow(RepairsFlow):
    """Swap entity_ids so our media_players get the original ones."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Entry point of the fix flow."""
        return await self.async_step_confirm()

    async def async_step_confirm(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Show what will be renamed, and which automations/scripts are affected."""
        # Re-computed on each step: entities may have changed since the issue was raised.
        pairs = async_find_duplicates(self.hass)
        if not pairs:
            return self.async_abort(reason="no_duplicates")

        if user_input is not None:
            await async_swap_entity_ids(
                self.hass, pairs, bool(user_input.get(CONF_DISABLE_OFFICIAL, False))
            )
            return self.async_create_entry(data={})

        references = async_find_references(
            self.hass, [pair.official_entity_id for pair in pairs]
        )
        return self.async_show_form(
            step_id="confirm",
            data_schema=vol.Schema({vol.Optional(CONF_DISABLE_OFFICIAL, default=False): bool}),
            description_placeholders={
                "entities": format_pairs(pairs),
                "references": "\n".join(f"- `{ref}`" for ref in references) or "-",
            },
        )


class MissingPlayersRepairFlow(RepairsFlow):
    """Delete the media_players whose Music Assistant player is gone."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Entry point of the fix flow."""
        return await self.async_step_confirm()

    async def async_step_confirm(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Let the user tick the players to delete (all by default)."""
        entries = self.hass.config_entries.async_loaded_entries(DOMAIN)
        if not entries:
            return self.async_abort(reason="not_connected")
        entry = entries[0]
        # Re-computed on each step: a player may have come back since the issue was raised.
        players = {player.player_id: player for player in async_find_missing(self.hass, entry)}
        if not players:
            return self.async_abort(reason="no_missing_players")

        if user_input is not None:
            for player_id in user_input.get(CONF_PLAYERS, []):
                if player_id in players:
                    async_remove_player(self.hass, entry, player_id)
            return self.async_create_entry(data={})

        choices = {
            player_id: f"{player.name} ({player.entity_id})" for player_id, player in players.items()
        }
        return self.async_show_form(
            step_id="confirm",
            data_schema=vol.Schema(
                {vol.Optional(CONF_PLAYERS, default=list(choices)): cv.multi_select(choices)}
            ),
            description_placeholders={"players": format_missing(list(players.values()))},
        )


async def async_create_fix_flow(
    hass: HomeAssistant,
    issue_id: str,
    data: dict[str, str | int | float | None] | None,
) -> RepairsFlow:
    """Return the fix flow for an issue raised by this integration."""
    if issue_id == ISSUE_DUPLICATE_ENTITIES:
        return DuplicateEntitiesRepairFlow()
    if issue_id == ISSUE_MISSING_PLAYERS:
        return MissingPlayersRepairFlow()
    return ConfirmRepairFlow()
