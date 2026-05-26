# My Music Library — Home Assistant Integration

A custom Home Assistant integration that provides a fully-featured Lovelace music player card connected to [Music Assistant](https://music-assistant.io/).

![Version](https://img.shields.io/badge/version-3.6.0-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2025.x%2B-brightgreen)
![HACS](https://img.shields.io/badge/HACS-default-41BDF5)

---

## Features

- **Now Playing** — album art, track title, artist, progress bar, volume control
- **Playback controls** — play/pause, previous, next, shuffle, repeat (off / all / one)
- **Queue** — live queue display alongside the player, persisted server-side per player across page reloads and devices
- **Search** — full-text search across artists, albums, tracks and playlists via Music Assistant
- **Library** — browse artists, albums, playlists, tracks and radios with source filter (All / Local / Streaming) and favorites toggle; **Browse mode** to navigate the filesystem directory tree and play folders
- **Multi-player** — device picker to select and switch between any media player; supports grouping (attach / detach players)
- **Player exclusion** — hide specific players from the device picker via integration options; supports wildcard patterns (`media_player.browser_mod_*`)
- **Fully configurable tabs** — reorder, rename, re-icon any tab; add action buttons in the tab bar; control which library sections appear and in what order
- **Visual card editor** — WYSIWYG editor in the Lovelace UI: drag-and-drop tab reorder, live preview, no YAML needed
- **Debug logging** — toggleable from integration options; detailed logs in HA and browser console for troubleshooting
- **Responsive layout** — stacked on mobile, side-by-side on tablet/desktop; horizontal scroll nav bar for small screens
- **Multilingual** — English, French, German (auto-detected from HA language setting)

---

## Requirements

- Home Assistant 2025.1 or later
- [Music Assistant](https://music-assistant.io/) integration installed and configured

---

## Installation

### Via HACS

1. Open HACS, search for **My Music Library** and install it.
2. Restart Home Assistant.
3. Go to **Settings > Devices & Services > Add Integration** and search for **My Music Library**.
4. Follow the setup flow (select your default player and default tab). The Music Assistant server is discovered automatically from the `mass` integration.

> The Lovelace card resource is registered automatically — no manual resource addition required.

---

## Integration Options

After installation, you can configure additional options via **Settings > Devices & Services > My Music Library > Configure**.

### Hidden players

Select one or more media player entities to hide from the device picker inside the card. This is useful to exclude virtual players, browser tabs, or any device you do not want to see in the list.

You can also type a **wildcard pattern** (e.g. `media_player.browser_mod_*`) and press **Enter** to exclude all matching players at once.

### Debug logging

Enable the **"Enable debug logging"** toggle to activate detailed logging:

- **HA logs** — go to **Settings > System > Logs**, filter by `my_music_library` to see all backend activity (API calls, MA client, queue operations, etc.)
- **Browser console** — press **F12**, go to the Console tab, filter by `[MML]` to see frontend activity (config loading, search strategies, player selection, library loading, playback, etc.)

A pulsing orange **"Debug mode is active"** banner appears in the card's Settings panel as a reminder to disable it when you're done.

> Changes take effect immediately — no restart or refresh needed for the backend logs. Do a hard refresh (Ctrl+Shift+R) to pick up the frontend debug flag.

---

## Adding the Card to a Dashboard

In your dashboard, click **Add Card > Custom: My Music Library Card**. The visual editor lets you configure everything with no YAML needed.

Or use the YAML editor:

```yaml
type: custom:my-music-library-card
```

---

## Card Configuration (YAML)

All options are optional.

### Configurable tabs (recommended)

The `tabs` array gives you full control over which tabs appear, their order, labels, icons, and lets you insert action buttons anywhere in the tab bar.

```yaml
type: custom:my-music-library-card
default_tab: player
height: 600
entity: media_player.my_speaker

tabs:
  - type: player
    label: "My Player"          # optional custom label (overrides i18n)
    icon: "mdi:play-circle"     # optional custom icon

  - type: search

  - type: library
    sections:                   # optional: which sections, in which order
      - artists
      - albums
      - playlists
      - tracks
      - radios

  - type: button                # action button in the tab bar
    icon: mdi:home
    name: "Home"
    tap_action:
      action: navigate
      navigation_path: /

  - type: settings              # settings tab (positionable)
```

#### Tab types

| Type | Description |
|---|---|
| `player` | Now playing, controls, queue |
| `search` | Full-text search |
| `library` | Browse library with source/favorites filters |
| `settings` | Integration settings (providers, debug indicator) |
| `button` | Action button (supports tap/hold/double-tap actions) |

#### Library sections

When `type: library`, the optional `sections` array controls which media types appear and in what order.

Valid values: `artists`, `albums`, `playlists`, `tracks`, `radios`.

Defaults to `[artists, albums, playlists, tracks]` when omitted.

### Legacy nav buttons (still supported)

For backward compatibility, `nav_buttons_left` and `nav_buttons_right` are still supported. If `tabs` is provided, these are ignored.

```yaml
type: custom:my-music-library-card
default_tab: player
height: 600
entity: media_player.my_speaker

nav_buttons_left:
  - icon: mdi:home
    tap_action:
      action: navigate
      navigation_path: /

nav_buttons_right:
  - icon: mdi:lightbulb
    entity: light.living_room
    tap_action:
      action: toggle
    hold_action:
      action: more-info
```

### General options

| Option | Type | Default | Description |
|---|---|---|---|
| `default_tab` | `string` | `player` | Tab shown on load: `player`, `search`, or `library` |
| `height` | `number` or `string` | auto | Fixed card height (e.g. `600`, `"600px"`, `"80vh"`). Omit to fill the container. |
| `entity` | `string` | — | Pre-select a media_player entity. User's runtime choice is saved in localStorage. |

---

## Button Actions

Button tabs and legacy nav buttons support `tap_action`, `hold_action`, and `double_tap_action`.

### Button properties

| Property | Type | Description |
|---|---|---|
| `icon` | `string` | MDI icon name (e.g. `mdi:home`). Falls back to the entity's icon if `entity` is set. |
| `name` | `string` | Tooltip label shown on hover. |
| `entity` | `string` | HA entity ID. When provided the button highlights when the entity is `on`, `playing`, `active` or `home`. |
| `width` | `number \| string` | Button width override (px or CSS value). |
| `height` | `number \| string` | Button height override. |
| `tap_action` | `Action` | Action fired on a single click. |
| `hold_action` | `Action` | Action fired after holding for 500 ms. |
| `double_tap_action` | `Action` | Action fired on a double-click. |

### Action object

| `action` | Description | Extra fields |
|---|---|---|
| `none` | Do nothing. | — |
| `toggle` | Toggle an entity on/off. | `entity_id` (defaults to button's `entity`) |
| `more-info` | Open the More Info dialog. | `entity_id` |
| `navigate` | Navigate to a HA path. | `navigation_path: /lovelace/0` |
| `url` | Open a URL. | `url_path: https://…`, `new_tab: true` |
| `call-service` / `perform-action` | Call a HA service. | `perform_action: domain.service`, `data: {}`, `target: {}` |
| `assist` | Open the Assist dialog. | — |

---

## Full Configuration Example

```yaml
type: custom:my-music-library-card
default_tab: player
height: 650
entity: media_player.kitchen_speaker
tabs:
  - type: button
    icon: mdi:home
    name: Home
    tap_action:
      action: navigate
      navigation_path: /lovelace/home

  - type: player

  - type: search

  - type: library
    sections:
      - artists
      - albums
      - playlists
      - tracks
      - radios

  - type: button
    icon: mdi:lightbulb
    name: Lights
    entity: light.living_room
    tap_action:
      action: toggle
    hold_action:
      action: more-info

  - type: settings
```

---

## Troubleshooting

If something isn't working as expected:

1. **Enable debug logging** — go to **Settings > Devices & Services > My Music Library > Configure** and turn on **"Enable debug logging"**
2. **Reproduce the issue**
3. **Collect logs:**
   - **Backend (HA logs):** Settings > System > Logs, filter by `my_music_library`
   - **Frontend (browser console):** press F12, Console tab, filter by `[MML]`
4. **Open an issue** on [GitHub](https://github.com/Patafoin/ha-my-music-library/issues) — the issue template will guide you through what to include
5. **Disable debug logging** when done

### Common issues

| Problem | Solution |
|---|---|
| Card shows "configuration error" after update | Hard refresh: Ctrl+Shift+R |
| Search returns "unavailable" | Check that Music Assistant integration is installed and running |
| Library is empty | Check MA connection; try toggling the source filter (All / Local / Streaming) |
| No players found | Make sure at least one MA media player entity is enabled and not in `unavailable` state |
| Players missing from picker | Check that they're not in the hidden players list (integration options) |

---

## Project Structure

```
custom_components/my_music_library/
├── __init__.py          # Integration setup, static paths, Lovelace resource registration,
│                        # WebSocket command (my_music_library/config),
│                        # per-player queue and group storage (Store),
│                        # debug mode toggle
├── manifest.json        # Integration metadata (version, dependencies)
├── config_flow.py       # UI configuration flow (setup + options: excluded players, debug mode)
├── const.py             # Domain constants
├── api.py               # HTTP views (search, library, browse, subitems, queue, groups → MA)
├── strings.json         # Config flow translation source
├── brand/
│   ├── icon.png         # Integration icon 256x256
│   ├── icon@2x.png      # Integration icon 512x512
│   ├── logo.png         # Logo 256x256 (home-assistant/brands)
│   └── logo@2x.png      # Logo 512x512 (home-assistant/brands)
├── translations/
│   ├── en.json
│   ├── fr.json
│   └── de.json
└── www/
    └── my-music-library-card.js   # Lovelace custom element (vanilla JS, no build step)
```

---

## Changelog

### 3.4.0
- **Feature** — toggleable **debug logging** via integration options. When enabled, Python logs switch to DEBUG level (visible in HA logs with filter `my_music_library`) and the JS card outputs detailed `[MML]` traces in the browser console for config, API calls, search strategies, library loading, player selection, queue, and playback.
- **Feature** — pulsing orange debug indicator banner in the Settings modal when debug mode is active.
- **Feature** — GitHub issue template with step-by-step debug log collection instructions.

### 3.3.0
- **Feature** — visual **WYSIWYG card editor** for Lovelace UI: drag-and-drop tab reorder, inline configuration of labels, icons, library sections, and button actions — no YAML needed.

### 3.2.0
- **Feature** — **fully configurable tabs** via YAML `tabs` array: reorder, rename, re-icon any tab; insert action buttons anywhere in the tab bar; control which library sections appear and their order.
- **Feature** — **radios** support in the library (new section type).
- **Feature** — `settings` tab type, positionable in the tab bar.
- **Backward compatible** — `nav_buttons_left` / `nav_buttons_right` still work if `tabs` is not provided.

### 3.1.5
- **Feature** — horizontal scroll **nav bar** for mobile accessibility; fade indicators on scroll edges.

### 3.1.4
- **Fix** — robust cover art loading with fallback chain and debug logs.

### 3.1.3
- **Fix** — `customElements.define` guarded with `customElements.get` so a double module load never triggers "already been used with this registry".
- **Fix** — removed `add_extra_js_url` registration: HA's `scoped-custom-element-registry` polyfill was causing the card module to be evaluated twice. The Lovelace resource mechanism alone is the correct approach for custom cards.

### 3.1.2
- **Fix** — reliable browser cache-busting with versioned Lovelace resource URL (`?v=X.Y.Z`). Delete-first, add-after strategy prevents `customElements.define` conflicts on upgrade.

### 3.1.1
- **Fix** — Ctrl+Shift+R after upgrade no longer shows "configuration error".
- **Fix** — Settings modal: library providers always loaded regardless of `ma_entry_id`.
- **Fix** — `_get_providers_via_ma_client`: direct `getattr` access on `ProviderInstance` objects for compatibility with all MA model versions.

### 3.0.2
- **Fix** — card invisible after fresh install: `frontend` and `lovelace` made hard dependencies in `manifest.json`.

### 3.0.1
- **Fix** — Lovelace card not appearing in picker after fresh HACS install. Registration deferred to `EVENT_HOMEASSISTANT_STARTED`.
- **Fix** — YAML-mode fallback and `add_extra_js_url()` last-resort fallback.

### 3.0.0
- **Refactor** — MA connectivity rewritten: integration discovers the MA client via the `mass` config entry instead of managing its own connection.
- **Fix** — MA domain corrected to `"mass"` with `"music_assistant"` as legacy fallback.
- **Improvement** — MA URL auto-discovered from the `mass` config entry.

### 2.9.6
- **Fix** — browse: MA virtual "back" items intercepted and translated to breadcrumb navigation.

### 2.9.5
- **Fix** — browse: root level no longer erroneously filtered.

### 2.9.4
- **Fix** — browse: MA virtual `back` items filtered server-side.

### 2.9.3
- **Fix** — browse: breadcrumb navigation displayed in all states (loading, empty, error).
- **Fix** — browse: MA URI prefix `folder/` stripped server-side.

### 2.9.2
- **Fix** — browse: `mass.browse()` tried at top-level for compatibility with all MA versions.
- **Fix** — library mode toggle: switching between Catalogue and Browse takes effect immediately.

### 2.9.1
- **Feature** — Library **Browse mode**: navigate the local filesystem directory tree, play files or folders.
- **Backend** — new endpoint `GET /api/my_music_library/browse?uri=<uri>`.

### 2.9.0
- **Fix** — volume slider and progress bar: commands sent only on pointer release, not during drag.

### 2.8.9
- **Fix** — library source filter works correctly; provider mappings properly serialized.
- **Improvement** — progressive rendering, auto-pagination, parallel search strategies, 700 ms debounce.

### 2.8.5
- **Feature** — library source filter (All / Local / Streaming) and favorites toggle.

### 2.8.2
- **Fix** — device picker reflects updated exclusion list without full page refresh.

### 2.8.1
- **Fix** — stale group members no longer persist across player switches.

### 2.8.0
- **Feature** — player grouping: attach and detach players from the device picker.

### 2.7.0
- **Feature** — player exclusion via integration options with wildcard pattern support.

### 2.6.0
- **Feature** — server-side queue persistence per player, shared across browsers/devices.
- **Feature** — auto-detection of externally triggered album/playlist changes.

### 2.5.0
- **Feature** — custom tab-bar buttons with tap/hold/double-tap actions.
- **Feature** — `height` and `entity` card config options.

### 2.4.0
- **Feature** — Library tab with infinite scroll / pagination.

### 2.3.0
- **Feature** — Search tab.

### 2.2.0
- **Feature** — multilingual support (en, fr, de) and responsive layout.

### 2.1.0
- **Feature** — device picker with localStorage persistence.

### 2.0.0
- Initial public release.

---

## License

MIT
