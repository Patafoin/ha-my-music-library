"""Config flow for My Music Library."""
from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

import voluptuous as vol
from music_assistant_client import MusicAssistantClient
from music_assistant_client.exceptions import CannotConnect, InvalidServerVersion
from music_assistant_models.errors import AuthenticationFailed, AuthenticationRequired, MusicAssistantError

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

from .const import (
    CONF_DEBUG_MODE,
    CONF_DEFAULT_PLAYER,
    CONF_DEFAULT_TAB,
    CONF_EXCLUDED_PLAYERS,
    CONF_MA_TOKEN,
    CONF_MA_URL,
    CONFIG_ENTRY_VERSION,
    DEFAULT_TAB,
    DOMAIN,
    NAME,
)


def _get_mml_players(hass: HomeAssistant) -> dict[str, str]:
    """Return {entity_id: friendly_name} for our own media_player entities."""
    ent_reg = er.async_get(hass)
    players: dict[str, str] = {}
    for entity in ent_reg.entities.values():
        if entity.platform == DOMAIN and entity.domain == "media_player" and not entity.disabled:
            state = hass.states.get(entity.entity_id)
            name = state.attributes.get("friendly_name", entity.entity_id) if state else entity.entity_id
            players[entity.entity_id] = name
    return players


def _get_all_players(hass: HomeAssistant) -> dict[str, str]:
    """Return {entity_id: friendly_name} for all non-unavailable media_player entities."""
    players: dict[str, str] = {}
    for state in hass.states.async_all("media_player"):
        if state.state != "unavailable":
            players[state.entity_id] = state.attributes.get("friendly_name", state.entity_id)
    return dict(sorted(players.items(), key=lambda x: x[1].lower()))


def _validate_url(url: str) -> str | None:
    """Return None if valid, or an error key if invalid."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            return "invalid_url"
    except Exception:  # noqa: BLE001
        return "invalid_url"
    return None


async def _test_connection(hass: HomeAssistant, url: str, token: str) -> str | None:
    """Try connecting to the MA server. Return None on success, else an error key."""
    session = async_get_clientsession(hass)
    mass = MusicAssistantClient(url, session, token=token)
    try:
        await mass.connect()
    except (AuthenticationRequired, AuthenticationFailed):
        return "invalid_auth"
    except InvalidServerVersion:
        return "invalid_server_version"
    except (CannotConnect, TimeoutError):
        return "cannot_connect"
    except MusicAssistantError:
        return "cannot_connect"
    else:
        await mass.disconnect()
        return None


class MyMusicLibraryConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for My Music Library."""

    VERSION = CONFIG_ENTRY_VERSION

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow handler."""
        return MyMusicLibraryOptionsFlow()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step: Music Assistant server URL + long-lived token."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        errors: dict[str, str] = {}

        if user_input is not None:
            url = user_input[CONF_MA_URL].rstrip("/")
            token = user_input[CONF_MA_TOKEN]
            if url_error := _validate_url(url):
                errors[CONF_MA_URL] = url_error
            else:
                error = await _test_connection(self.hass, url, token)
                if error:
                    errors["base"] = error
                else:
                    return self.async_create_entry(
                        title=NAME,
                        data={
                            CONF_MA_URL: url,
                            CONF_MA_TOKEN: token,
                            CONF_DEFAULT_TAB: user_input[CONF_DEFAULT_TAB],
                        },
                    )

        schema = vol.Schema(
            {
                vol.Required(CONF_MA_URL): TextSelector(TextSelectorConfig(type=TextSelectorType.URL)),
                vol.Required(CONF_MA_TOKEN): TextSelector(
                    TextSelectorConfig(type=TextSelectorType.PASSWORD)
                ),
                vol.Optional(CONF_DEFAULT_TAB, default=DEFAULT_TAB): vol.In(
                    {
                        "player": "Player",
                        "search": "Search",
                        "library": "Library",
                    }
                ),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
            description_placeholders={
                "ma_url_hint": "e.g. http://homeassistant.local:8095",
                "token_hint": (
                    "Generate a long-lived token in Music Assistant "
                    "(Settings → your user → API tokens) and paste it here."
                ),
            },
        )

    async def async_step_reauth(
        self, entry_data: dict[str, Any]
    ) -> ConfigFlowResult:
        """Handle reauth when the stored token is missing, revoked, or the URL changed."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Ask for a fresh URL + token and update the existing entry."""
        errors: dict[str, str] = {}
        reauth_entry = self._get_reauth_entry()

        if user_input is not None:
            url = user_input[CONF_MA_URL].rstrip("/")
            token = user_input[CONF_MA_TOKEN]
            if url_error := _validate_url(url):
                errors[CONF_MA_URL] = url_error
            else:
                error = await _test_connection(self.hass, url, token)
                if error:
                    errors["base"] = error
                else:
                    return self.async_update_reload_and_abort(
                        reauth_entry,
                        data={**reauth_entry.data, CONF_MA_URL: url, CONF_MA_TOKEN: token},
                    )

        schema = vol.Schema(
            {
                vol.Required(CONF_MA_URL, default=reauth_entry.data.get(CONF_MA_URL, "")): TextSelector(
                    TextSelectorConfig(type=TextSelectorType.URL)
                ),
                vol.Required(CONF_MA_TOKEN): TextSelector(
                    TextSelectorConfig(type=TextSelectorType.PASSWORD)
                ),
            }
        )

        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=schema,
            errors=errors,
        )


class MyMusicLibraryOptionsFlow(OptionsFlow):
    """Handle options for My Music Library (default player, excluded players, debug)."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(data=user_input)

        all_players = _get_all_players(self.hass)
        mml_players = _get_mml_players(self.hass)

        current_excluded: list[str] = list(
            self.config_entry.options.get(CONF_EXCLUDED_PLAYERS, [])
        )
        # Keep wildcard patterns as-is; drop stale exact entity IDs only.
        current_excluded = [
            p for p in current_excluded
            if "*" in p or p in all_players
        ]

        current_default_player = self.config_entry.options.get(CONF_DEFAULT_PLAYER, "")
        if current_default_player not in mml_players:
            current_default_player = ""

        current_debug: bool = bool(
            self.config_entry.options.get(CONF_DEBUG_MODE, False)
        )

        player_options = {
            "": "Auto-detect (first available player)",
            **mml_players,
        }

        schema = vol.Schema(
            {
                vol.Optional(CONF_DEFAULT_PLAYER, default=current_default_player): vol.In(player_options),
                vol.Optional(CONF_EXCLUDED_PLAYERS, default=current_excluded): SelectSelector(
                    SelectSelectorConfig(
                        options=[{"value": k, "label": v} for k, v in all_players.items()],
                        multiple=True,
                        mode=SelectSelectorMode.LIST,
                        custom_value=True,
                    )
                ),
                vol.Optional(CONF_DEBUG_MODE, default=current_debug): bool,
            }
        )

        return self.async_show_form(step_id="init", data_schema=schema)
