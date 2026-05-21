"""Test configuration and fixtures for My Music Library."""
from __future__ import annotations

import sys
import types
from unittest.mock import AsyncMock, MagicMock


def _stub_homeassistant() -> None:
    """Create minimal homeassistant stubs so tests run without HA installed."""
    if "homeassistant" in sys.modules:
        return

    def _make_module(name: str) -> types.ModuleType:
        mod = types.ModuleType(name)
        sys.modules[name] = mod
        return mod

    ha = _make_module("homeassistant")
    core = _make_module("homeassistant.core")
    core.HomeAssistant = MagicMock  # type: ignore[attr-defined]
    core.callback = lambda fn: fn  # type: ignore[attr-defined]

    cfg_entries = _make_module("homeassistant.config_entries")

    class _ConfigFlow:
        HANDLER = None
        VERSION = 1

        def __init_subclass__(cls, domain: str | None = None, **kw: object) -> None:
            super().__init_subclass__(**kw)
            if domain:
                cls.HANDLER = domain

        async def async_step_user(self, user_input=None):
            ...

        async def async_set_unique_id(self, uid):
            ...

        def _abort_if_unique_id_configured(self):
            ...

        def async_show_form(self, **kw):
            return {"type": "form", **kw}

        def async_create_entry(self, **kw):
            return {"type": "create_entry", **kw}

    class _OptionsFlow:
        config_entry: MagicMock = MagicMock()

        def async_show_form(self, **kw):
            return {"type": "form", **kw}

        def async_create_entry(self, **kw):
            return {"type": "create_entry", **kw}

    cfg_entries.ConfigFlow = _ConfigFlow  # type: ignore[attr-defined]
    cfg_entries.OptionsFlow = _OptionsFlow  # type: ignore[attr-defined]
    cfg_entries.ConfigEntry = MagicMock  # type: ignore[attr-defined]
    cfg_entries.ConfigFlowResult = dict  # type: ignore[attr-defined]

    exceptions = _make_module("homeassistant.exceptions")

    class _ConfigEntryNotReady(Exception):
        pass

    exceptions.ConfigEntryNotReady = _ConfigEntryNotReady  # type: ignore[attr-defined]

    helpers = _make_module("homeassistant.helpers")
    helpers_er = _make_module("homeassistant.helpers.entity_registry")
    helpers_aiohttp = _make_module("homeassistant.helpers.aiohttp_client")
    helpers_aiohttp.async_get_clientsession = MagicMock()  # type: ignore[attr-defined]
    helpers_er.async_get = MagicMock()  # type: ignore[attr-defined]
    helpers_storage = _make_module("homeassistant.helpers.storage")

    class _StoreStub:
        def __init__(self, *args, **kwargs) -> None:
            pass
        async def async_load(self):
            return None
        async def async_save(self, data: object) -> None:
            pass

    helpers_storage.Store = _StoreStub  # type: ignore[attr-defined]
    helpers_selector = _make_module("homeassistant.helpers.selector")
    helpers_selector.SelectSelector = MagicMock  # type: ignore[attr-defined]
    helpers_selector.SelectSelectorConfig = MagicMock  # type: ignore[attr-defined]
    helpers_selector.SelectSelectorMode = MagicMock  # type: ignore[attr-defined]

    components = _make_module("homeassistant.components")

    frontend_mod = _make_module("homeassistant.components.frontend")
    frontend_mod.add_extra_js_url = MagicMock()  # type: ignore[attr-defined]

    # aiohttp stubs (used in api.py)
    aiohttp_mod = _make_module("aiohttp")
    aiohttp_mod.web = MagicMock()  # type: ignore[attr-defined]
    http_mod = _make_module("homeassistant.components.http")
    http_mod.StaticPathConfig = MagicMock  # type: ignore[attr-defined]
    http_mod.HomeAssistantView = MagicMock  # type: ignore[attr-defined]
    ws_mod = _make_module("homeassistant.components.websocket_api")
    ws_mod.async_register_command = MagicMock()  # type: ignore[attr-defined]
    ws_mod.websocket_command = lambda schema: (lambda fn: fn)  # type: ignore[attr-defined]
    ws_mod.ActiveConnection = MagicMock  # type: ignore[attr-defined]

    # Do NOT stub voluptuous — the real package is installed and should be used


_stub_homeassistant()

# Only load the HA test plugin if it's installed (requires Python 3.12 + HA)
try:
    import pytest_homeassistant_custom_component  # noqa: F401
    pytest_plugins = "pytest_homeassistant_custom_component"
except ImportError:
    pass

import pytest  # noqa: E402


@pytest.fixture
def mock_hass():
    """Return a mock HomeAssistant instance."""
    hass = MagicMock()
    hass.data = {}
    hass.states = MagicMock()
    hass.config_entries = MagicMock()
    hass.config_entries.async_forward_entry_setups = AsyncMock(return_value=True)
    hass.config_entries.async_unload_platforms = AsyncMock(return_value=True)
    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock()
    return hass


@pytest.fixture
def mock_config_entry():
    """Return a mock ConfigEntry."""
    entry = MagicMock()
    entry.entry_id = "test_entry_id"
    entry.data = {"default_player": "", "default_tab": "player"}
    return entry
