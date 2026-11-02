"""Profiles: each Home Assistant user can browse and play with their own Music Assistant account.

A profile is a config subentry binding one Home Assistant user to one Music
Assistant token. MML opens one MA connection per profile; every request from
the card (HTTP views, WebSocket config) and every playback started through
`my_music_library.play_media` / `transfer_queue` goes through the connection of
the Home Assistant user behind it. Music Assistant then applies that user's
filters (music providers, players) and records the playback (history, streaming
account) under that user.

Users without a profile keep the main connection (the entry's token), as
before. A user *with* a profile never falls back to the main connection: if
their connection is down, they get "not connected" rather than someone else's
library.

The current user travels in a ContextVar, set by `user_scoped` (HTTP views)
or `acting_user` (WebSocket commands, entity services), so the many helpers
of api.py and outputs.py keep calling `get_client(hass)` without a user
argument.

Outputs are locked per Home Assistant user: a profile's `allowed_players`
(our media_player entity_ids; empty: no restriction set in Home Assistant, the
Music Assistant user's player filter then applies, as before 4.12) is checked
for the *calling* user on every card request and entity action that targets an
output — never for a borrowed profile, so a shared tablet routes a child's music
to the tablet's own outputs.

A profile with `can_switch_user` may borrow another profile's account: the
card names that profile (subentry id) in the `X-MML-Profile` header or the
`profile` field of `play_media`, and the request then runs as that profile's
Home Assistant user. The right is checked here, on every request.
"""
from __future__ import annotations

from collections.abc import Awaitable, Callable, Iterable, Iterator
from contextlib import contextmanager
from contextvars import ContextVar
import functools
from http import HTTPStatus
import logging
from typing import TYPE_CHECKING, Any

from aiohttp import web

from homeassistant.components.http import KEY_HASS, KEY_HASS_USER
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.exceptions import ConfigEntryAuthFailed, ConfigEntryNotReady, HomeAssistantError

from .const import (
    CONF_ALLOWED_PLAYERS,
    CONF_CAN_SWITCH_USER,
    CONF_DEFAULT_PLAYER,
    CONF_HA_USER,
    CONF_MA_TOKEN,
    CONF_MA_URL,
    DOMAIN,
    PROFILE_HEADER,
    SUBENTRY_TYPE_PROFILE,
)
from .entity import UNIQUE_ID_PREFIX
from .mass_connection import (
    MAUser,
    MMLRuntimeData,
    MyMusicLibraryConfigEntry,
    ProfileConnection,
    async_fetch_user,
    async_open,
)

if TYPE_CHECKING:
    from music_assistant_client import MusicAssistantClient

_LOGGER = logging.getLogger(__name__)

# Id of the Home Assistant user the current request / service call is made for.
_current_user_id: ContextVar[str | None] = ContextVar("my_music_library_user_id", default=None)
# Id of the Home Assistant user really making the request (not a borrowed profile's): output access.
_caller_user_id: ContextVar[str | None] = ContextVar("my_music_library_caller_id", default=None)


class ProfileSwitchDenied(HomeAssistantError):
    """A user asked for a profile they may not borrow."""


class PlayerNotAllowed(HomeAssistantError):
    """A user targeted an output their profile may not use."""


def resolve_user(hass: HomeAssistant, user_id: str | None, as_profile: str | None) -> str | None:
    """Home Assistant user a request runs as: `user_id`, or the one behind `as_profile`.

    `as_profile` (a profile's subentry id) is only honoured when `user_id` has a
    profile allowed to switch users; anything else raises ProfileSwitchDenied.
    """
    if not as_profile:
        return user_id
    runtime_data = _loaded_runtime_data(hass)
    own = runtime_data.profiles.get(user_id) if runtime_data is not None and user_id is not None else None
    if own is None or not own.can_switch_user:
        raise ProfileSwitchDenied("This user may not switch Music Assistant users")
    for profile_user_id, profile in runtime_data.profiles.items():
        if profile.subentry_id == as_profile:
            return profile_user_id
    raise ProfileSwitchDenied(f"Unknown profile {as_profile!r}")


@contextmanager
def acting_user(user_id: str | None) -> Iterator[None]:
    """Run the enclosed code on behalf of a Home Assistant user (None: main connection)."""
    token = _current_user_id.set(user_id)
    try:
        yield
    finally:
        _current_user_id.reset(token)


