"""Tests for My Music Library API helpers."""
from __future__ import annotations

from unittest.mock import MagicMock

from custom_components.my_music_library.api import (
    _get_mass_url,
    _item_dedup_key,
    _merge_search_results,
    _normalize_browse_item,
    _normalize_library_item,
)
from custom_components.my_music_library.const import CONF_MA_URL, DOMAIN


def _make_hass_with_ma_entry(url: str | None = None, domain: str = "mass") -> MagicMock:
    entry = MagicMock()
    entry.domain = domain
    entry.data = {"url": url} if url else {}
    hass = MagicMock()
    hass.config_entries.async_entries.side_effect = lambda d=None: (
        [entry] if d == domain else []
    )
    return hass


class TestGetMassUrl:
    def test_returns_none_when_no_entries(self):
        hass = MagicMock()
        hass.config_entries.async_entries.return_value = []
        assert _get_mass_url(hass) is None

    def test_returns_url_from_ma_entry(self):
        hass = _make_hass_with_ma_entry("http://ma.local:8095/")
        assert _get_mass_url(hass) == "http://ma.local:8095"

    def test_strips_trailing_slash(self):
        hass = _make_hass_with_ma_entry("http://ma.local:8095/")
        assert _get_mass_url(hass) == "http://ma.local:8095"


class TestNormalizeLibraryItem:
    def test_basic_track(self):
        item = {
            "name": "My Track",
            "uri": "spotify://track/123",
            "media_type": "track",
            "duration": 180,
            "artists": [{"name": "Artist One"}],
        }
        result = _normalize_library_item(item)
        assert result["title"] == "My Track"
        assert result["media_content_id"] == "spotify://track/123"
        assert result["media_content_type"] == "track"
        assert result["media_artist"] == "Artist One"
        assert result["duration"] == 180.0

    def test_thumbnail_from_metadata_images(self):
        item = {
            "name": "Album",
            "uri": "spotify://album/456",
            "media_type": "album",
            "metadata": {"images": [{"path": "http://img.example.com/cover.jpg"}]},
        }
        result = _normalize_library_item(item)
        assert result["thumbnail"] == "/my_music_library/thumb?path=http%3A%2F%2Fimg.example.com%2Fcover.jpg"

    def test_empty_item(self):
        result = _normalize_library_item({})
        assert result["title"] == ""
        assert result["media_content_id"] == ""


class TestNormalizeBrowseItem:
    def test_folder_item(self):
        item = {
            "name": "My Folder",
            "path": "deezer://playlists",
            "media_type": "folder",
        }
        result = _normalize_browse_item(item)
        assert result["title"] == "My Folder"
        assert result["is_folder"] is True
        assert result["media_content_type"] == "folder"

    def test_media_item(self):
        item = {
            "name": "A Radio",
            "uri": "tunein://radio/123",
            "media_type": "radio",
        }
        result = _normalize_browse_item(item)
        assert result["title"] == "A Radio"
        assert result["is_folder"] is False


class TestMergeSearchResults:
    def test_merges_without_duplicates(self):
        a = {
            "tracks": [{"uri": "lib://track/1", "name": "Song A"}],
            "artists": [],
            "albums": [],
            "playlists": [],
        }
        b = {
            "tracks": [
                {"uri": "lib://track/1", "name": "Song A"},
                {"uri": "lib://track/2", "name": "Song B"},
            ],
            "artists": [{"uri": "lib://artist/1", "name": "Artist X"}],
            "albums": [],
            "playlists": [],
        }
        merged = _merge_search_results(a, b)
        assert len(merged["tracks"]) == 2
        assert merged["tracks"][0]["name"] == "Song A"
        assert merged["tracks"][1]["name"] == "Song B"
        assert len(merged["artists"]) == 1

    def test_empty_inputs(self):
        empty = {"tracks": [], "artists": [], "albums": [], "playlists": []}
        merged = _merge_search_results(empty, empty)
        assert all(len(v) == 0 for v in merged.values())

    def test_dedup_key_case_insensitive(self):
        assert _item_dedup_key({"uri": "A", "name": "B"}) == _item_dedup_key({"uri": "a", "name": "b"})
