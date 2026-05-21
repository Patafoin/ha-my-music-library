"""Tests for constants."""
from __future__ import annotations

from custom_components.my_music_library.const import (
    CARD_JS_FILENAME,
    CARD_URL,
    CONF_DEFAULT_PLAYER,
    CONF_DEFAULT_TAB,
    DEFAULT_TAB,
    DOMAIN,
    MUSIC_ASSISTANT_DOMAIN,
    NAME,
)


def test_domain():
    assert DOMAIN == "my_music_library"


def test_name():
    assert NAME == "My Music Library"


def test_card_url_contains_filename():
    assert CARD_JS_FILENAME in CARD_URL
    assert CARD_URL.startswith("/")


def test_default_tab():
    assert DEFAULT_TAB == "player"


def test_conf_keys():
    assert CONF_DEFAULT_PLAYER == "default_player"
    assert CONF_DEFAULT_TAB == "default_tab"


def test_music_assistant_domain():
    assert MUSIC_ASSISTANT_DOMAIN == "mass"