def user_scoped(
    handler: Callable[..., Awaitable[web.StreamResponse]],
) -> Callable[..., Awaitable[web.StreamResponse]]:
    """Decorate an authenticated HTTP view method: run it for the requesting user.

    Or for the profile named by the X-MML-Profile header, if that user may switch.
    """

    @functools.wraps(handler)
    async def wrapper(view: Any, request: web.Request, *args: Any, **kwargs: Any) -> web.StreamResponse:
        user = request.get(KEY_HASS_USER)
        try:
            user_id = resolve_user(
                request.app[KEY_HASS], user.id if user is not None else None, request.headers.get(PROFILE_HEADER)
            )
        except ProfileSwitchDenied as err:
            return view.json_message(str(err), HTTPStatus.FORBIDDEN)
        caller = _caller_user_id.set(user.id if user is not None else None)
        try:
            with acting_user(user_id):
                return await handler(view, request, *args, **kwargs)
        except PlayerNotAllowed as err:
            return view.json_message(str(err), HTTPStatus.FORBIDDEN)
        finally:
            _caller_user_id.reset(caller)

    return wrapper


def _loaded_runtime_data(hass: HomeAssistant) -> MMLRuntimeData | None:
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.state == ConfigEntryState.LOADED:
            return entry.runtime_data
    return None


def get_profile(hass: HomeAssistant, user_id: str | None = None) -> ProfileConnection | None:
    """Profile of a Home Assistant user (default: the current one), if they have one."""
    runtime_data = _loaded_runtime_data(hass)
    user_id = user_id if user_id is not None else _current_user_id.get()
    if runtime_data is None or user_id is None:
        return None
    return runtime_data.profiles.get(user_id)


def switchable_profiles(hass: HomeAssistant, user_id: str | None) -> list[dict[str, Any]] | None:
    """Profiles `user_id` may borrow (their own first), or None when they may not switch."""
    runtime_data = _loaded_runtime_data(hass)
    own = runtime_data.profiles.get(user_id) if runtime_data is not None and user_id is not None else None
    if own is None or not own.can_switch_user:
        return None
    others = sorted((p for p in runtime_data.profiles.values() if p is not own), key=lambda p: p.title.lower())
    return [
        {"id": profile.subentry_id, "name": profile.title, "connected": bool(profile.connected)}
        for profile in (own, *others)
    ]


def caller_user_id() -> str | None:
    """Home Assistant user really making the current card request (see user_scoped)."""
    return _caller_user_id.get()


def allowed_players(hass: HomeAssistant, user_id: str | None) -> frozenset[str] | None:
    """Outputs (our media_player entity_ids) `user_id` may use, or None: all of them.

    The list set on their profile in Home Assistant; without one, the player filter
    of the Music Assistant user behind them (their profile's, else the main account).
    Automations and system calls (no user) are never restricted.
    """
    runtime_data = _loaded_runtime_data(hass)
    if runtime_data is None or user_id is None:
        return None
    profile = runtime_data.profiles.get(user_id)
    if profile is not None and profile.allowed_players:
        return profile.allowed_players
    mass, ma_user = (profile.mass, profile.ma_user) if profile is not None else (runtime_data.mass, runtime_data.ma_user)
    if mass is None or (player_ids := visible_player_ids(mass, ma_user)) is None:
        return None
    registry = er.async_get(hass)
    return frozenset(
        eid
        for pid in player_ids
        if (eid := registry.async_get_entity_id("media_player", DOMAIN, f"{UNIQUE_ID_PREFIX}{pid}"))
    )


def check_players(hass: HomeAssistant, user_id: str | None, entity_ids: Iterable[str]) -> None:
    """Raise PlayerNotAllowed when `user_id` may not use one of these outputs."""
    if (allowed := allowed_players(hass, user_id)) is None:
        return
    for entity_id in entity_ids:
        if entity_id and entity_id not in allowed:
            raise PlayerNotAllowed(f"{entity_id} is not one of this user's outputs")


def get_client(hass: HomeAssistant) -> MusicAssistantClient | None:
    """MA client for the current user: their profile's, else the main one.

    None when the entry isn't loaded, or when the user has a profile whose
    connection is down (never the main connection in that case).
    """
    runtime_data = _loaded_runtime_data(hass)
    if runtime_data is None:
        return None
    user_id = _current_user_id.get()
    if user_id is not None and (profile := runtime_data.profiles.get(user_id)) is not None:
        return profile.mass if profile.connected else None
    return runtime_data.mass


def get_ma_user(hass: HomeAssistant) -> MAUser | None:
    """Music Assistant user (and filters) behind the current user's connection."""
    runtime_data = _loaded_runtime_data(hass)
    if runtime_data is None:
        return None
    if (profile := get_profile(hass)) is not None:
        return profile.ma_user
    return runtime_data.ma_user


