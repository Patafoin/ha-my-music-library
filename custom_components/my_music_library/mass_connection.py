"""Own the connection to a Music Assistant server (no dependency on `mass`)."""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Any

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed, ConfigEntryNotReady
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from music_assistant_client import MusicAssistantClient
from music_assistant_client.exceptions import CannotConnect, InvalidServerVersion
from music_assistant_models.errors import AuthenticationFailed, AuthenticationRequired, MusicAssistantError

from .const import CONF_MA_TOKEN, CONF_MA_URL, MA_CONNECT_TIMEOUT, MA_LISTEN_READY_TIMEOUT

_LOGGER = logging.getLogger(__name__)


@dataclass
class MAUser:
    """The Music Assistant user a token belongs to, with its access filters.

    MA applies these filters itself to content (library, search, browse) for
    every user, but not to its player and provider *lists* for an admin: MML
    applies them to those lists (profiles.py).
    """

    username: str
    player_filter: frozenset[str] = frozenset()
    provider_filter: frozenset[str] = frozenset()


@dataclass
class ProfileConnection:
    """The Music Assistant connection of one profile (config subentry)."""

    subentry_id: str
    title: str
    default_player: str | None
    mass: MusicAssistantClient | None = None
    listen_task: asyncio.Task | None = None
    ma_user: MAUser | None = None

    @property
    def connected(self) -> bool:
        """Whether this profile can talk to Music Assistant right now."""
        return self.mass is not None and self.mass.connection.connected


@dataclass
class MMLRuntimeData:
    """Hold the native Music Assistant client for our config entry.

    `mass` is the main connection (entry token): it backs the media_player
    entities and serves every Home Assistant user without a profile.
    `profiles` maps a Home Assistant user id to that user's own connection.
    """

    mass: MusicAssistantClient
    listen_task: asyncio.Task
    ma_user: MAUser | None = None
    profiles: dict[str, ProfileConnection] = field(default_factory=dict)


type MyMusicLibraryConfigEntry = ConfigEntry[MMLRuntimeData]


async def async_connect(hass: HomeAssistant, entry: MyMusicLibraryConfigEntry) -> MMLRuntimeData:
    """Connect to the configured Music Assistant server and start listening.

    Raises ConfigEntryNotReady (transient) or ConfigEntryAuthFailed (needs
    reauth) — both understood natively by HA's config entry setup machinery.
    """
    url = entry.data.get(CONF_MA_URL)
    token = entry.data.get(CONF_MA_TOKEN)
    if not url or not token:
        # Pre-v4 entry (created before the URL+token fields existed) or a
        # partially-migrated one — send the user through reauth instead of
        # crashing on a KeyError.
        raise ConfigEntryAuthFailed(
            "Music Assistant server URL and/or API token missing — reconfigure the integration."
        )

    mass, listen_task = await async_open(hass, entry, url, token)
    return MMLRuntimeData(mass=mass, listen_task=listen_task, ma_user=await async_fetch_user(mass))


async def async_open(
    hass: HomeAssistant, entry: MyMusicLibraryConfigEntry, url: str, token: str
) -> tuple[MusicAssistantClient, asyncio.Task]:
    """Open one Music Assistant connection and start listening on it.

    Used for the main connection and for each profile's. A connection that
    drops later reloads the whole entry (_client_listen).
    """
    session = async_get_clientsession(hass)
    mass = MusicAssistantClient(url, session, token=token)

    try:
        async with asyncio.timeout(MA_CONNECT_TIMEOUT):
            await mass.connect()
    except (AuthenticationRequired, AuthenticationFailed) as err:
        raise ConfigEntryAuthFailed(f"Music Assistant authentication failed: {err}") from err
    except InvalidServerVersion as err:
        raise ConfigEntryNotReady(f"Incompatible Music Assistant server schema: {err}") from err
    except (TimeoutError, CannotConnect) as err:
        raise ConfigEntryNotReady(f"Failed to connect to Music Assistant server {url}") from err
    except MusicAssistantError as err:
        raise ConfigEntryNotReady(f"Unknown error connecting to Music Assistant server {url}") from err

    init_ready = asyncio.Event()
    listen_task = asyncio.create_task(_client_listen(hass, entry, mass, init_ready))

    try:
        async with asyncio.timeout(MA_LISTEN_READY_TIMEOUT):
            await init_ready.wait()
    except TimeoutError as err:
        listen_task.cancel()
        await mass.disconnect()
        raise ConfigEntryNotReady("Music Assistant client not ready") from err

    if listen_task.done() and (listen_error := listen_task.exception()) is not None:
        await mass.disconnect()
        raise ConfigEntryNotReady(listen_error) from listen_error

    return mass, listen_task


async def async_fetch_user(mass: MusicAssistantClient) -> MAUser | None:
    """Return the Music Assistant user behind this connection's token.

    None when the server can't tell (no user accounts, older server, error):
    no filter is applied then, as before profiles existed.
    """
    try:
        me: Any = await mass.send_command("auth/me")
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("Could not read the Music Assistant user of a connection: %s", err)
        return None
    if not isinstance(me, dict):
        return None
    return MAUser(
        username=str(me.get("username") or ""),
        player_filter=frozenset(me.get("player_filter") or ()),
        provider_filter=frozenset(me.get("provider_filter") or ()),
    )


async def async_disconnect(runtime_data: MMLRuntimeData) -> None:
    """Cancel the listen tasks and disconnect the main and profile clients."""
    for profile in runtime_data.profiles.values():
        if profile.listen_task is not None:
            profile.listen_task.cancel()
        if profile.mass is not None:
            await profile.mass.disconnect()
    runtime_data.listen_task.cancel()
    await runtime_data.mass.disconnect()


async def _client_listen(
    hass: HomeAssistant,
    entry: ConfigEntry,
    mass: MusicAssistantClient,
    init_ready: asyncio.Event,
) -> None:
    """Listen for events on the Music Assistant connection until it drops."""
    try:
        await mass.start_listening(init_ready)
    except MusicAssistantError as err:
        if entry.state != ConfigEntryState.LOADED:
            raise
        _LOGGER.error("Failed to listen: %s", err)
    except Exception:  # noqa: BLE001
        if entry.state != ConfigEntryState.LOADED:
            raise
        _LOGGER.exception("Unexpected exception while listening to Music Assistant")

    if not hass.is_stopping:
        _LOGGER.debug("Disconnected from Music Assistant server. Reloading integration")
        hass.async_create_task(hass.config_entries.async_reload(entry.entry_id))
