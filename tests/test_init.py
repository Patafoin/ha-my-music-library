"""Tests for My Music Library __init__.py."""
from __future__ import annotations

import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.my_music_library.const import CARD_URL, DOMAIN


@pytest.fixture
def hass_with_lovelace(mock_hass):
    """Return hass mock with lovelace data."""
    resources_mock = MagicMock()
    resources_mock.async_load = AsyncMock()
    resources_mock.async_items = MagicMock(return_value=[])
    resources_mock.async_create_item = AsyncMock()
    mock_hass.data["lovelace"] = {"resources": resources_mock}
    return mock_hass, resources_mock


class TestAsyncSetup:
    async def test_async_setup_initialises_domain(self, mock_hass):
        from custom_components.my_music_library import async_setup

        result = await async_setup(mock_hass, {})

        assert result is True
        assert DOMAIN in mock_hass.data


class TestAsyncSetupEntry:
    async def test_setup_entry_registers_static_path(
        self, mock_hass, mock_config_entry, tmp_path
    ):
        from custom_components.my_music_library import async_setup_entry

        www_dir = tmp_path / "www"
        www_dir.mkdir()
        (www_dir / "my-music-library-card.js").write_text("// fake card")

        with patch(
            "custom_components.my_music_library.WWW_DIR", str(www_dir)
        ), patch(
            "custom_components.my_music_library._async_register_lovelace_resource",
            new_callable=AsyncMock,
        ):
            result = await async_setup_entry(mock_hass, mock_config_entry)

        assert result is True
        mock_hass.http.async_register_static_paths.assert_called_once()

    async def test_setup_entry_skips_double_registration(
        self, mock_hass, mock_config_entry, tmp_path
    ):
        """Second call to async_setup_entry must not re-register the static path."""
        from custom_components.my_music_library import async_setup_entry
        from custom_components.my_music_library.const import CARD_URL

        www_dir = tmp_path / "www"
        www_dir.mkdir()
        (www_dir / "my-music-library-card.js").write_text("// fake card")

        with patch(
            "custom_components.my_music_library.WWW_DIR", str(www_dir)
        ), patch(
            "custom_components.my_music_library._async_register_lovelace_resource",
            new_callable=AsyncMock,
        ):
            await async_setup_entry(mock_hass, mock_config_entry)
            # Simulate HA calling setup_entry a second time (reload)
            mock_config_entry.entry_id = "test_entry_id_2"
            await async_setup_entry(mock_hass, mock_config_entry)

        # static path must only have been registered once
        mock_hass.http.async_register_static_paths.assert_called_once()

    async def test_setup_entry_raises_if_js_missing(
        self, mock_hass, mock_config_entry, tmp_path
    ):
        from homeassistant.exceptions import ConfigEntryNotReady

        from custom_components.my_music_library import async_setup_entry

        empty_www = tmp_path / "www_empty"
        empty_www.mkdir()

        with patch("custom_components.my_music_library.WWW_DIR", str(empty_www)):
            with pytest.raises(ConfigEntryNotReady):
                await async_setup_entry(mock_hass, mock_config_entry)

    async def test_setup_entry_stores_data(
        self, mock_hass, mock_config_entry, tmp_path
    ):
        from custom_components.my_music_library import async_setup_entry

        www_dir = tmp_path / "www"
        www_dir.mkdir()
        (www_dir / "my-music-library-card.js").write_text("// fake")

        with patch(
            "custom_components.my_music_library.WWW_DIR", str(www_dir)
        ), patch(
            "custom_components.my_music_library._async_register_lovelace_resource",
            new_callable=AsyncMock,
        ):
            await async_setup_entry(mock_hass, mock_config_entry)

        assert mock_config_entry.entry_id in mock_hass.data[DOMAIN]


class TestAsyncUnloadEntry:
    async def test_unload_entry_removes_data(self, mock_hass, mock_config_entry):
        from custom_components.my_music_library import async_unload_entry

        mock_hass.data[DOMAIN] = {mock_config_entry.entry_id: {"entry": mock_config_entry}}

        result = await async_unload_entry(mock_hass, mock_config_entry)

        assert result is True
        assert mock_config_entry.entry_id not in mock_hass.data[DOMAIN]

    async def test_unload_entry_returns_false_on_failure(
        self, mock_hass, mock_config_entry
    ):
        from custom_components.my_music_library import async_unload_entry

        mock_hass.config_entries.async_unload_platforms = AsyncMock(return_value=False)
        mock_hass.data[DOMAIN] = {mock_config_entry.entry_id: {}}

        result = await async_unload_entry(mock_hass, mock_config_entry)

        assert result is False
        # Data should not be removed on failed unload
        assert mock_config_entry.entry_id in mock_hass.data[DOMAIN]


class TestLovelaceResourceRegistration:
    async def test_registers_resource_when_not_present(
        self, hass_with_lovelace
    ):
        from custom_components.my_music_library import _async_register_lovelace_resource

        hass, resources_mock = hass_with_lovelace
        await _async_register_lovelace_resource(hass, CARD_URL, CARD_URL)

        resources_mock.async_create_item.assert_called_once_with(
            {"res_type": "module", "url": CARD_URL}
        )

    async def test_skips_if_already_registered(self, hass_with_lovelace):
        from custom_components.my_music_library import _async_register_lovelace_resource

        hass, resources_mock = hass_with_lovelace
        resources_mock.async_items = MagicMock(
            return_value=[{"url": CARD_URL, "res_type": "module", "id": "1"}]
        )

        await _async_register_lovelace_resource(hass, CARD_URL, CARD_URL)

        resources_mock.async_create_item.assert_not_called()

    async def test_handles_missing_lovelace_gracefully(self, mock_hass):
        from custom_components.my_music_library import _async_register_lovelace_resource

        # No lovelace in hass.data — should log warning and not crash
        await _async_register_lovelace_resource(mock_hass, CARD_URL, CARD_URL)
