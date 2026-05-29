# My Music Library — Claude Project Instructions

## What this project is

A Home Assistant custom integration that provides a fully-featured Lovelace music player card
connected to [Music Assistant](https://music-assistant.io/).

- **Domain:** `my_music_library`
- **GitHub:** https://github.com/Patafoin/ha-my-music-library
- **Current version:** `3.7.4` (both `CARD_VERSION` in JS and `manifest.json`)
- **Target HA:** 2025.x / 2026.x, HACS compatible

---

## Repository structure

```
custom_components/my_music_library/
├── __init__.py       # Integration setup, static paths, Lovelace resource, queue Store
├── manifest.json     # Integration metadata (version must match CARD_VERSION in JS)
├── config_flow.py    # UI config flow (MA URL, default player, default tab)
├── const.py          # DOMAIN, CARD_URL, ICON_URL, etc.
├── api.py            # HTTP proxy views: search, library, subitems, queue (→ Music Assistant)
├── strings.json      # Config flow translation source
├── icon.png          # Integration icon (256×256)
├── icon.svg          # Source SVG for the icon
├── translations/
│   ├── en.json
│   ├── fr.json
│   └── de.json
└── www/
    └── my-music-library-card.js   # Lovelace custom element (vanilla JS, no build step)

custom_integrations/my_music_library/
├── icon.png          # 256×256 — for home-assistant/brands
└── icon@2x.png       # 512×512 — for home-assistant/brands

tests/
├── conftest.py       # sys.modules stubs for homeassistant.*
├── test_const.py
├── test_init.py
└── test_config_flow.py
```

---

## Architecture

### Backend (Python)
- Thin integration: no polling coordinator, no entities
- `async_setup`: initialises per-player queue Store (`homeassistant.helpers.storage.Store`)
- `async_setup_entry`: registers static paths (card JS, icon), Lovelace resource, HTTP views, WebSocket command
- HTTP views in `api.py`:
  - `MusicAssistantSearchView` — proxy search to MA REST API
  - `MusicAssistantLibraryView` — proxy library browse to MA Python client
  - `MusicAssistantSubitemsView` — proxy artist/album/playlist sub-items
  - `PlayerQueueView` — GET/POST per-player queue storage (`/api/my_music_library/queue?player=<entity_id>`)
- WebSocket command `my_music_library/config` — returns MA entry_id + default player to the card

### Frontend (JavaScript)
- Vanilla JS Custom Element (`MyMusicLibraryCard extends HTMLElement`), no build step
- Communicates with HA via `hass.callService`, `hass.callWS`, `hass.callApi`
- Three tabs: **Player** (now playing + controls + queue), **Search**, **Library**
- Queue stored server-side per player via `POST /api/my_music_library/queue`
- Responsive layout:
  - `< 480px`: nav tabs stack (icon above label)
  - `< 640px`: player stacked (art + controls + queue below)
  - `≥ 640px`: player panel (2/3) + queue panel (1/3) side-by-side
  - `≥ 1024px`: larger fonts, taller modals

---

## Critical rules (always follow)

### Versioning — NEVER skip this
Every code change **must** bump the version in **both** places simultaneously:
1. `www/my-music-library-card.js` → `const CARD_VERSION = "X.Y.Z";`
2. `manifest.json` → `"version": "X.Y.Z"`

Both must always be identical. The JS version busts the browser cache; the manifest version is what HA displays.

### Translations — update all 3 languages
The card supports `en`, `fr`, `de`. Every new user-visible string must be added to all three language blocks of the `TRANSLATIONS` const in `my-music-library-card.js`. Access strings with `this._t("section.key")`.

For the Python config flow: update `strings.json` + `translations/en.json`, `translations/fr.json`, `translations/de.json`.

### Deploy instructions
Always include at the end of each coding session:
1. Which files to copy to `/config/custom_components/my_music_library/` on HA
2. Whether a **full HA restart** is needed (always required for Python changes) or just a hard refresh
3. Hard refresh = Ctrl+Shift+R to bypass Lovelace cache for JS-only changes

---

## Card YAML configuration

```yaml
type: custom:my-music-library-card
default_tab: player          # player | search | library
height: 600                  # px, number, or CSS value — omit to fill container
entity: media_player.xxx     # pre-select a player

# Option 1: Legacy nav buttons (still supported)
nav_buttons_left:            # custom buttons left of tab bar
  - icon: mdi:home
    tap_action: { action: navigate, navigation_path: / }
nav_buttons_right:           # custom buttons right of tab bar
  - icon: mdi:lightbulb
    entity: light.living_room
    tap_action: { action: toggle }
    hold_action: { action: more-info }

# Option 2: Fully configurable tabs (v3.2.0+, overrides nav_buttons_*)
tabs:
  - type: player
    label: "My Player"       # optional custom label (overrides i18n)
    icon: "mdi:play-circle"  # optional custom icon (mdi icon)
  - type: search
  - type: library
    layout: lanes            # lanes | grid | columns | auto (v3.5.0+)
    sections:                # optional: which sections, in which order
      - artists
      - albums
      - playlists
      - tracks
      - radios               # new in v3.2.0
  - type: button             # action button in the tab bar
    icon: mdi:home
    name: "Home"
    tap_action: { action: navigate, navigation_path: / }
  - type: settings           # settings tab (positionable)
```

### Tab types
- `player`, `search`, `library`, `settings`: built-in panel tabs
- `button`: action button (supports tap/hold/double-tap actions)

### Library sections
When `tabs[].type == "library"`, the optional `sections` array controls which media types appear and in what order. Valid values: `artists`, `albums`, `playlists`, `tracks`, `radios`. Defaults to `[artists, albums, playlists, tracks]`.

### Library layout (v3.5.0+)
The `layout` option on the library tab controls how sections are displayed:
- `lanes` (default): horizontal scroll lanes per section — scrollbar visible on desktop, arrows on hover
- `grid`: responsive CSS grid that wraps items to fill all available space
- `columns`: sections displayed side-by-side in columns (falls back to stacked on mobile < 640px)
- `auto`: adaptive — 1 section → grid, 2 sections → columns on desktop / grid on mobile, 3+ → lanes

Users can also switch layout at runtime via the Settings panel (persisted in localStorage).

### Nav button actions
`tap_action`, `hold_action`, `double_tap_action` support:
- `none`, `toggle`, `more-info`, `navigate` (+ `navigation_path`), `url` (+ `url_path`), `call-service` / `perform-action` (+ `perform_action`, `data`, `target`), `assist`

---

## Queue system

- Queue is stored server-side in HA (`homeassistant.helpers.storage.Store`, key: `my_music_library_queues`)
- One queue per `media_player` entity, shared across all browsers/devices
- Card loads queue on startup and whenever the active player changes
- Auto-detects when MA switches to a track not in the current queue → clears stale queue
- Endpoint: `GET /api/my_music_library/queue?player=<entity_id>` → `{queue: [], source: null}`
- Endpoint: `POST /api/my_music_library/queue` body: `{player, queue, source}`

---

## Integration icon

- `icon.png` (256×256) served at `/api/config/custom_components/my_music_library/icon`
- `custom_integrations/my_music_library/` folder follows `home-assistant/brands` structure
- Generated via `/tmp/gen_icon.py` (pure Python stdlib, no Pillow)

---

## Development environment

- **macOS**, no Xcode CLI tools → no C extensions → `homeassistant` pip package not installable
- Python 3.9 (system) available
- Tests use `sys.modules` stubs in `conftest.py` — run: `python3 -m pytest tests/ -v`
- No Homebrew, no git initially (git initialised for GitHub push)
- **No automatic git push** — user explicitly requests pushes

---

## Python standards

- Python 3.12+ target (tests run on 3.9 with stubs)
- `from __future__ import annotations` on all Python files
- Type hints on all functions and class attributes
- Async-first: all I/O must be `async`
- Use `homeassistant.helpers.aiohttp_client` for HTTP (never bare `aiohttp`)
