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
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import Event, HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import issue_registry as ir
from homeassistant.loader import async_get_integration

from .api import ImageProxyView, MAThumbnailView, MAQueueView, MusicAssistantBrowseView, MusicAssistantLibraryView, MusicAssistantProvidersView, MusicAssistantRecommendationsView, MusicAssistantSearchView, MusicAssistantSubitemsView, OutputsView, PlayerQueueJumpView, PlayerQueueView
from .const import CARD_JS_FILENAME, CARD_URL, CONF_DEBUG_MODE, CONF_DEFAULT_PLAYER, CONF_DEFAULT_TAB, CONF_EXCLUDED_PLAYERS, CONF_MA_URL, CONFIG_ENTRY_VERSION, DEFAULT_TAB, DOMAIN, ICON_URL, WS_CONFIG_COMMAND, WS_SUBSCRIBE_QUEUE_COMMAND
from .duplicates import ISSUE_DUPLICATE_ENTITIES, async_track_duplicates, async_update_issue
from .mass_connection import MyMusicLibraryConfigEntry, async_connect, async_disconnect
from .missing_players import async_track_missing
from .queue_push import async_relay_queue_events, ws_subscribe_queue
from .queue_watchdog import QueueWatchdog

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[str] = ["media_player"]

WWW_DIR = os.path.join(os.path.dirname(__file__), "www")
ICON_PATH = os.path.join(os.path.dirname(__file__), "brand", "icon.png")

_QUEUE_STORE_KEY = f"{DOMAIN}_queues"
_QUEUE_STORE_VERSION = 1

_INTEGRATION_LOGGER = logging.getLogger("custom_components.my_music_library")

# Level the integration logger had before debug mode forced it to DEBUG
# (None while debug mode is off). Restored when debug mode is turned off, so
# the user's `logger:` configuration in configuration.yaml applies again.
_level_before_debug: int | None = None


