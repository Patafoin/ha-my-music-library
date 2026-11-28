"""select platform: the tab shown by an exposed card (card_tabs.py)."""
from __future__ import annotations

from typing import Any

from homeassistant.components.select import SelectEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import (
    AddEntitiesCallback,
    async_get_current_platform,
)
from homeassistant.helpers.restore_state import RestoreEntity

from .card_tabs import CardTabs, entity_id_for, get_card_tabs, unique_id_for
from .mass_connection import MyMusicLibraryConfigEntry


async def async_setup_entry(
    hass: HomeAssistant,
    entry: MyMusicLibraryConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Create the entities of the exposed cards kept in the Store; later ones come from the cards."""
    manager = get_card_tabs(hass)
    if manager is None:
        return
    entry.async_on_unload(manager.async_detach)
    await manager.async_attach(async_get_current_platform())


class CardTabSelect(SelectEntity, RestoreEntity):
    """`select.mml_<card_id>_tab`: state = id of the tab last shown by the cards of that card_id."""

    _attr_has_entity_name = True
    _attr_translation_key = "card_tab"
    _attr_should_poll = False
    _attr_icon = "mdi:tab"

    def __init__(self, manager: CardTabs, card_id: str, tabs: list[dict[str, str]]) -> None:
        self._manager = manager
        self.card_id = card_id
        # Requested entity_id: kept by the entity registry afterwards (the user may rename it).
        self.entity_id = entity_id_for(card_id)
        self._attr_unique_id = unique_id_for(card_id)
        self._attr_translation_placeholders = {"card_id": card_id}
        self._attr_current_option = None
        self._set_tabs(tabs)

    def _set_tabs(self, tabs: list[dict[str, str]]) -> None:
        self._attr_options = [tab["id"] for tab in tabs]
        self._labels = {tab["id"]: tab["label"] for tab in tabs if tab.get("label")}

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"card_id": self.card_id, "tab_labels": dict(self._labels)}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if (last := await self.async_get_last_state()) is not None and last.state in self.options:
            self._attr_current_option = last.state
        self._manager.async_entity_added(self)

    async def async_will_remove_from_hass(self) -> None:
        self._manager.async_entity_removed(self)
        await super().async_will_remove_from_hass()

    async def async_select_option(self, option: str) -> None:
        """Card (card_tab/set), button, script or automation: every card of this card_id follows."""
        self._attr_current_option = option
        self.async_write_ha_state()
        self._manager.async_notify(self.card_id, option)

    @callback
    def async_set_tabs(self, tabs: list[dict[str, str]]) -> None:
        """New tab list from a card; a current tab that is gone leaves the state unknown."""
        self._set_tabs(tabs)
        changed = self._attr_current_option is not None and self._attr_current_option not in self.options
        if changed:
            self._attr_current_option = None
        self.async_write_ha_state()
        if changed:
            self._manager.async_notify(self.card_id, None)
