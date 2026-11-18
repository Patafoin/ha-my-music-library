"""Constants for My Music Library."""
from __future__ import annotations

DOMAIN = "my_music_library"
NAME = "My Music Library"

CONF_DEFAULT_PLAYER = "default_player"
CONF_DEFAULT_TAB = "default_tab"
CONF_MA_URL = "ma_url"
CONF_MA_TOKEN = "ma_token"
CONF_DEBUG_MODE = "debug_mode"
CONF_EXCLUDED_PLAYERS = "excluded_players"
# Mode the card's output panel opens on (options): switch | group | control
CONF_DEFAULT_OUTPUT_MODE = "default_output_mode"

# Profiles (config subentries): one Music Assistant account (token) ↔ the Home Assistant users who may use it
SUBENTRY_TYPE_PROFILE = "profile"
CONF_PROFILE_NAME = "name"
# Home Assistant user whose default profile this is (one profile per user at most; "" = none)
CONF_HA_USER = "ha_user"
# Other Home Assistant users who may use this profile (named by their card, or chosen per output)
CONF_HA_USERS = "ha_users"
# Up to config entry version 2: a profile allowed to borrow every other profile (migrated to ha_users)
CONF_CAN_SWITCH_USER = "can_switch_user"
# Outputs (our media_player entity_ids) a profile's default users may use; empty: all, see profiles.allowed_players
CONF_ALLOWED_PLAYERS = "allowed_players"
# Header the card sends with the profile (subentry id) it runs as, see profiles.user_scoped
PROFILE_HEADER = "X-MML-Profile"

DEFAULT_TAB = "player"
OUTPUT_MODES = ("switch", "group", "control")
DEFAULT_OUTPUT_MODE = "switch"

# Config entry schema version (see async_migrate_entry in __init__.py)
CONFIG_ENTRY_VERSION = 3

CARD_JS_FILENAME = "my-music-library-card.js"
CARD_URL = f"/my_music_library/{CARD_JS_FILENAME}"
ICON_URL = f"/{DOMAIN}/icon.png"

# WebSocket command exposed to the frontend card
WS_CONFIG_COMMAND = f"{DOMAIN}/config"
# WebSocket subscription streaming MA queue changes to the card (queue_push.py)
WS_SUBSCRIBE_QUEUE_COMMAND = f"{DOMAIN}/subscribe_queue"
SIGNAL_QUEUE_EVENT = f"{DOMAIN}_queue_event"

# Timeouts for the native Music Assistant connection (mass_connection.py)
MA_CONNECT_TIMEOUT = 10
MA_LISTEN_READY_TIMEOUT = 30

# Custom entity service on our own media_player platform (replaces mass's
# music_assistant.play_media — schema trimmed to what the card actually calls)
SERVICE_PLAY_MEDIA = "play_media"
ATTR_MEDIA_ID = "media_id"
ATTR_ENQUEUE = "enqueue"
ATTR_RADIO_MODE = "radio_mode"
ATTR_PROFILE = "profile"
SERVICE_TRANSFER_QUEUE = "transfer_queue"
ATTR_TARGETS = "targets"

# Extra state attribute the card's _getMaPlayers() uses to recognize our
# media_player entities in hass.states (same attribute name mass used to expose).
ATTR_MASS_PLAYER_ID = "mass_player_id"
