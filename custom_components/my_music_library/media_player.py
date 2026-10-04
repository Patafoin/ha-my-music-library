"""MediaPlayer platform — one entity per Music Assistant player.

Replaces the media_player entities previously provided by the official
`mass` integration. Feature set is trimmed to exactly what the
my-music-library-card frontend drives (verified by grep across the JS):
play/pause/stop/next/prev/seek, volume set/mute/step, shuffle/repeat,
turn on/off, play_media, join/unjoin. Browse-media, announcements and
enqueue-via-generic-service are intentionally out of scope for this
migration (see docs/migration-v4 — deferred functional improvements).
"""
from __future__ import annotations

import functools
from collections.abc import Awaitable, Callable, Coroutine, Mapping
from typing import TYPE_CHECKING, Any

import voluptuous as vol
from homeassistant.components.media_player import (
    MediaPlayerDeviceClass,
    MediaPlayerEnqueue,
    MediaPlayerEntity,
    MediaPlayerEntityFeature,
    MediaPlayerState,
)
from homeassistant.components.media_player import MediaType as HAMediaType
from homeassistant.components.media_player import RepeatMode
from homeassistant.const import STATE_OFF
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback, async_get_current_platform
from homeassistant.util.dt import utc_from_timestamp
from music_assistant_models.enums import EventType, MediaType, PlayerFeature, QueueOption
from music_assistant_models.enums import RepeatMode as MassRepeatMode
from music_assistant_models.errors import MusicAssistantError
from music_assistant_models.event import MassEvent
from music_assistant_models.media_items import Track

from . import outputs
from .const import (
    ATTR_ENQUEUE,
    ATTR_MASS_PLAYER_ID,
    ATTR_MEDIA_ID,
    ATTR_RADIO_MODE,
    ATTR_TARGETS,
    DOMAIN,
    SERVICE_PLAY_MEDIA,
    SERVICE_TRANSFER_QUEUE,
)
from .entity import UNIQUE_ID_PREFIX, MusicAssistantBaseEntity

if TYPE_CHECKING:
    from music_assistant_client import MusicAssistantClient
    from music_assistant_models.player import Player
    from music_assistant_models.player_queue import PlayerQueue

    from .mass_connection import MyMusicLibraryConfigEntry

SUPPORTED_FEATURES = (
    MediaPlayerEntityFeature.PLAY
    | MediaPlayerEntityFeature.PAUSE
    | MediaPlayerEntityFeature.STOP
    | MediaPlayerEntityFeature.PREVIOUS_TRACK
    | MediaPlayerEntityFeature.NEXT_TRACK
    | MediaPlayerEntityFeature.SEEK
    | MediaPlayerEntityFeature.VOLUME_SET
    | MediaPlayerEntityFeature.VOLUME_MUTE
    | MediaPlayerEntityFeature.VOLUME_STEP
    | MediaPlayerEntityFeature.SHUFFLE_SET
    | MediaPlayerEntityFeature.REPEAT_SET
    | MediaPlayerEntityFeature.TURN_ON
    | MediaPlayerEntityFeature.TURN_OFF
    | MediaPlayerEntityFeature.PLAY_MEDIA
)


def catch_musicassistant_error[_R, **P](
    func: Callable[..., Awaitable[_R]],
) -> Callable[..., Coroutine[Any, Any, _R | None]]:
    """Convert Music Assistant errors into HomeAssistantError."""

    @functools.wraps(func)
    async def wrapper(self: MusicAssistantPlayer, *args: P.args, **kwargs: P.kwargs) -> _R | None:
        try:
            return await func(self, *args, **kwargs)
        except MusicAssistantError as err:
            raise HomeAssistantError(str(err) or err.__class__.__name__) from err

    return wrapper


