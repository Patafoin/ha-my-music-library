"""Tests for My Music Library API helpers."""
from __future__ import annotations

from unittest.mock import MagicMock

from custom_components.my_music_library.api import _get_ma_token, _get_ma_url
from custom_components.my_music_library.const import CONF_MA_TOKEN, CONF_MA_URL, DOMAIN


def _make_hass(data: dict, options: dict | None = None) -> MagicMock:
    entry = MagicMock()
    entry.data = data
    entry.options = options or {}
    hass = MagicMock()
    hass.config_entries.async_entries.return_value = [entry]
    return hass


class TestGetMaToken:
    def test_returns_none_when_no_entries(self):
        hass = MagicMock()
        hass.config_entries.async_entries.return_value = []
        assert _get_ma_token(hass) is None

    def test_returns_none_when_token_absent(self):
        hass = _make_hass(data={CONF_MA_URL: "http://ma.local:8095"})
        assert _get_ma_token(hass) is None

    def test_returns_none_when_token_empty_string(self):
        hass = _make_hass(data={CONF_MA_TOKEN: ""})
        assert _get_ma_token(hass) is None

    def test_returns_token_from_data(self):
        hass = _make_hass(data={CONF_MA_TOKEN: "abc123"})
        assert _get_ma_token(hass) == "abc123"

    def test_options_overrides_data(self):
        hass = _make_hass(
            data={CONF_MA_TOKEN: "old_token"},
            options={CONF_MA_TOKEN: "new_token"},
        )
        assert _get_ma_token(hass) == "new_token"

    def test_options_empty_falls_back_to_data(self):
        hass = _make_hass(
            data={CONF_MA_TOKEN: "data_token"},
            options={CONF_MA_TOKEN: ""},
        )
        assert _get_ma_token(hass) == "data_token"


class TestGetMaUrl:
    def test_returns_none_when_no_entries(self):
        hass = MagicMock()
        hass.config_entries.async_entries.return_value = []
        assert _get_ma_url(hass) is None

    def test_strips_trailing_slash(self):
        hass = _make_hass(data={CONF_MA_URL: "http://ma.local:8095/"})
        assert _get_ma_url(hass) == "http://ma.local:8095"

    def test_returns_none_when_url_empty(self):
        hass = _make_hass(data={CONF_MA_URL: ""})
        assert _get_ma_url(hass) is None
