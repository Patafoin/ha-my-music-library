"""Repairs fix flows for My Music Library."""
from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components.repairs import ConfirmRepairFlow, RepairsFlow
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult

from .duplicates import (
    ISSUE_DUPLICATE_ENTITIES,
    async_find_duplicates,
    async_find_references,
    async_swap_entity_ids,
    format_pairs,
)

CONF_DISABLE_OFFICIAL = "disable_official"


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


async def async_create_fix_flow(
    hass: HomeAssistant,
    issue_id: str,
    data: dict[str, str | int | float | None] | None,
) -> RepairsFlow:
    """Return the fix flow for an issue raised by this integration."""
    if issue_id == ISSUE_DUPLICATE_ENTITIES:
        return DuplicateEntitiesRepairFlow()
    return ConfirmRepairFlow()