async def async_refresh_ma_user(hass: HomeAssistant) -> MAUser | None:
    """Re-read the current user's MA filters (they may have changed in MA since connecting)."""
    runtime_data = _loaded_runtime_data(hass)
    if runtime_data is None or (mass := get_client(hass)) is None:
        return None
    ma_user = await async_fetch_user(mass)
    if ma_user is None:
        return get_ma_user(hass)
    if (profile := get_profile(hass)) is not None:
        profile.ma_user = ma_user
    else:
        runtime_data.ma_user = ma_user
    return ma_user


def visible_player_ids(mass: MusicAssistantClient, ma_user: MAUser | None) -> list[str] | None:
    """MA player ids the current user may see, or None when they may see them all.

    A non-admin MA user only receives their own players already; an admin
    receives every player whatever their filter, hence the filter applied here.
    """
    if ma_user is None or not ma_user.player_filter:
        return None
    return [p.player_id for p in mass.players if p.player_id in ma_user.player_filter]


def filter_providers(providers: Iterable[dict[str, Any]], ma_user: MAUser | None) -> list[dict[str, Any]]:
    """Keep the music providers the current MA user may use (see visible_player_ids)."""
    if ma_user is None or not ma_user.provider_filter:
        return list(providers)
    return [p for p in providers if p.get("instance_id") in ma_user.provider_filter]


def in_users_library(item: dict[str, Any], ma_user: MAUser | None) -> bool:
    """Whether a library item belongs to the current MA user's own library.

    Music Assistant keeps one library row per item, shared by every account, with
    one provider mapping per account and an `in_library` flag per mapping: the item
    is in a user's library when one of their own sources has it in_library. Its
    `favorite` flag is shared. MA's library listings use the flags; its library
    search doesn't (any mapping to an allowed source matches). Unknown flags (older
    servers) or no source filter: True.
    """
    if ma_user is None or not ma_user.provider_filter:
        return True
    mappings = [m for m in item.get("provider_mappings") or [] if isinstance(m, dict)]
    if not any(m.get("in_library") is not None for m in mappings):
        return True
    return any(
        m.get("in_library") and m.get("provider_instance") in ma_user.provider_filter for m in mappings
    )


def scope_search_results(results: dict[str, Any], ma_user: MAUser | None, *, library_only: bool) -> dict[str, Any]:
    """Keep library search results to the current MA user's own library.

    Library items of another account are dropped from a library-only search; in a
    general search they stay (the same item is in this user's catalogue too) but
    lose the shared favorite flag.
    """
    for key, items in results.items():
        if not isinstance(items, list):
            continue
        kept = []
        for item in items:
            if isinstance(item, dict) and item.get("provider") == "library" and not in_users_library(item, ma_user):
                if library_only:
                    continue
                item["favorite"] = False
            kept.append(item)
        results[key] = kept
    return results


def profile_subentries(entry: MyMusicLibraryConfigEntry) -> dict[str, Any]:
    """Profile subentries of the entry, by subentry id."""
    return {
        subentry_id: subentry
        for subentry_id, subentry in entry.subentries.items()
        if subentry.subentry_type == SUBENTRY_TYPE_PROFILE
    }


def profiles_signature(entry: MyMusicLibraryConfigEntry) -> tuple:
    """What the profile connections depend on: a change calls for a reload."""
    return tuple(
        sorted(
            (subentry_id, tuple(sorted(subentry.data.items())))
            for subentry_id, subentry in profile_subentries(entry).items()
        )
    )


async def async_connect_profiles(hass: HomeAssistant, entry: MyMusicLibraryConfigEntry) -> None:
    """Open one MA connection per profile.

    A profile that can't connect stays registered without a client: its user
    gets "not connected" (never the main connection), the others are unaffected.
    """
    url = entry.data[CONF_MA_URL]
    profiles: dict[str, ProfileConnection] = {}
    for subentry_id, subentry in profile_subentries(entry).items():
        profile = ProfileConnection(
            subentry_id=subentry_id,
            title=subentry.title,
            default_player=subentry.data.get(CONF_DEFAULT_PLAYER) or None,
            can_switch_user=bool(subentry.data.get(CONF_CAN_SWITCH_USER)),
            allowed_players=frozenset(subentry.data.get(CONF_ALLOWED_PLAYERS) or ()),
        )
        profiles[subentry.data[CONF_HA_USER]] = profile
        try:
            profile.mass, profile.listen_task = await async_open(hass, entry, url, subentry.data[CONF_MA_TOKEN])
        except (ConfigEntryAuthFailed, ConfigEntryNotReady) as err:
            _LOGGER.warning("Profile %r could not connect to Music Assistant: %s", subentry.title, err)
            continue
        profile.ma_user = await async_fetch_user(profile.mass)
        _LOGGER.debug(
            "Profile %r connected as Music Assistant user %r",
            subentry.title,
            profile.ma_user.username if profile.ma_user else None,
        )
    entry.runtime_data.profiles = profiles
