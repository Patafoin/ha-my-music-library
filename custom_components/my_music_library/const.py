"""Constants for My Music Library."""
from __future__ import annotations

DOMAIN = "my_music_library"
NAME = "My Music Library"

CONF_DEFAULT_PLAYER = "default_player"
CONF_DEFAULT_TAB = "default_tab"
CONF_MA_URL = "ma_url"
CONF_EXCLUDED_PLAYERS = "excluded_players"

DEFAULT_TAB = "player"
DEFAULT_MA_URL = "http://homeassistant.local:8095"

MUSIC_ASSISTANT_DOMAIN = "music_assistant"

CARD_JS_FILENAME = "my-music-library-card.js"
CARD_URL = f"/my_music_library/{CARD_JS_FILENAME}"
ICON_URL = f"/api/config/custom_components/{DOMAIN}/icon"

# WebSocket command exposed to the frontend card
WS_CONFIG_COMMAND = f"{DOMAIN}/config"
