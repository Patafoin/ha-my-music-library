# My Music Library — Home Assistant Integration

A custom Home Assistant integration that provides a fully-featured Lovelace music player card connected to [Music Assistant](https://music-assistant.io/).

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2025.x%2B-brightgreen)
![HACS](https://img.shields.io/badge/HACS-custom-orange)

---

## Features

- **Now Playing** — album art, track title, artist, progress bar, volume control
- **Playback controls** — play/pause, previous, next, shuffle, repeat (off / all / one)
- **Queue** — live queue display alongside the player, persisted server-side per player across page reloads and devices
- **Search** — full-text search across artists, albums, tracks and playlists via Music Assistant
- **Library** — browse artists, albums, playlists and tracks with source filter (All / Local / Streaming) and favorites toggle; **Browse mode** to navigate the filesystem directory tree and play folders
- **Multi-player** — device picker to select and switch between any media player; supports grouping (attach / detach players)
- **Player exclusion** — hide specific players from the device picker via integration options; supports wildcard patterns (`media_player.browser_mod_*`)
- **Custom tab-bar buttons** — add your own icon buttons on the left or right of the tab bar, with tap / hold / double-tap actions
- **Responsive layout** — stacked on mobile, side-by-side on tablet/desktop
- **Multilingual** — English, French, German (auto-detected from HA language setting)

---

## Requirements

- Home Assistant 2025.1 or later
- [Music Assistant](https://music-assistant.io/) integration installed and configured

---

## Installation

### Manual

1. Copy the `custom_components/my_music_library/` folder into `/config/custom_components/` on your Home Assistant instance.
2. Restart Home Assistant.
3. Go to **Settings → Devices & Services → Add Integration** and search for **My Music Library**.
4. Follow the setup flow (select your Music Assistant server URL and default player).

### HACS (custom repository)

1. In HACS, go to **Integrations → ⋮ → Custom repositories**.
2. Add `https://github.com/Patafoin/ha-my-music-library` with category **Integration**.
3. Install **My Music Library** from HACS.
4. Restart Home Assistant and add the integration via the UI.

> The Lovelace card resource (`/my_music_library/my-music-library-card.js`) is registered automatically — no manual resource addition required.

---

## Integration Options

After installation, you can configure additional options via **Settings → Devices & Services → My Music Library → Configure**.

### Music Assistant API token

Leave this field empty in most setups. Fill it in only if your Music Assistant server requires authentication — this is typically the case on **Home Assistant OS (HAOS)** when MA is configured to use HA's authentication layer.

Generate a **Long-Lived Access Token** in HA: go to your profile page (bottom-left avatar), scroll to **Long-lived access tokens**, and create one. Paste the token in the **Music Assistant API token** field during setup or in the integration options.

The token is sent as an `Authorization: Bearer <token>` header on every outbound HTTP request to the MA REST API.

### Hidden players

Select one or more media player entities to hide from the device picker inside the card. This is useful to exclude virtual players, browser tabs, or any device you do not want to see in the list.

You can also type a **wildcard pattern** (e.g. `media_player.browser_mod_*`) and press **Enter** to exclude all matching players at once.

The card re-fetches this list every time it is reloaded or the user navigates back to the dashboard, so changes take effect without a full page refresh.

---

## Adding the Card to a Dashboard

In your dashboard, add a **Custom: My Music Library Card** card, or use the YAML editor:

```yaml
type: custom:my-music-library-card
```

---

## Card Configuration (YAML)

All options are optional.

```yaml
type: custom:my-music-library-card

# Default tab shown when the card loads.
# Options: player | search | library
default_tab: player

# Fixed card height. Accepts pixels (number or "600px") or any valid CSS value.
# When omitted the card fills 100 % of the space allocated by the dashboard layout.
height: 600

# Pre-select a specific media_player entity as the default player.
# The user can still change it at runtime; their choice is saved in localStorage.
entity: media_player.my_speaker

# Custom buttons on the LEFT side of the tab bar
nav_buttons_left:
  - icon: mdi:home
    name: Home          # tooltip / label (optional)
    tap_action:
      action: navigate
      navigation_path: /

# Custom buttons on the RIGHT side of the tab bar
nav_buttons_right:
  - icon: mdi:television-play
    name: TV
    entity: media_player.tv   # optional — button highlights when entity state is "on/playing/active"
    tap_action:
      action: toggle
    hold_action:
      action: more-info
```

---

## Custom Tab-Bar Buttons (`nav_buttons_left` / `nav_buttons_right`)

Each entry in `nav_buttons_left` or `nav_buttons_right` is a button object.

### Button properties

| Property | Type | Description |
|---|---|---|
| `icon` | `string` | MDI icon name (e.g. `mdi:home`). Falls back to the entity's icon if `entity` is set. |
| `name` | `string` | Tooltip label shown on hover. |
| `entity` | `string` | HA entity ID. When provided the button highlights (active state) when the entity is `on`, `playing`, `active` or `home`. |
| `width` | `number \| string` | Button width override (px or CSS value, e.g. `48` or `"3rem"`). |
| `height` | `number \| string` | Button height override. |
| `tap_action` | `Action` | Action fired on a single click. |
| `hold_action` | `Action` | Action fired after holding the button for 500 ms. |
| `double_tap_action` | `Action` | Action fired on a double-click. |

### Action object

```yaml
action: <action_type>
# ... action-specific fields
```

| `action` | Description | Extra fields |
|---|---|---|
| `none` | Do nothing. | — |
| `toggle` | Toggle an entity on/off. | `entity_id` (defaults to button's `entity`) |
| `more-info` | Open the More Info dialog. | `entity_id` |
| `navigate` | Navigate to a HA path. | `navigation_path: /lovelace/0` |
| `url` | Open a URL. | `url_path: https://…`, `new_tab: true` |
| `call-service` / `perform-action` | Call a HA service. | `perform_action: domain.service`, `data: {}`, `target: {}` |
| `assist` | Open the Assist dialog. | — |

### Examples

#### Toggle a light on tap, open more-info on hold

```yaml
nav_buttons_right:
  - icon: mdi:lightbulb
    name: Living Room Light
    entity: light.living_room
    tap_action:
      action: toggle
    hold_action:
      action: more-info
      entity_id: light.living_room
```

#### Call a script on tap

```yaml
nav_buttons_right:
  - icon: mdi:sleep
    name: Good Night
    tap_action:
      action: perform-action
      perform_action: script.good_night
```

#### Navigate to another dashboard view

```yaml
nav_buttons_left:
  - icon: mdi:view-dashboard
    name: Overview
    tap_action:
      action: navigate
      navigation_path: /lovelace/overview
```

#### Open an external URL

```yaml
nav_buttons_right:
  - icon: mdi:music-box-multiple
    name: Music Assistant
    tap_action:
      action: url
      url_path: http://homeassistant.local:8095
      new_tab: true
```

---

## Full Configuration Example

```yaml
type: custom:my-music-library-card
default_tab: player
height: 650
entity: media_player.kitchen_speaker
nav_buttons_left:
  - icon: mdi:home
    name: Home
    tap_action:
      action: navigate
      navigation_path: /lovelace/home
nav_buttons_right:
  - icon: mdi:lightbulb
    name: Lights
    entity: light.living_room
    tap_action:
      action: toggle
    hold_action:
      action: more-info
  - icon: mdi:sleep
    name: Good Night
    tap_action:
      action: perform-action
      perform_action: script.good_night
```

---

## Project Structure

```
custom_components/my_music_library/
├── __init__.py          # Integration setup, static paths, Lovelace resource registration,
│                        # WebSocket command (my_music_library/config),
│                        # per-player queue and group storage (Store)
├── manifest.json        # Integration metadata (version, dependencies)
├── config_flow.py       # UI configuration flow (setup + options: excluded players)
├── const.py             # Domain constants
├── api.py               # HTTP proxy views (search, library, subitems, queue, groups → Music Assistant)
├── strings.json         # Config flow translation source
├── icon.png             # Integration icon
├── translations/
│   ├── en.json
│   ├── fr.json
│   └── de.json
└── www/
    └── my-music-library-card.js   # Lovelace custom element (vanilla JS, no build step)
```

---

## Changelog

### 3.0.0
- **Refactor** — Music Assistant connectivity rewritten from scratch: integration now discovers the MA client via the `mass` config entry (`entry.runtime_data.mass`) instead of managing its own connection.
- **Fix** — MA integration domain corrected from `"music_assistant"` to `"mass"` (the actual domain since MA 2.x); also tries the legacy `"music_assistant"` domain as fallback for older installs.
- **Fix** — `after_dependencies` in `manifest.json` updated to `"mass"` so HA loads this integration after MA.
- **Improvement** — MA URL now auto-discovered from the `mass` config entry (`entry.data["url"]`); manually configured URL kept as fallback for backward compatibility.
- **Improvement** — search now tries the MA Python client first (primary), REST API second (fallback), eliminating redundant HTTP calls on setups where the client is available.

### 2.9.6
- **Fix** — filesystem browse: MA virtual "back" navigation items are now correctly intercepted and translated to breadcrumb navigation instead of being sent to the API.

### 2.9.5
- **Fix** — filesystem browse: root level was erroneously filtered; only `back`/`..` virtual items are excluded.

### 2.9.4
- **Fix** — filesystem browse: MA virtual `back` items filtered server-side to prevent erroneous API calls.

### 2.9.3
- **Fix** — browse mode: breadcrumb navigation now displayed in all states (loading, empty, error) so the user can always navigate back.
- **Fix** — browse mode: MA URI prefix `folder/` stripped server-side so navigation into subdirectories works correctly.

### 2.9.2
- **Fix** — browse mode: `mass.browse()` now tried at top-level (in addition to `mass.music.browse()`) for compatibility with all MA versions.
- **Fix** — library mode toggle: switching between Catalogue and Browse no longer requires a tab change to take effect.

### 2.9.1
- **Feature** — Library **Browse mode**: navigate the local filesystem directory tree, play individual files or entire folders.
- **Backend** — new endpoint `GET /api/my_music_library/browse?uri=<uri>`.

### 2.9.0
- **Fix** — volume slider and progress bar: HA commands now sent only on pointer release, not during drag. Visual feedback (fill + time display) updates live while dragging.

### 2.8.9
- **Fix** — library source filter (Local / Streaming) now works correctly; provider mappings (`set` type) are properly serialized from Music Assistant.
- **Improvement** — library sections render progressively as each section loads, instead of waiting for all sections to complete.
- **Improvement** — library auto-paginates when source filter hides all results on a page, fetching up to 200 items per section to find matching providers.
- **Improvement** — search strategies (HA proxy + MA WebSocket) run in parallel for faster results.
- **Improvement** — search debounce increased to 700 ms to avoid firing searches while still typing.
- **Improvement** — search results render progressively per section (artists, albums, tracks, playlists).
- **Cleanup** — removed all console logging from the card (except version banner).

### 2.8.5
- **Feature** — library source filter (All / Local / Streaming) and favorites toggle.
- **Improvement** — slider UX improvements.

### 2.8.2
- **Fix** — device picker dropdown not reflecting updated exclusion list after integration options were changed. The card now re-fetches its configuration from the backend every time it reconnects to the DOM (e.g. when navigating back to the dashboard), ensuring the hidden-players list is always in sync with what is set in **Settings → Devices & Services → Configure**.

### 2.8.1
- **Fix** — stale group members no longer persist across player switches when the group was dissolved externally in HA.
- **Fix** — excluded players list pruned of deleted entity IDs on each options save.

### 2.8.0
- **Feature** — player grouping: attach and detach players directly from the device picker inside the card.
- **Feature** — group state is persisted server-side per player and reconciled with HA's actual `group_members` attribute on load.

### 2.7.0
- **Feature** — player exclusion: hide specific players from the device picker via integration options. Supports exact entity IDs and wildcard patterns (e.g. `media_player.browser_mod_*`).
- **Feature** — wildcard glob patterns for player exclusion (e.g. `media_player.prefix_*`).

### 2.6.0
- **Feature** — queue persisted server-side per player via `POST /api/my_music_library/queue`; shared across browsers and devices.
- **Feature** — auto-detection of externally triggered album/playlist changes; stale queue cleared automatically.
- **Improvement** — search falls back through three strategies (HA proxy → Music Assistant WebSocket → browse_media) for maximum compatibility.

### 2.5.0
- **Feature** — custom tab-bar buttons (`nav_buttons_left` / `nav_buttons_right`) with tap, hold and double-tap actions.
- **Feature** — `height` card config option to set a fixed card height.
- **Feature** — `entity` card config option to pre-select a default player.

### 2.4.0
- **Feature** — Library tab: browse favorite artists, albums, playlists and tracks.
- **Feature** — infinite scroll / pagination for large libraries.

### 2.3.0
- **Feature** — Search tab: full-text search across artists, albums, tracks and playlists.

### 2.2.0
- **Feature** — multilingual support: English, French, German.
- **Feature** — responsive layout (stacked on mobile, side-by-side on tablet/desktop).

### 2.1.0
- **Feature** — device picker: switch between media players at runtime; selection saved in `localStorage`.

### 2.0.0
- Initial public release: Player tab with now-playing display, playback controls, progress bar, volume and queue.

---

## License

MIT
