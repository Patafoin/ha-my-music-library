"""Config flow for My Music Library."""
from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

import voluptuous as vol
from music_assistant_client import MusicAssistantClient
from music_assistant_client.exceptions import CannotConnect, InvalidServerVersion
from music_assistant_models.errors import AuthenticationFailed, AuthenticationRequired, MusicAssistantError

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    ConfigSubentryFlow,
    OptionsFlow,
    SubentryFlowResult,
)
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

from .card_tabs import entity_id_for, get_card_tabs
from .const import (
    CONF_ALLOWED_PLAYERS,
    CONF_DEBUG_MODE,
    CONF_DEFAULT_OUTPUT_MODE,
    CONF_DEFAULT_PLAYER,
    CONF_DEFAULT_TAB,
    CONF_EXCLUDED_PLAYERS,
    CONF_HA_USER,
    CONF_HA_USERS,
    CONF_MA_TOKEN,
    CONF_MA_URL,
    CONF_PROFILE_NAME,
    CONFIG_ENTRY_VERSION,
    DEFAULT_OUTPUT_MODE,
    DEFAULT_TAB,
    DOMAIN,
    NAME,
    OUTPUT_MODES,
    SUBENTRY_TYPE_PROFILE,
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

    @classmethod
    @callback
    def async_get_supported_subentry_types(
        cls, config_entry: ConfigEntry
    ) -> dict[str, type[ConfigSubentryFlow]]:
        """Profiles: one Home Assistant user ↔ one Music Assistant token."""
        return {SUBENTRY_TYPE_PROFILE: ProfileSubentryFlow}

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
                    self.hass.config_entries.async_update_entry(
                        reauth_entry,
                        data={**reauth_entry.data, CONF_MA_URL: url, CONF_MA_TOKEN: token},
                    )
                    # Reload here rather than through async_update_reload_and_abort: from HA
                    # 2026.12 that helper leaves the reload to our update listener, which only
                    # applies the debug mode. Also reloads when the same token is typed again.
                    self.hass.config_entries.async_schedule_reload(reauth_entry.entry_id)
                    return self.async_abort(reason="reauth_successful")

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
    """Handle options for My Music Library (default player, excluded players, output panel mode, debug).

    A second step, "exposed_cards", follows when cards expose their tab (card_tabs.py): it removes them.
    """

    _options: dict[str, Any]

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            self._options = user_input
            card_tabs = get_card_tabs(self.hass)
            if card_tabs is not None and card_tabs.cards:
                return await self.async_step_exposed_cards()
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

        current_output_mode = self.config_entry.options.get(CONF_DEFAULT_OUTPUT_MODE, DEFAULT_OUTPUT_MODE)
        if current_output_mode not in OUTPUT_MODES:
            current_output_mode = DEFAULT_OUTPUT_MODE

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
                vol.Optional(CONF_DEFAULT_OUTPUT_MODE, default=current_output_mode): SelectSelector(
                    SelectSelectorConfig(
                        options=list(OUTPUT_MODES),
                        mode=SelectSelectorMode.DROPDOWN,
                        translation_key=CONF_DEFAULT_OUTPUT_MODE,
                    )
                ),
                vol.Optional(CONF_DEBUG_MODE, default=current_debug): bool,
            }
        )

        return self.async_show_form(step_id="init", data_schema=schema)

    async def async_step_exposed_cards(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Exposed cards: the ticked ones lose their select entity and their stored tab list."""
        card_tabs = get_card_tabs(self.hass)
        cards = sorted(card_tabs.cards) if card_tabs is not None else []
        if user_input is not None:
            for card_id in user_input.get("remove_cards", []):
                if card_tabs is not None and card_id in card_tabs.cards:
                    await card_tabs.async_remove(card_id)
            return self.async_create_entry(data=self._options)

        def _label(card_id: str) -> str:
            entity = card_tabs.entities.get(card_id) if card_tabs is not None else None
            entity_id = entity.entity_id if entity is not None else entity_id_for(card_id)
            return f"{card_id} ({entity_id})"

        schema = vol.Schema(
            {
                vol.Optional("remove_cards", default=[]): SelectSelector(
                    SelectSelectorConfig(
                        options=[{"value": c, "label": _label(c)} for c in cards],
                        multiple=True,
                        mode=SelectSelectorMode.LIST,
                    )
                ),
            }
        )
        return self.async_show_form(
            step_id="exposed_cards",
            data_schema=schema,
            description_placeholders={"count": str(len(cards))},
        )


class ProfileSubentryFlow(ConfigSubentryFlow):
    """Add or edit a profile: a Music Assistant account and the Home Assistant users who may use it.

    The token must be created while logged in to Music Assistant as that account,
    so that Music Assistant applies its filters (see profiles.py). `ha_user`
    gets the profile by default (one profile per user at most), `ha_users` may
    use it too: from their card's `profile` option or the output panel.
    """

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Name the profile, its Music Assistant token, its users, default player and outputs."""
        entry = self._get_entry()
        users = await _ha_users(self.hass)
        if not users:
            return self.async_abort(reason="no_users")

        errors: dict[str, str] = {}
        if user_input is not None:
            data, error = _profile_users(entry, None, users, user_input)
            if error:
                errors[error[0]] = error[1]
            elif error := await _test_connection(self.hass, entry.data[CONF_MA_URL], user_input[CONF_MA_TOKEN]):
                errors["base"] = error
            else:
                return self.async_create_entry(
                    title=user_input[CONF_PROFILE_NAME].strip(),
                    data={
                        **data,
                        CONF_MA_TOKEN: user_input[CONF_MA_TOKEN],
                        CONF_DEFAULT_PLAYER: user_input.get(CONF_DEFAULT_PLAYER, ""),
                        CONF_ALLOWED_PLAYERS: user_input.get(CONF_ALLOWED_PLAYERS, []),
                    },
                )

        current = user_input or {}
        schema = vol.Schema(
            {
                vol.Required(CONF_PROFILE_NAME, default=current.get(CONF_PROFILE_NAME, "")): str,
                vol.Required(CONF_MA_TOKEN): TextSelector(
                    TextSelectorConfig(type=TextSelectorType.PASSWORD)
                ),
                **_users_fields(entry, None, users, current),
                **_default_player_field(self.hass, current.get(CONF_DEFAULT_PLAYER, "")),
                **_allowed_players_field(self.hass, current.get(CONF_ALLOWED_PLAYERS) or []),
            }
        )
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Change a profile's name, token (left empty: kept), users, default player or outputs."""
        entry = self._get_entry()
        subentry = self._get_reconfigure_subentry()
        users = await _ha_users(self.hass)
        errors: dict[str, str] = {}

        if user_input is not None:
            token = user_input.get(CONF_MA_TOKEN) or subentry.data[CONF_MA_TOKEN]
            data, error = _profile_users(entry, subentry.subentry_id, users, user_input)
            if error:
                errors[error[0]] = error[1]
            elif error := await _test_connection(self.hass, entry.data[CONF_MA_URL], token):
                errors["base"] = error
            else:
                # The entry's update listener reloads it: profile connections are opened at setup.
                # Not async_update_and_abort: since HA 2026.10 its default reason is resolved from
                # Home Assistant's own strings ("Reconfiguration was successful"), not from ours.
                self.hass.config_entries.async_update_subentry(
                    entry,
                    subentry,
                    title=(user_input.get(CONF_PROFILE_NAME) or "").strip() or subentry.title,
                    data={
                        **subentry.data,
                        **data,
                        CONF_MA_TOKEN: token,
                        CONF_DEFAULT_PLAYER: user_input.get(CONF_DEFAULT_PLAYER, ""),
                        CONF_ALLOWED_PLAYERS: user_input.get(CONF_ALLOWED_PLAYERS, []),
                    },
                )
                return self.async_abort(reason="reconfigure_successful")

        current = user_input or {
            CONF_HA_USER: subentry.data.get(CONF_HA_USER) or "",
            CONF_HA_USERS: subentry.data.get(CONF_HA_USERS) or [],
        }
        schema = vol.Schema(
            {
                vol.Required(CONF_PROFILE_NAME, default=subentry.title): str,
                vol.Optional(CONF_MA_TOKEN): TextSelector(
                    TextSelectorConfig(type=TextSelectorType.PASSWORD)
                ),
                **_users_fields(entry, subentry.subentry_id, users, current),
                **_default_player_field(self.hass, subentry.data.get(CONF_DEFAULT_PLAYER, "")),
                **_allowed_players_field(self.hass, subentry.data.get(CONF_ALLOWED_PLAYERS) or []),
            }
        )
        return self.async_show_form(step_id="reconfigure", data_schema=schema, errors=errors)


async def _ha_users(hass: HomeAssistant) -> dict[str, str]:
    """Home Assistant users a profile can be given to: {user id: name}, by name."""
    users = {
        user.id: user.name or user.id
        for user in await hass.auth.async_get_users()
        if user.is_active and not user.system_generated
    }
    return dict(sorted(users.items(), key=lambda x: x[1].lower()))


def _owners(entry: ConfigEntry, except_subentry: str | None) -> set[str]:
    """Home Assistant users whose default profile is another profile than `except_subentry`."""
    return {
        owner
        for subentry_id, subentry in entry.subentries.items()
        if subentry.subentry_type == SUBENTRY_TYPE_PROFILE
        and subentry_id != except_subentry
        and (owner := subentry.data.get(CONF_HA_USER))
    }


def _users_fields(
    entry: ConfigEntry, subentry_id: str | None, users: dict[str, str], current: dict[str, Any]
) -> dict[Any, Any]:
    """The profile's default user (users without a default profile yet) and its other users."""
    taken = _owners(entry, subentry_id)
    owner = current.get(CONF_HA_USER) or ""
    others = [uid for uid in current.get(CONF_HA_USERS) or [] if uid in users]
    return {
        vol.Optional(CONF_HA_USER, default=owner if owner in users else ""): vol.In(
            {"": "—", **{uid: name for uid, name in users.items() if uid not in taken}}
        ),
        vol.Optional(CONF_HA_USERS, default=others): SelectSelector(
            SelectSelectorConfig(
                options=[{"value": uid, "label": name} for uid, name in users.items()],
                multiple=True,
                mode=SelectSelectorMode.LIST,
            )
        ),
    }


def _profile_users(
    entry: ConfigEntry, subentry_id: str | None, users: dict[str, str], user_input: dict[str, Any]
) -> tuple[dict[str, Any], tuple[str, str] | None]:
    """Validate the users of a profile: ({ha_user, ha_users}, None) or ({}, (field, error key))."""
    if not (user_input.get(CONF_PROFILE_NAME) or "").strip():
        return {}, (CONF_PROFILE_NAME, "name_required")
    owner = user_input.get(CONF_HA_USER) or ""
    if owner and owner not in users:
        return {}, (CONF_HA_USER, "unknown_user")
    if owner and owner in _owners(entry, subentry_id):
        return {}, (CONF_HA_USER, "user_has_profile")
    others = [uid for uid in user_input.get(CONF_HA_USERS) or [] if uid != owner]
    if any(uid not in users for uid in others):
        return {}, (CONF_HA_USERS, "unknown_user")
    if not owner and not others:
        return {}, ("base", "no_user_selected")
    return {CONF_HA_USER: owner, CONF_HA_USERS: others}, None


def _allowed_players_field(hass: HomeAssistant, current: list[str]) -> dict[Any, Any]:
    """Outputs this profile's default user may use, among our own media_players (none ticked: all)."""
    players = _get_mml_players(hass)
    return {
        vol.Optional(CONF_ALLOWED_PLAYERS, default=[eid for eid in current if eid in players]): SelectSelector(
            SelectSelectorConfig(
                options=[
                    {"value": eid, "label": name}
                    for eid, name in sorted(players.items(), key=lambda x: x[1].lower())
                ],
                multiple=True,
                mode=SelectSelectorMode.LIST,
            )
        )
    }


def _default_player_field(hass: HomeAssistant, current: str) -> dict[Any, Any]:
    """Optional default player of a profile, among our own media_players ("" = none)."""
    players = _get_mml_players(hass)
    if current not in players:
        current = ""
    return {
        vol.Optional(CONF_DEFAULT_PLAYER, default=current): vol.In(
            {"": "—", **dict(sorted(players.items(), key=lambda x: x[1].lower()))}
        )
    }
