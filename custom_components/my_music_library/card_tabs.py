"""Exposed cards (4.20.0): one `select` entity per card, holding the tab it shows.

A card configured with `card_id` + `expose_tab: true` declares its panel tabs
here (WebSocket `card_tab/register`). We keep them in a Store, so the entity
`select.mml_<card_id>_tab` is created again at startup, before any card
connects. Its state is the tab last shown by any card of that `card_id`:

- a card changing tab calls `card_tab/set`, which goes through the standard
  `select.select_option` action with the WebSocket user's context, so the state
  change carries that user's id (automations can tell who changed tab);
- `select.select_option` from a button, script or automation is pushed to every
  card subscribed to that `card_id` (`card_tab/subscribe`), whatever its origin.

The state means "last tab shown", not "someone is looking": it is restored
after a restart (RestoreEntity, see select.py).

Any authenticated user may register a card (tablets are not administrators):
the card_id format and a cap per config entry (MAX_EXPOSED_CARDS) bound what
they can create. Exposed cards are removed from the integration's options.
"""
from __future__ import annotations

import logging
import re
from collections.abc import Callable
from typing import TYPE_CHECKING, Any

import voluptuous as vol
from homeassistant.components.websocket_api import (
    ActiveConnection,
    async_response,
    event_message,
    websocket_command,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.storage import Store

from .const import DOMAIN

if TYPE_CHECKING:
    from homeassistant.helpers.entity_platform import EntityPlatform

    from .select import CardTabSelect

_LOGGER = logging.getLogger(__name__)

# card_id goes into an entity_id (select.mml_<card_id>_tab): no dash.
CARD_ID_RE = re.compile(r"^[a-z0-9_]{1,32}$")
# Same format as an explicit tab `id` on the card (auto ids such as "library-1" match it too).
TAB_ID_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,31}$")
MAX_EXPOSED_CARDS = 20
MAX_TABS = 50
MAX_LABEL_LENGTH = 100

STORE_KEY = f"{DOMAIN}_card_tabs"
STORE_VERSION = 1

WS_CARD_TAB_REGISTER = f"{DOMAIN}/card_tab/register"
WS_CARD_TAB_SET = f"{DOMAIN}/card_tab/set"
WS_CARD_TAB_SUBSCRIBE = f"{DOMAIN}/card_tab/subscribe"

ERR_NOT_LOADED = "not_loaded"
ERR_NOT_FOUND = "not_found"
ERR_TOO_MANY = "too_many_cards"
ERR_INVALID_TAB = "invalid_tab"


def entity_id_for(card_id: str) -> str:
    """The entity_id a card_id is given when its entity is created."""
    return f"select.mml_{card_id}_tab"


def unique_id_for(card_id: str) -> str:
    """Unique id of a card's select entity."""
    return f"card_tab_{card_id}"


def _signal(card_id: str) -> str:
    return f"{DOMAIN}_card_tab_{card_id}"


def _clean_tabs(tabs: list[dict[str, Any]]) -> list[dict[str, str]]:
    """Tabs as stored: valid ids only, first occurrence of an id kept, labels trimmed."""
    seen: set[str] = set()
    cleaned: list[dict[str, str]] = []
    for tab in tabs:
        tab_id = tab["id"]
        if tab_id in seen:
            continue
        seen.add(tab_id)
        cleaned.append({"id": tab_id, "label": str(tab.get("label") or "")[:MAX_LABEL_LENGTH]})
    return cleaned


class CardTabs:
    """Exposed cards of the config entry: Store, entities, subscribers."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY)
        self.cards: dict[str, list[dict[str, str]]] = {}
        self.entities: dict[str, CardTabSelect] = {}
        self._platform: EntityPlatform | None = None

    async def async_load(self) -> None:
        stored = await self._store.async_load() or {}
        cards = stored.get("cards", {})
        self.cards = {
            card_id: _clean_tabs(tabs)
            for card_id, tabs in cards.items()
            if CARD_ID_RE.match(card_id) and isinstance(tabs, list)
        }

    @callback
    def _async_save(self) -> None:
        self._store.async_delay_save(lambda: {"cards": self.cards}, 1)

    # ── select platform ──

    @property
    def loaded(self) -> bool:
        """True while the select platform is set up (entities can be created)."""
        return self._platform is not None

    async def async_attach(self, platform: EntityPlatform) -> None:
        """Called by the select platform: create the stored cards' entities."""
        from .select import (
            CardTabSelect,  # noqa: PLC0415  (select.py imports this module)
        )

        self._platform = platform
        await platform.async_add_entities(
            [CardTabSelect(self, card_id, tabs) for card_id, tabs in self.cards.items()]
        )

    @callback
    def async_detach(self) -> None:
        self._platform = None

    @callback
    def async_entity_added(self, entity: CardTabSelect) -> None:
        self.entities[entity.card_id] = entity

    @callback
    def async_entity_removed(self, entity: CardTabSelect) -> None:
        if self.entities.get(entity.card_id) is entity:
            del self.entities[entity.card_id]

    @callback
    def async_notify(self, card_id: str, tab: str | None) -> None:
        """Push the tab to the cards subscribed to card_id."""
        async_dispatcher_send(self.hass, _signal(card_id), tab)

    # ── cards ──

    async def async_register(self, card_id: str, tabs: list[dict[str, Any]]) -> CardTabSelect:
        """Create the card's entity, or update its options. Raises HomeAssistantError (code in args[0])."""
        if self._platform is None:
            raise HomeAssistantError(ERR_NOT_LOADED)
        cleaned = _clean_tabs(tabs)
        if card_id not in self.cards and len(self.cards) >= MAX_EXPOSED_CARDS:
            raise HomeAssistantError(ERR_TOO_MANY)
        previous = self.cards.get(card_id)
        if previous != cleaned:
            if previous is not None:
                # Two browsers with different configurations for one card_id: the last one wins.
                _LOGGER.debug("Exposed card %s: tabs changed %s -> %s", card_id, previous, cleaned)
            self.cards[card_id] = cleaned
            self._async_save()
        entity = self.entities.get(card_id)
        if entity is None:
            from .select import CardTabSelect  # noqa: PLC0415

            entity = CardTabSelect(self, card_id, cleaned)
            # Awaited: the entity is in the state machine (restored state included) on return.
            await self._platform.async_add_entities([entity])
            if self.entities.get(card_id) is not entity:
                raise HomeAssistantError(ERR_NOT_LOADED)
        elif previous != cleaned:
            entity.async_set_tabs(cleaned)
        return entity

    async def async_remove(self, card_id: str) -> None:
        """Forget an exposed card: entity (registry included) and Store entry."""
        registry = er.async_get(self.hass)
        if entity_id := registry.async_get_entity_id("select", DOMAIN, unique_id_for(card_id)):
            registry.async_remove(entity_id)
        elif (entity := self.entities.get(card_id)) is not None:
            await entity.async_remove()
        self.entities.pop(card_id, None)
        if self.cards.pop(card_id, None) is not None:
            self._async_save()

    async def async_remove_store(self) -> None:
        """The config entry is deleted: drop the Store file too."""
        self.cards = {}
        await self._store.async_remove()


