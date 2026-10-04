"""Own the connection to a Music Assistant server (no dependency on `mass`)."""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass

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
class MMLRuntimeData:
    """Hold the native Music Assistant client for our config entry."""

    mass: MusicAssistantClient
    listen_task: asyncio.Task


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

    return MMLRuntimeData(mass=mass, listen_task=listen_task)


async def async_disconnect(runtime_data: MMLRuntimeData) -> None:
    """Cancel the listen task and disconnect the client."""
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
