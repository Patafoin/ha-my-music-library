"""My Music Library — Home Assistant Integration."""
from __future__ import annotations

import logging
import os
from typing import Any

import voluptuous as vol

from homeassistant.components.http import StaticPathConfig
from homeassistant.helpers.storage import Store
from homeassistant.components.websocket_api import (
    ActiveConnection,
    async_register_command,
    websocket_command,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady

from .api import MusicAssistantBrowseView, MusicAssistantLibraryView, MusicAssistantProvidersView, MusicAssistantSearchView, MusicAssistantSubitemsView, PlayerGroupView, PlayerQueueJumpView, PlayerQueueView
from .const import CARD_JS_FILENAME, CARD_URL, CONF_EXCLUDED_PLAYERS, CONF_MA_URL, DOMAIN, ICON_URL, MUSIC_ASSISTANT_DOMAIN, WS_CONFIG_COMMAND

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[str] = []

WWW_DIR = os.path.join(os.path.dirname(__file__), "www")
ICON_PATH = os.path.join(os.path.dirname(__file__), "brand", "icon.png")

_QUEUE_STORE_KEY = f"{DOMAIN}_queues"
_QUEUE_STORE_VERSION = 1


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the My Music Library component."""
    hass.data.setdefault(DOMAIN, {})
    # Load persisted per-player queues from disk
    store = Store(hass, _QUEUE_STORE_VERSION, _QUEUE_STORE_KEY)
    stored = await store.async_load() or {}
    hass.data[DOMAIN]["queue_store"] = store
    hass.data[DOMAIN]["queues"] = stored.get("queues", {})
    hass.data[DOMAIN]["groups"] = stored.get("groups", {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up My Music Library from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Serve the card JS file from /my_music_library/<filename>
    card_js_path = os.path.join(WWW_DIR, CARD_JS_FILENAME)
    if not os.path.isfile(card_js_path):
        _LOGGER.error("Card JS file not found: %s", card_js_path)
        raise ConfigEntryNotReady(f"Missing frontend file: {card_js_path}")

    # Guard against double-registration (HA may call setup_entry on reload/restart)
    registered_paths: set[str] = hass.data[DOMAIN].setdefault("_registered_paths", set())

    static_registrations: list[StaticPathConfig] = []
    if CARD_URL not in registered_paths:
        static_registrations.append(StaticPathConfig(CARD_URL, card_js_path, cache_headers=False))
        registered_paths.add(CARD_URL)
        _LOGGER.debug("Registered static path %s -> %s", CARD_URL, card_js_path)
    else:
        _LOGGER.debug("Static path already registered, skipping: %s", CARD_URL)

    if ICON_URL not in registered_paths and os.path.isfile(ICON_PATH):
        static_registrations.append(StaticPathConfig(ICON_URL, ICON_PATH, cache_headers=False))
        registered_paths.add(ICON_URL)
        _LOGGER.debug("Registered icon static path %s -> %s", ICON_URL, ICON_PATH)

    if static_registrations:
        await hass.http.async_register_static_paths(static_registrations)

    # Primary: inject JS on every page via the frontend module list.
    # frontend is a hard dependency so this is always safe to call.
    from homeassistant.components.frontend import add_extra_js_url  # noqa: PLC0415
    add_extra_js_url(hass, CARD_URL)
    _LOGGER.debug("Card registered via add_extra_js_url: %s", CARD_URL)

    # Secondary: also register as a Lovelace resource for Cast / companion apps.
    # lovelace is a hard dependency so hass.data["lovelace"] is guaranteed here.
    await _async_register_lovelace_resource(hass, CARD_URL)

    # Register HTTP proxy views (search + library + subitems → MA server)
    hass.http.register_view(MusicAssistantSearchView)
    hass.http.register_view(MusicAssistantLibraryView)
    hass.http.register_view(MusicAssistantSubitemsView)
    hass.http.register_view(PlayerQueueView)
    hass.http.register_view(PlayerQueueJumpView)
    hass.http.register_view(PlayerGroupView)
    hass.http.register_view(MusicAssistantBrowseView)
    hass.http.register_view(MusicAssistantProvidersView)

    # Register WebSocket command so the card can fetch its config
    _register_websocket_commands(hass)

    hass.data[DOMAIN][entry.entry_id] = {"entry": entry}

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)

    return unload_ok


def _register_websocket_commands(hass: HomeAssistant) -> None:
    """Register WebSocket commands exposed to the frontend card."""

    @websocket_command({vol.Required("type"): WS_CONFIG_COMMAND})
    def ws_get_config(
        hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
    ) -> None:
        """Return the integration config to the card."""
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_result(msg["id"], {"ma_url": None})
            return

        entry = entries[0]
        # Find the Music Assistant config entry so the card can call MA's WS commands
        ma_entries = hass.config_entries.async_entries(MUSIC_ASSISTANT_DOMAIN)
        ma_entry_id = ma_entries[0].entry_id if ma_entries else None

        connection.send_result(
            msg["id"],
            {
                "ma_url": entry.data.get(CONF_MA_URL) or None,
                "ma_entry_id": ma_entry_id,
                "default_player": entry.data.get("default_player") or None,
                "default_tab": entry.data.get("default_tab", "player"),
                "excluded_players": list(entry.options.get(CONF_EXCLUDED_PLAYERS, [])),
            },
        )

    async_register_command(hass, ws_get_config)
    _LOGGER.debug("Registered WebSocket command: %s", WS_CONFIG_COMMAND)


async def _async_register_lovelace_resource(hass: HomeAssistant, url: str) -> None:
    """Add the card JS as a Lovelace resource (for Cast / companion app support).

    The primary injection is done via add_extra_js_url() in async_setup_entry.
    This function adds a persisted Lovelace resource entry so the card also
    works in Cast and companion app contexts.
    """
    try:
        lovelace = hass.data.get("lovelace")
        if lovelace is None:
            return

        if hasattr(lovelace, "resources"):
            resources = lovelace.resources
        elif isinstance(lovelace, dict):
            resources = lovelace.get("resources")
        else:
            return

        if resources is None:
            return

        await resources.async_load()

        for r in resources.async_items():
            r_url = r.get("url", "") if isinstance(r, dict) else getattr(r, "url", "")
            if r_url.startswith(url):
                _LOGGER.debug("Lovelace resource already registered: %s", url)
                return

        if callable(getattr(resources, "async_create_item", None)):
            await resources.async_create_item({"res_type": "module", "url": url})
            _LOGGER.info("Lovelace resource registered (storage mode): %s", url)
        elif isinstance(getattr(resources, "data", None), list):
            resources.data.append({"type": "module", "url": url})

    except Exception:  # noqa: BLE001
        _LOGGER.debug("Lovelace resource registration skipped for %s (non-critical)", url)