def _apply_debug_mode(debug: bool) -> None:
    """Force DEBUG while the debug_mode option is on; otherwise leave the level alone.

    Debug off never sets a level of its own: whatever `logger:` (or the
    `logger.set_level` action) configured for custom_components.my_music_library
    stays in effect.
    """
    global _level_before_debug
    if debug:
        if _level_before_debug is None:
            _level_before_debug = _INTEGRATION_LOGGER.level
        _INTEGRATION_LOGGER.setLevel(logging.DEBUG)
        _INTEGRATION_LOGGER.debug("Debug mode enabled")
    elif _level_before_debug is not None:
        _INTEGRATION_LOGGER.debug("Debug mode disabled")
        _INTEGRATION_LOGGER.setLevel(_level_before_debug)
        _level_before_debug = None


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the My Music Library component."""
    hass.data.setdefault(DOMAIN, {})
    # Load persisted per-player queues from disk
    store = Store(hass, _QUEUE_STORE_VERSION, _QUEUE_STORE_KEY)
    stored = await store.async_load() or {}
    hass.data[DOMAIN]["queue_store"] = store
    hass.data[DOMAIN]["queues"] = stored.get("queues", {})
    # "groups" (card-side copy of group members, < 4.8.0) is dropped: MA is the source of truth.
    hass.data[DOMAIN]["presets"] = stored.get("presets", [])
    return True


async def async_save_store(hass: HomeAssistant) -> None:
    """Persist the per-player queues and the group presets."""
    domain_data = hass.data.get(DOMAIN, {})
    if store := domain_data.get("queue_store"):
        await store.async_save({
            "queues": domain_data.get("queues", {}),
            "presets": domain_data.get("presets", []),
        })


async def async_setup_entry(hass: HomeAssistant, entry: MyMusicLibraryConfigEntry) -> bool:
    """Set up My Music Library from a config entry.

    Card serving, HTTP views and the WS config command are registered FIRST and
    are independent of the Music Assistant connection succeeding: the card must
    always be able to load and ask "am I connected?" — including right after a
    failed/expired-token setup — so it can show a clear "needs reconfiguration"
    message instead of just going blank. Only the media_player platform (which
    needs a live client) depends on the connection below.
    """
    hass.data.setdefault(DOMAIN, {})

    # Serve the card JS file from /my_music_library/<filename>
    card_js_path = os.path.join(WWW_DIR, CARD_JS_FILENAME)
    if not os.path.isfile(card_js_path):
        _LOGGER.error("Card JS file not found: %s", card_js_path)
        raise ConfigEntryNotReady(f"Missing frontend file: {card_js_path}")

    # Guard against double-registration (HA may call setup_entry on reload —
    # including our own auto-reload-on-disconnect in mass_connection.py)
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

    # Register HTTP proxy views + WS config command once per HA process lifetime
    # (guarded the same way as the static paths above, for the same reload reason).
    if not hass.data[DOMAIN].get("_views_registered"):
        hass.http.register_view(MusicAssistantSearchView)
        hass.http.register_view(MusicAssistantLibraryView)
        hass.http.register_view(MusicAssistantSubitemsView)
        hass.http.register_view(PlayerQueueView)
        hass.http.register_view(PlayerQueueJumpView)
        hass.http.register_view(MAQueueView)
        hass.http.register_view(OutputsView)
        hass.http.register_view(MusicAssistantBrowseView)
        hass.http.register_view(MusicAssistantRecommendationsView)
        hass.http.register_view(MusicAssistantProvidersView)
        hass.http.register_view(ImageProxyView)
        hass.http.register_view(MAThumbnailView)
        _register_websocket_commands(hass)
        hass.data[DOMAIN]["_views_registered"] = True

    _apply_debug_mode(entry.options.get(CONF_DEBUG_MODE, False))
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))

    # From here on, failure raises ConfigEntryNotReady/ConfigEntryAuthFailed —
    # everything registered above stays in place so the card can still load and
    # report the "not connected" state via the WS config command.
    entry.runtime_data = await async_connect(hass, entry)

    async def _on_hass_stop(event: Event) -> None:
        await async_disconnect(entry.runtime_data)

    entry.async_on_unload(
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, _on_hass_stop)
    )

    # Push queue changes to the card (my_music_library/subscribe_queue).
    entry.async_on_unload(async_relay_queue_events(hass, entry.runtime_data.mass))
    # Resume queues Music Assistant leaves stopped after the first track (queue_watchdog.py).
    entry.async_on_unload(QueueWatchdog(hass, entry.runtime_data.mass).async_start())

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Duplicates with the official Music Assistant integration's media_players:
    # check now (the entity registry is already loaded from disk), then again on
    # every media_player registry change.
    async_update_issue(hass)
    entry.async_on_unload(async_track_duplicates(hass))
    # Our media_players whose MA player is gone (missing_players.py).
    entry.async_on_unload(async_track_missing(hass, entry))

    return True


async def async_migrate_entry(hass: HomeAssistant, entry: MyMusicLibraryConfigEntry) -> bool:
    """Migrate an old config entry to the current schema.

    Version 1 covers both 3.x entries (MA connection borrowed from `mass`,
    default player chosen in the setup step, so stored in `data`) and early
    4.x ones (URL + token in `data`, default player already in `options`).
    Version 2 keeps the default player in `options` only. A 3.x entry has no
    token yet: setup then raises ConfigEntryAuthFailed, which sends the user
    through the reauth step to enter one.
    """
    if entry.version > CONFIG_ENTRY_VERSION:
        # Downgrade from a newer, unknown schema.
        return False

    if entry.version == 1:
        data = dict(entry.data)
        options = dict(entry.options)
        legacy_player = data.pop(CONF_DEFAULT_PLAYER, None)
        if legacy_player and not options.get(CONF_DEFAULT_PLAYER):
            options[CONF_DEFAULT_PLAYER] = legacy_player
        hass.config_entries.async_update_entry(entry, data=data, options=options, version=2)
        _LOGGER.info("Migrated config entry %s to version 2", entry.entry_id)

    return True


async def _async_options_updated(
    hass: HomeAssistant, entry: MyMusicLibraryConfigEntry
) -> None:
    """React to options changes (debug toggle, excluded players, etc.)."""
    _apply_debug_mode(entry.options.get(CONF_DEBUG_MODE, False))


async def async_unload_entry(hass: HomeAssistant, entry: MyMusicLibraryConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        await async_disconnect(entry.runtime_data)
        ir.async_delete_issue(hass, DOMAIN, ISSUE_DUPLICATE_ENTITIES)
        # Don't leave the logger stuck at DEBUG once the integration is gone.
        _apply_debug_mode(False)

    return unload_ok


async def async_remove_config_entry_device(
    hass: HomeAssistant, entry: MyMusicLibraryConfigEntry, device_entry: dr.DeviceEntry
) -> bool:
    """Allow deleting a device from the UI once its Music Assistant player is gone.

    A player MA still knows would come straight back: it has to be removed in
    Music Assistant first.
    """
    if entry.state is not ConfigEntryState.LOADED:
        return False
    mass = entry.runtime_data.mass
    if not mass.connection.connected:
        return False
    return not any(
        domain == DOMAIN and mass.players.get(player_id) is not None
        for domain, player_id in device_entry.identifiers
    )


def _register_websocket_commands(hass: HomeAssistant) -> None:
    """Register WebSocket commands exposed to the frontend card."""

    @websocket_command({vol.Required("type"): WS_CONFIG_COMMAND})
    def ws_get_config(
        hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
    ) -> None:
        """Return the integration config to the card."""
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_result(msg["id"], {"ma_url": None, "connected": False})
            return

        entry = entries[0]

        connection.send_result(
            msg["id"],
            {
                "connected": entry.state == ConfigEntryState.LOADED,
                "ma_url": entry.data.get(CONF_MA_URL) or None,
                "default_player": entry.options.get(CONF_DEFAULT_PLAYER) or None,
                "default_tab": entry.data.get(CONF_DEFAULT_TAB, DEFAULT_TAB),
                "excluded_players": list(entry.options.get(CONF_EXCLUDED_PLAYERS, [])),
                "debug_mode": bool(entry.options.get(CONF_DEBUG_MODE, False)),
            },
        )

    async_register_command(hass, ws_get_config)
    async_register_command(hass, ws_subscribe_queue)
    _LOGGER.debug("Registered WebSocket commands: %s, %s", WS_CONFIG_COMMAND, WS_SUBSCRIBE_QUEUE_COMMAND)


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
