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

DEFAULT_TAB = "player"

# Config entry schema version (see async_migrate_entry in __init__.py)
CONFIG_ENTRY_VERSION = 2

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
SERVICE_TRANSFER_QUEUE = "transfer_queue"
ATTR_TARGETS = "targets"

# Extra state attribute the card's _getMaPlayers() uses to recognize our
# media_player entities in hass.states (same attribute name mass used to expose).
ATTR_MASS_PLAYER_ID = "mass_player_id"
