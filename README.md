# My Music Library — Home Assistant Integration

A custom Home Assistant integration that provides a fully-featured Lovelace music player card connected to [Music Assistant](https://music-assistant.io/).

![Version](https://img.shields.io/badge/version-2.5.1-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2025.x%2B-brightgreen)
![HACS](https://img.shields.io/badge/HACS-custom-orange)

---

## Features

- **Now Playing** — album art, track title, artist, progress bar, volume control
- **Playback controls** — play/pause, previous, next, shuffle, repeat (off / all / one)
- **Queue** — live queue display alongside the player, persisted across page reloads
- **Search** — full-text search across artists, albums, tracks and playlists via Music Assistant
- **Library** — browse favorite artists, albums, playlists and favorite tracks
- **Multi-player** — select and switch between any Music Assistant media player
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
├── __init__.py          # Integration setup, static paths, Lovelace resource registration
├── manifest.json        # Integration metadata (version, dependencies)
├── config_flow.py       # UI configuration flow
├── const.py             # Domain constants
├── api.py               # HTTP proxy views (search, library, subitems → Music Assistant)
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

## License

MIT
