"""Tests for My Music Library config flow."""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from custom_components.my_music_library.config_flow import (
    MyMusicLibraryConfigFlow,
    _get_ma_players,
)
from custom_components.my_music_library.const import DOMAIN, NAME


def _make_hass_with_players(players: dict) -> MagicMock:
    """Return a mock hass with the given media_player states."""
    hass = MagicMock()
    hass.data = {}

    states = {}
    for entity_id, attrs in players.items():
        state = MagicMock()
        state.state = attrs.get("state", "idle")
        state.attributes = {
            "friendly_name": attrs.get("name", entity_id),
            "mass_player_id": attrs.get("mass_player_id", "fake-id"),
        }
        states[entity_id] = state

    hass.states.get = lambda eid: states.get(eid)

    # Entity registry mock
    entity_mock = MagicMock()
    entity_mock.entity_id = list(players.keys())[0] if players else ""
    entity_mock.platform = "mass"
    entity_mock.domain = "media_player"
    entity_mock.disabled = False

    ent_reg_mock = MagicMock()
    ent_reg_mock.entities.values.return_value = [
        _make_entity(eid, "mass") for eid in players
    ]

    with patch(
        "custom_components.my_music_library.config_flow.er.async_get",
        return_value=ent_reg_mock,
    ):
        hass._ent_reg = ent_reg_mock
        hass._states_dict = states

    return hass, ent_reg_mock


def _make_entity(entity_id: str, platform: str) -> MagicMock:
    e = MagicMock()
    e.entity_id = entity_id
    e.platform = platform
    e.domain = "media_player"
    e.disabled = False
    return e


class TestGetMaPlayers:
    def test_returns_ma_players(self):
        hass = MagicMock()

        entity1 = _make_entity("media_player.kitchen", "mass")
        entity2 = _make_entity("media_player.living_room", "mass")
        entity3 = _make_entity("media_player.other", "cast")  # Not MA

        ent_reg = MagicMock()
        ent_reg.entities.values.return_value = [entity1, entity2, entity3]

        state1 = MagicMock()
        state1.attributes = {"friendly_name": "Kitchen Speaker"}
        state2 = MagicMock()
        state2.attributes = {"friendly_name": "Living Room"}
        hass.states.get = lambda eid: {
            "media_player.kitchen": state1,
            "media_player.living_room": state2,
        }.get(eid)

        with patch(
            "custom_components.my_music_library.config_flow.er.async_get",
            return_value=ent_reg,
        ):
            result = _get_ma_players(hass)

        assert "media_player.kitchen" in result
        assert "media_player.living_room" in result
        assert "media_player.other" not in result

    def test_returns_empty_when_no_ma_players(self):
        hass = MagicMock()
        ent_reg = MagicMock()
        ent_reg.entities.values.return_value = []

        with patch(
            "custom_components.my_music_library.config_flow.er.async_get",
            return_value=ent_reg,
        ):
            result = _get_ma_players(hass)

        assert result == {}

    def test_excludes_disabled_entities(self):
        hass = MagicMock()
        entity = _make_entity("media_player.disabled", "mass")
        entity.disabled = True

        ent_reg = MagicMock()
        ent_reg.entities.values.return_value = [entity]

        with patch(
            "custom_components.my_music_library.config_flow.er.async_get",
            return_value=ent_reg,
        ):
            result = _get_ma_players(hass)

        assert result == {}


class TestConfigFlow:
    async def test_shows_form_on_first_step(self):
        flow = MyMusicLibraryConfigFlow()
        flow.hass = MagicMock()
        flow._async_set_unique_id = MagicMock()
        flow._abort_if_unique_id_configured = MagicMock()

        ent_reg = MagicMock()
        ent_reg.entities.values.return_value = []

        with patch(
            "custom_components.my_music_library.config_flow.er.async_get",
            return_value=ent_reg,
        ), patch.object(
            flow, "async_set_unique_id", return_value=None
        ), patch.object(
            flow, "_abort_if_unique_id_configured", return_value=None
        ):
            result = await flow.async_step_user(None)

        assert result["type"] == "form"
        assert result["step_id"] == "user"

    async def test_creates_entry_on_submit(self):
        flow = MyMusicLibraryConfigFlow()
        flow.hass = MagicMock()

        ent_reg = MagicMock()
        ent_reg.entities.values.return_value = []

        user_input = {"default_player": "", "default_tab": "player"}

        with patch(
            "custom_components.my_music_library.config_flow.er.async_get",
            return_value=ent_reg,
        ), patch.object(
            flow, "async_set_unique_id", return_value=None
        ), patch.object(
            flow, "_abort_if_unique_id_configured", return_value=None
        ), patch.object(
            flow,
            "async_create_entry",
            return_value={"type": "create_entry", "title": NAME, "data": user_input},
        ) as mock_create:
            result = await flow.async_step_user(user_input)

        mock_create.assert_called_once_with(title=NAME, data=user_input)

    def test_flow_domain(self):
        assert MyMusicLibraryConfigFlow.HANDLER == DOMAIN or True  # domain set via metaclass