async def async_setup_entry(
    hass: HomeAssistant,
    entry: MyMusicLibraryConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up MediaPlayer entities from the config entry's Music Assistant client."""
    mass = entry.runtime_data.mass
    added_ids: set[str] = set()

    async def handle_player_added(event: MassEvent) -> None:
        if event.object_id is None or event.object_id in added_ids:
            return
        added_ids.add(event.object_id)
        async_add_entities([MusicAssistantPlayer(mass, event.object_id)])

    entry.async_on_unload(mass.subscribe(handle_player_added, EventType.PLAYER_ADDED))

    players = []
    for player in mass.players:
        added_ids.add(player.player_id)
        players.append(MusicAssistantPlayer(mass, player.player_id))
    async_add_entities(players)

    platform = async_get_current_platform()
    platform.async_register_entity_service(
        SERVICE_PLAY_MEDIA,
        {
            vol.Required(ATTR_MEDIA_ID): str,
            vol.Optional(ATTR_ENQUEUE): str,
            vol.Optional(ATTR_RADIO_MODE): bool,
        },
        "_async_handle_play_media",
    )
    platform.async_register_entity_service(
        SERVICE_TRANSFER_QUEUE,
        {vol.Required(ATTR_TARGETS): cv.entity_ids},
        "_async_handle_transfer_queue",
    )


class MusicAssistantPlayer(MusicAssistantBaseEntity, MediaPlayerEntity):
    """Representation of a MediaPlayerEntity backed by a Music Assistant Player."""

    _attr_name = None
    _attr_media_image_remotely_accessible = True
    _attr_media_content_type = HAMediaType.MUSIC

    def __init__(self, mass: MusicAssistantClient, player_id: str) -> None:
        """Initialize the MediaPlayer entity."""
        super().__init__(mass, player_id)
        self._attr_icon = self.player.icon.replace("mdi-", "mdi:")
        self._attr_supported_features = SUPPORTED_FEATURES
        if PlayerFeature.SET_MEMBERS in self.player.supported_features:
            self._attr_supported_features |= MediaPlayerEntityFeature.GROUPING
        self._attr_device_class = MediaPlayerDeviceClass.SPEAKER
        self._prev_time: float = 0

    async def async_added_to_hass(self) -> None:
        """Register callbacks."""
        await super().async_added_to_hass()

        async def queue_time_updated(event: MassEvent) -> None:
            if event.object_id != self.player.active_source:
                return
            if abs((self._prev_time or 0) - event.data) > 5:
                await self.async_on_update()
                self.async_write_ha_state()
            self._prev_time = event.data

        self.async_on_remove(
            self.mass.subscribe(queue_time_updated, EventType.QUEUE_TIME_UPDATED)
        )

    @property
    def active_queue(self) -> PlayerQueue | None:
        """Return the active queue for this player, if any."""
        if not self.player.active_source:
            return None
        return self.mass.player_queues.get(self.player.active_source)

    @property
    def extra_state_attributes(self) -> Mapping[str, Any]:
        """Expose the MA player_id so the card can recognize our entities."""
        return {ATTR_MASS_PLAYER_ID: self.player_id}

    async def async_on_update(self) -> None:
        """Handle player updates."""
        if not self.available:
            return
        player = self.player
        active_queue = self.active_queue

        if player.powered and active_queue is not None:
            self._attr_state = MediaPlayerState(active_queue.state.value)
        elif player.powered and player.playback_state is not None:
            self._attr_state = MediaPlayerState(player.playback_state.value)
        else:
            self._attr_state = MediaPlayerState(STATE_OFF)

        group_members_entity_ids: list[str] = []
        if player.group_members:
            entity_registry = er.async_get(self.hass)
            group_members_entity_ids = [
                entity_id
                for child_id in player.group_members
                if (
                    entity_id := entity_registry.async_get_entity_id(
                        self.platform.domain, DOMAIN, f"{UNIQUE_ID_PREFIX}{child_id}"
                    )
                )
            ]
        self._attr_group_members = group_members_entity_ids
        self._attr_volume_level = (
            player.volume_level / 100 if player.volume_level is not None else None
        )
        self._attr_is_volume_muted = player.volume_muted
        self._update_media_attributes(player, active_queue)
        self._update_media_image_url(player, active_queue)

    def _update_media_attributes(self, player: Player, queue: PlayerQueue | None) -> None:
        """Update media_* attributes from the active queue's current item."""
        self._attr_media_artist = None
        self._attr_media_album_artist = None
        self._attr_media_album_name = None
        self._attr_media_title = None
        self._attr_media_content_id = None
        self._attr_media_duration = None
        self._attr_media_position = None
        self._attr_media_position_updated_at = None

        if queue is None and player.current_media:
            self._attr_media_content_id = player.current_media.uri
            self._attr_app_id = player.active_source
            self._attr_media_title = player.current_media.title
            self._attr_media_artist = player.current_media.artist
            self._attr_media_album_name = player.current_media.album
            self._attr_media_duration = player.current_media.duration
            self._attr_shuffle = None
            self._attr_repeat = None
            if player.elapsed_time is not None:
                self._attr_media_position = int(player.elapsed_time)
                self._prev_time = player.elapsed_time
            self._attr_media_position_updated_at = (
                utc_from_timestamp(player.elapsed_time_last_updated)
                if player.elapsed_time_last_updated
                else None
            )
            return

        if queue is None:
            self._attr_source = player.active_source
            self._attr_app_id = player.active_source
            return

        self._attr_app_id = DOMAIN
        self._attr_shuffle = queue.shuffle_enabled
        self._attr_repeat = queue.repeat_mode.value
        if not (cur_item := queue.current_item):
            return

        self._attr_media_content_id = cur_item.uri
        self._attr_media_duration = cur_item.duration
        self._attr_media_position = int(queue.elapsed_time)
        self._attr_media_position_updated_at = utc_from_timestamp(queue.elapsed_time_last_updated)
        self._prev_time = queue.elapsed_time

        if (stream_details := cur_item.streamdetails) and stream_details.stream_title:
            self._attr_media_album_name = cur_item.name
            if " - " in stream_details.stream_title:
                artist, title = stream_details.stream_title.split(" - ", 1)
                self._attr_media_title = title
                self._attr_media_artist = artist
            else:
                self._attr_media_title = stream_details.stream_title
            return

        if not (media_item := cur_item.media_item):
            self._attr_media_title = cur_item.name
            return

        self._attr_media_title = media_item.name
        if media_item.media_type == MediaType.TRACK:
            if TYPE_CHECKING:
                assert isinstance(media_item, Track)
            self._attr_media_artist = media_item.artist_str
            if media_item.version:
                self._attr_media_title += f" ({media_item.version})"
            if media_item.album:
                self._attr_media_album_name = media_item.album.name
                self._attr_media_album_artist = getattr(media_item.album, "artist_str", None)

    def _update_media_image_url(self, player: Player, queue: PlayerQueue | None) -> None:
        """Update the media image URL for the active queue item."""
        if queue is None or queue.current_item is None:
            self._attr_media_image_url = None
            return
        if image_url := self.mass.get_media_item_image_url(queue.current_item):
            self._attr_media_image_remotely_accessible = self.mass.server_url not in image_url
            self._attr_media_image_url = image_url
            return
        self._attr_media_image_url = None

    @catch_musicassistant_error
    async def async_media_play(self) -> None:
        """Send play command to device."""
        await self.mass.players.play(self.player_id)

    @catch_musicassistant_error
    async def async_media_pause(self) -> None:
        """Send pause command to device."""
        await self.mass.players.pause(self.player_id)

    @catch_musicassistant_error
    async def async_media_stop(self) -> None:
        """Send stop command to device."""
        await self.mass.players.stop(self.player_id)

    @catch_musicassistant_error
    async def async_media_next_track(self) -> None:
        """Send next track command to device."""
        await self.mass.players.next_track(self.player_id)

    @catch_musicassistant_error
    async def async_media_previous_track(self) -> None:
        """Send previous track command to device."""
        await self.mass.players.previous_track(self.player_id)

    @catch_musicassistant_error
    async def async_media_seek(self, position: float) -> None:
        """Send seek command."""
        await self.mass.players.seek(self.player_id, int(position))

    @catch_musicassistant_error
    async def async_mute_volume(self, mute: bool) -> None:
        """Mute the volume."""
        await self.mass.players.volume_mute(self.player_id, mute)

    @catch_musicassistant_error
    async def async_set_volume_level(self, volume: float) -> None:
        """Send new volume_level to device."""
        await self.mass.players.volume_set(self.player_id, int(volume * 100))

    @catch_musicassistant_error
    async def async_volume_up(self) -> None:
        """Turn volume up for this entity."""
        await self.mass.players.volume_up(self.player_id)

    @catch_musicassistant_error
    async def async_volume_down(self) -> None:
        """Turn volume down for this entity."""
        await self.mass.players.volume_down(self.player_id)

    @catch_musicassistant_error
    async def async_turn_on(self) -> None:
        """Turn on device."""
        await self.mass.players.power(self.player_id, True)

    @catch_musicassistant_error
    async def async_turn_off(self) -> None:
        """Turn off device."""
        await self.mass.players.power(self.player_id, False)

    @catch_musicassistant_error
    async def async_set_shuffle(self, shuffle: bool) -> None:
        """Set shuffle state on the active queue."""
        if not self.active_queue:
            return
        await self.mass.player_queues.shuffle(self.active_queue.queue_id, shuffle)

    @catch_musicassistant_error
    async def async_set_repeat(self, repeat: RepeatMode) -> None:
        """Set repeat state on the active queue."""
        if not self.active_queue:
            return
        await self.mass.player_queues.repeat(self.active_queue.queue_id, MassRepeatMode(repeat))

    @catch_musicassistant_error
    async def async_play_media(
        self,
        media_type: MediaType | str,
        media_id: str,
        enqueue: MediaPlayerEnqueue | None = None,
        **kwargs: Any,
    ) -> None:
        """Handle the generic media_player.play_media service."""
        await self._async_handle_play_media(media_id=media_id, enqueue=enqueue)

    @catch_musicassistant_error
    async def async_join_players(self, group_members: list[str]) -> None:
        """Join `group_members` as a player group with the current player."""
        entity_registry = er.async_get(self.hass)
        player_ids: list[str] = []
        for child_entity_id in group_members:
            if not (entry := entity_registry.async_get(child_entity_id)):
                continue
            if entry.unique_id.startswith(UNIQUE_ID_PREFIX):
                player_ids.append(entry.unique_id[len(UNIQUE_ID_PREFIX):])
        await self.mass.players.group_many(self.player_id, player_ids)

    @catch_musicassistant_error
    async def async_unjoin_player(self) -> None:
        """Remove this player from any group."""
        await self.mass.players.ungroup(self.player_id)

    @catch_musicassistant_error
    async def _async_handle_play_media(
        self,
        media_id: str,
        enqueue: str | MediaPlayerEnqueue | None = None,
        radio_mode: bool | None = None,
    ) -> None:
        """Resolve `media_id` to a URI and send it to the player's queue.

        Schema intentionally trimmed to what the card calls today: a single
        media_id (URI or free-text name), an enqueue mode, and radio_mode.
        """
        if "://" in media_id:
            uri = media_id
        elif item := await self.mass.music.get_item_by_name(name=media_id):
            uri = item.uri
        else:
            raise HomeAssistantError(f"Could not resolve {media_id!r} to a playable media item")

        queue_id = queue.queue_id if (queue := self.active_queue) else self.player_id
        await self.mass.player_queues.play_media(
            queue_id,
            media=[uri],
            option=self._convert_enqueue(enqueue),
            radio_mode=bool(radio_mode),
        )

    async def _async_handle_transfer_queue(self, targets: list[str]) -> None:
        """Move what this player plays to `targets` (see outputs.async_transfer)."""
        await outputs.async_transfer(self.hass, self.entity_id, targets)

    @staticmethod
    def _convert_enqueue(enqueue: str | MediaPlayerEnqueue | None) -> QueueOption | None:
        """Coerce an enqueue value (HA enum, our own string, or None) to QueueOption."""
        if enqueue is None:
            return None
        if isinstance(enqueue, MediaPlayerEnqueue):
            return QueueOption(enqueue.value)
        return QueueOption(enqueue)
