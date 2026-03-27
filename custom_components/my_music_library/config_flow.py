"""Config flow for My Music Library."""
from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)

from .const import (
    CONF_DEFAULT_PLAYER,
    CONF_DEFAULT_TAB,
    CONF_EXCLUDED_PLAYERS,
    CONF_MA_URL,
    DEFAULT_MA_URL,
    DEFAULT_TAB,
    DOMAIN,
    MUSIC_ASSISTANT_DOMAIN,
    NAME,
)


def _get_ma_players(hass: HomeAssistant) -> dict[str, str]:
    """Return a dict of {entity_id: friendly_name} for Music Assistant media_players."""
    ent_reg = er.async_get(hass)
    players: dict[str, str] = {}
    for entity in ent_reg.entities.values():
        if (
            entity.platform == MUSIC_ASSISTANT_DOMAIN
            and entity.domain == "media_player"
            and not entity.disabled
        ):
            state = hass.states.get(entity.entity_id)
            name = (
                state.attributes.get("friendly_name", entity.entity_id)
                if state
                else entity.entity_id
            )
            players[entity.entity_id] = name
    return players


def _get_all_players(hass: HomeAssistant) -> dict[str, str]:
    """Return a dict of {entity_id: friendly_name} for all non-unavailable media_player entities."""
    players: dict[str, str] = {}
    for state in hass.states.async_all("media_player"):
        if state.state != "unavailable":
            name = state.attributes.get("friendly_name", state.entity_id)
            players[state.entity_id] = name
    return dict(sorted(players.items(), key=lambda x: x[1].lower()))


def _validate_url(url: str) -> str | None:
    """Return None if valid, or an error key if invalid."""
    if not url:
        return None  # empty = not configured, that's fine
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            return "invalid_url"
    except Exception:  # noqa: BLE001
        return "invalid_url"
    return None


class MyMusicLibraryConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for My Music Library."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow handler."""
        return MyMusicLibraryOptionsFlow()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        errors: dict[str, str] = {}
        ma_players = _get_ma_players(self.hass)

        if user_input is not None:
            url_error = _validate_url(user_input.get(CONF_MA_URL, ""))
            if url_error:
                errors[CONF_MA_URL] = url_error
            else:
                return self.async_create_entry(title=NAME, data=user_input)

        player_options = {
            "": "Auto-detect (first available player)",
            **ma_players,
        }

        schema = vol.Schema(
            {
                vol.Optional(CONF_MA_URL, default=DEFAULT_MA_URL): str,
                vol.Optional(CONF_DEFAULT_PLAYER, default=""): vol.In(player_options),
                vol.Optional(CONF_DEFAULT_TAB, default=DEFAULT_TAB): vol.In(
                    {
                        "player": "Player",
                        "search": "Search",
                        "library": "Library",
                    }
                ),
            }
        )

        description_placeholders: dict[str, str] = {
            "ma_url_hint": "e.g. http://homeassistant.local:8095",
        }
        if not ma_players:
            description_placeholders["ma_warning"] = (
                "Music Assistant integration not found — "
                "install it first for full functionality."
            )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
            description_placeholders=description_placeholders,
        )


class MyMusicLibraryOptionsFlow(OptionsFlow):
    """Handle options for My Music Library (player exclusion, etc.)."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(data=user_input)

        all_players = _get_all_players(self.hass)
        current_excluded: list[str] = list(
            self.config_entry.options.get(CONF_EXCLUDED_PLAYERS, [])
        )
        # Keep wildcard patterns as-is; drop stale exact entity IDs only.
        current_excluded = [
            p for p in current_excluded
            if "*" in p or p in all_players
        ]

        schema = vol.Schema(
            {
                vol.Optional(CONF_EXCLUDED_PLAYERS, default=current_excluded): SelectSelector(
                    SelectSelectorConfig(
                        options=[{"value": k, "label": v} for k, v in all_players.items()],
                        multiple=True,
                        mode=SelectSelectorMode.LIST,
                        # Allows typing wildcard patterns (e.g. media_player.browser_mod_*)
                        # directly in the selector input field.
                        custom_value=True,
                    )
                ),
            }
        )

        return self.async_show_form(step_id="init", data_schema=schema)
