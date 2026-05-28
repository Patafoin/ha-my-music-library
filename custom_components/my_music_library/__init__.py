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
from homeassistant.loader import async_get_integration

from .api import ImageProxyView, MAQueueView, MusicAssistantBrowseView, MusicAssistantLibraryView, MusicAssistantProvidersView, MusicAssistantSearchView, MusicAssistantSubitemsView, PlayerGroupView, PlayerQueueJumpView, PlayerQueueView
from .const import CARD_JS_FILENAME, CARD_URL, CONF_DEBUG_MODE, CONF_EXCLUDED_PLAYERS, CONF_MA_URL, DOMAIN, ICON_URL, MUSIC_ASSISTANT_DOMAIN, WS_CONFIG_COMMAND

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[str] = []

WWW_DIR = os.path.join(os.path.dirname(__file__), "www")
ICON_PATH = os.path.join(os.path.dirname(__file__), "brand", "icon.png")

_QUEUE_STORE_KEY = f"{DOMAIN}_queues"
_QUEUE_STORE_VERSION = 1

_INTEGRATION_LOGGER = logging.getLogger("custom_components.my_music_library")


def _apply_debug_mode(debug: bool) -> None:
    """Set the integration logger level based on the debug_mode option."""
    _INTEGRATION_LOGGER.setLevel(logging.DEBUG if debug else logging.WARNING)
    _INTEGRATION_LOGGER.debug("Debug mode %s", "enabled" if debug else "disabled")


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

    # Build a versioned URL for reliable browser cache-busting, same principle as
    # HACS's ?hacstag= parameter.
    #
    # We deliberately do NOT use add_extra_js_url: that mechanism loads the module
    # independently of the Lovelace resource, and HA's scoped-custom-element-registry
    # polyfill causes customElements.define to be called twice even when both paths
    # use the same URL — triggering "already been used with this registry" errors.
    # The Lovelace resource mechanism is the standard approach for custom cards and
    # is sufficient (lovelace is a hard dependency so registration is guaranteed).
    integration = await async_get_integration(hass, DOMAIN)
    version = integration.manifest.get("version", "0")
    versioned_card_url = f"{CARD_URL}?v={version}"
    _LOGGER.debug("Setting up My Music Library v%s", version)

    await _async_register_lovelace_resource(hass, versioned_card_url, CARD_URL)

    # Register HTTP proxy views (search + library + subitems → MA server)
    hass.http.register_view(MusicAssistantSearchView)
    hass.http.register_view(MusicAssistantLibraryView)
    hass.http.register_view(MusicAssistantSubitemsView)
    hass.http.register_view(PlayerQueueView)
    hass.http.register_view(PlayerQueueJumpView)
    hass.http.register_view(MAQueueView)
    hass.http.register_view(PlayerGroupView)
    hass.http.register_view(MusicAssistantBrowseView)
    hass.http.register_view(MusicAssistantProvidersView)
    hass.http.register_view(ImageProxyView)

    # Register WebSocket command so the card can fetch its config
    _register_websocket_commands(hass)

    hass.data[DOMAIN][entry.entry_id] = {"entry": entry}

    _apply_debug_mode(entry.options.get(CONF_DEBUG_MODE, False))
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def _async_options_updated(
    hass: HomeAssistant, entry: ConfigEntry
) -> None:
    """React to options changes (debug toggle, excluded players, etc.)."""
    _apply_debug_mode(entry.options.get(CONF_DEBUG_MODE, False))


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
                "debug_mode": bool(entry.options.get(CONF_DEBUG_MODE, False)),
            },
        )

    async_register_command(hass, ws_get_config)
    _LOGGER.debug("Registered WebSocket command: %s", WS_CONFIG_COMMAND)


async def _async_register_lovelace_resource(
    hass: HomeAssistant, url: str, base_url: str
) -> None:
    """Add the card JS as a Lovelace resource (for Cast / companion app support).

    ``url``      — the versioned URL to register (e.g. /my_music_library/card.js?v=3.1.2)
    ``base_url`` — the fixed base path without query params (e.g. /my_music_library/card.js)

    Strategy — delete-then-add, never add-then-delete:
      1. Collect every existing Lovelace resource whose URL starts with ``base_url``
         (this matches the exact current URL, any previous versioned URL, and the
         plain unversioned URL used by 3.1.1).
      2. If the only existing entry is already the target ``url``, do nothing.
      3. Otherwise delete ALL collected entries first, then add the new ``url``.

    Deleting before adding ensures the browser never sees two different module
    versions in Lovelace storage at the same time, which would cause
    customElements.define to be called twice → "configuration error".
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

        # Collect all existing entries that belong to this card.
        existing: list[tuple[str, str]] = []  # (item_id, r_url)
        for r in resources.async_items():
            r_url = r.get("url", "") if isinstance(r, dict) else getattr(r, "url", "")
            if r_url == base_url or r_url.startswith(base_url + "?"):
                item_id = r.get("id") if isinstance(r, dict) else getattr(r, "id", None)
                if item_id:
                    existing.append((item_id, r_url))

        # Already perfectly registered — nothing to do.
        if len(existing) == 1 and existing[0][1] == url:
            _LOGGER.debug("Lovelace resource already registered: %s", url)
            return

        delete_fn = getattr(resources, "async_delete_item", None)
        create_fn = getattr(resources, "async_create_item", None)

        # If we have stale entries but cannot delete them, bail out entirely.
        # Adding the new URL alongside a stale one would make the browser load
        # two different module versions → customElements.define conflict → error.
        if existing and not callable(delete_fn):
            _LOGGER.debug(
                "Cannot clean up stale Lovelace resource(s) — skipping registration"
            )
            return

        # Delete ALL stale entries first.
        for item_id, old_url in existing:
            try:
                await delete_fn(item_id)
                _LOGGER.info("Removed old Lovelace resource %s (id=%s)", old_url, item_id)
            except Exception:  # noqa: BLE001
                # A deletion failed: abort to avoid a stale + new entry coexisting.
                _LOGGER.warning(
                    "Failed to remove Lovelace resource id=%s — aborting registration",
                    item_id,
                )
                return

        # Add the new versioned entry.
        if callable(create_fn):
            await create_fn({"res_type": "module", "url": url})
            _LOGGER.info("Lovelace resource registered: %s", url)
        else:
            # Fallback for very old HA builds without async_create_item.
            # Only reached when existing is empty (otherwise we returned above),
            # so there is no stale entry to collide with.
            data = getattr(resources, "data", None)
            if isinstance(data, list):
                if not any(
                    (r.get("url") if isinstance(r, dict) else getattr(r, "url", "")) == url
                    for r in data
                ):
                    data.append({"type": "module", "url": url})

    except Exception:  # noqa: BLE001
        _LOGGER.debug("Lovelace resource registration skipped for %s (non-critical)", url)