def get_card_tabs(hass: HomeAssistant) -> CardTabs | None:
    return hass.data.get(DOMAIN, {}).get("card_tabs")


def _card_tabs_or_error(hass: HomeAssistant, connection: ActiveConnection, msg_id: int) -> CardTabs | None:
    manager = get_card_tabs(hass)
    if manager is None or not manager.loaded:
        connection.send_error(msg_id, ERR_NOT_LOADED, "My Music Library is not loaded")
        return None
    return manager


_CARD_ID = vol.All(str, vol.Match(CARD_ID_RE))
_TAB_ID = vol.All(str, vol.Match(TAB_ID_RE))


@websocket_command(
    {
        vol.Required("type"): WS_CARD_TAB_REGISTER,
        vol.Required("card_id"): _CARD_ID,
        vol.Required("tabs"): vol.All(
            [{vol.Required("id"): _TAB_ID, vol.Optional("label"): vol.Any(None, str)}],
            vol.Length(min=1, max=MAX_TABS),
        ),
    }
)
@async_response
async def ws_card_tab_register(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    """Create or update the card's entity; returns its entity_id and current tab (None: no valid state)."""
    if (manager := _card_tabs_or_error(hass, connection, msg["id"])) is None:
        return
    try:
        entity = await manager.async_register(msg["card_id"], msg["tabs"])
    except HomeAssistantError as err:
        code = str(err.args[0]) if err.args else ERR_NOT_LOADED
        message = (
            f"At most {MAX_EXPOSED_CARDS} exposed cards: remove one in the integration's options"
            if code == ERR_TOO_MANY
            else "My Music Library is not loaded"
        )
        connection.send_error(msg["id"], code, message)
        return
    connection.send_result(
        msg["id"],
        {"entity_id": entity.entity_id, "tab": entity.current_option, "options": entity.options},
    )


@websocket_command(
    {
        vol.Required("type"): WS_CARD_TAB_SET,
        vol.Required("card_id"): _CARD_ID,
        vol.Required("tab"): str,
    }
)
@async_response
async def ws_card_tab_set(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    """The card shows another tab: `select.select_option` with this user's context."""
    if (manager := _card_tabs_or_error(hass, connection, msg["id"])) is None:
        return
    entity = manager.entities.get(msg["card_id"])
    if entity is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, f"No exposed card {msg['card_id']}")
        return
    try:
        await hass.services.async_call(
            "select",
            "select_option",
            {"entity_id": entity.entity_id, "option": msg["tab"]},
            blocking=True,
            context=connection.context(msg),
        )
    except ServiceValidationError as err:
        connection.send_error(msg["id"], ERR_INVALID_TAB, str(err))
        return
    connection.send_result(msg["id"])


@websocket_command({vol.Required("type"): WS_CARD_TAB_SUBSCRIBE, vol.Required("card_id"): _CARD_ID})
@callback
def ws_card_tab_subscribe(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    """Stream `{tab}` to the card: the current tab first, then every change, whatever its origin."""

    @callback
    def _forward(tab: str | None) -> None:
        connection.send_message(event_message(msg["id"], {"tab": tab}))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, _signal(msg["card_id"]), _forward)
    connection.send_result(msg["id"])
    manager = get_card_tabs(hass)
    entity = manager.entities.get(msg["card_id"]) if manager else None
    _forward(entity.current_option if entity else None)


WS_COMMANDS: tuple[Callable[..., Any], ...] = (ws_card_tab_register, ws_card_tab_set, ws_card_tab_subscribe)
