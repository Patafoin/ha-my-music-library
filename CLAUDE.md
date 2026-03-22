# Home Assistant Custom Integration - Claude Code Instructions

## Project Overview
This is a Home Assistant custom integration project. Target: latest HA release (2025.x / 2026.x).

## Integration Name
- Domain: `my_integration` (rename folder + update `DOMAIN` const when decided)
- HACS compatible

## HA Development Standards

### Code Style
- Python 3.12+
- Type hints required on all functions and class attributes
- Use `from __future__ import annotations`
- Follow HA coding style: https://developers.home-assistant.io/docs/development_guidelines

### Key HA Patterns
- Always use `config_flow.py` for setup (no `configuration.yaml` only integrations)
- Use `DataUpdateCoordinator` for polling integrations
- Use `entity_description` pattern for entities (HA 2022.5+)
- Translations in `strings.json` + `translations/en.json`
- Use `homeassistant.helpers.aiohttp_client` for HTTP calls (never bare `aiohttp`)
- Use `homeassistant.helpers.device_registry` and `entity_registry` APIs
- Async-first: all I/O must be `async`

### manifest.json Requirements
- `iot_class`: one of `cloud_polling`, `cloud_push`, `local_polling`, `local_push`, `assumed_state`, `calculated`
- `version`: semver (e.g. `1.0.0`)
- `requirements`: pip packages needed
- `dependencies`: other HA integrations needed
- `codeowners`: GitHub usernames

### File Structure
```
custom_components/my_integration/
├── __init__.py          # Setup & unload entry
├── manifest.json        # Integration metadata
├── config_flow.py       # UI configuration flow
├── const.py             # Constants (DOMAIN, etc.)
├── coordinator.py       # DataUpdateCoordinator (if polling)
├── entity.py            # Base entity class
├── sensor.py            # Sensor platform (if needed)
├── binary_sensor.py     # Binary sensor platform (if needed)
├── switch.py            # Switch platform (if needed)
├── strings.json         # Translation source
└── translations/
    └── en.json          # English translations
tests/
├── conftest.py
└── test_*.py
```

### Testing
- Use `pytest-homeassistant-custom-component` for tests
- Mock external APIs with `unittest.mock` or `pytest-mock`
- Run tests: `pytest tests/`

### Common Imports
```python
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, CoordinatorEntity
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
```

## Development Setup
- Install deps: `pip install -r requirements_dev.txt`
- Lint: `ruff check custom_components/`
- Format: `ruff format custom_components/`
- Type check: `mypy custom_components/`
- Tests: `pytest tests/ -v`
