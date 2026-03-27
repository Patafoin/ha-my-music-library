# My Music Library


A custom Home Assistant integration that provides a fully-featured Lovelace music player card connected to [Music Assistant](https://music-assistant.io/).

![Version](https://img.shields.io/badge/version-2.7.0-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2025.x%2F2026.x-brightgreen)
![HACS](https://img.shields.io/badge/HACS-custom-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

| Feature | Description |
|---|---|
| **Now Playing** | Album art, track title, artist, album name, live progress bar |
| **Playback controls** | Play/Pause, Previous, Next, Shuffle, Repeat (off / all / one) |
| **Volume** | Volume slider + mute toggle |
| **Queue** | Track queue displayed alongside the player; persisted server-side across all browsers and devices |
| **Search** | Full-text search across artists, albums, tracks and playlists via Music Assistant |
| **Library** | Browse favorite artists, albums (with infinite scroll), playlists and favorite tracks |
| **Multi-player** | Select and switch between any media_player entity |
| **Player groups** | Attach / detach additional players to the active player to synchronize playback |
| **Hidden players** | Exclude unwanted media_player entities from the picker (configured via the HA options flow) |
| **Custom tab-bar buttons** | Add icon buttons on the left or right of the tab bar, with tap / hold / double-tap actions |
| **Responsive layout** | Stacked on mobile (< 640 px), side-by-side panel on tablet/desktop (≥ 640 px) |
| **Multilingual** | English, French, German (auto-detected from your HA language setting) |

---

## Requirements

- **Home Assistant** 2025.1 or later
- **[Music Assistant](https://music-assistant.io/)** integration installed and configured
- No extra Python packages, no Node.js build step

---

## Installation

### HACS (recommended)

1. In HACS, go to **Integrations → ⋮ → Custom repositories**.
2. Add `https://github.com/Patafoin/ha-my-music-library` with category **Integration**.
3. Install **My Music Library** from HACS.
4. Restart Home Assistant.
5. Go to **Settings → Devices & Services → Add Integration** and search for **My Music Library**.

### Manual

1. Download the latest release or clone this repository.
2. Copy the `custom_components/my_music_library/` folder into `/config/custom_components/` on your HA instance.
3. Restart Home Assistant.
4. Go to **Settings → Devices & Services → Add Integration** and search for **My Music Library**.

> The Lovelace card resource (`/my_music_library/my-music-library-card.js`) is registered automatically — no manual resource addition is required.

---

## Initial Setup

During the setup flow you will be asked for:

| Field | Description |
|---|---|
| **Music Assistant server URL** | The base URL of your MA server, e.g. `http://homeassistant.local:8095` |
| **Default player device** | The media_player entity to pre-select when the card opens (optional) |
| **Default tab on open** | Which tab is shown first: Player, Search or Library |

---

## Options (post-install)

After installation, click **Configure** on the integration card in **Settings → Devices & Services** to access:

| Option | Description |
|---|---|
| **Hidden players** | Multi-select list of media_player entities to hide from the device picker. Useful to remove virtual, unavailable or irrelevant players. |

Changes take effect after a hard refresh of the HA frontend (**Ctrl + Shift + R**).

---

## Adding the Card to a Dashboard

Use the visual card picker (*Add Card → Custom: My Music Library Card*) or paste this YAML directly:

```yaml
type: custom:my-music-library-card
```

---

## Card Configuration Reference

All options are optional.

```yaml
type: custom:my-music-library-card

# Tab shown when the card first loads.
# Values: player | search | library   — default: player
default_tab: player

# Fixed card height. Accepts a number (px), a string ("600px") or any valid CSS value.
# Omit to let the card fill 100 % of the space allocated by the dashboard layout.
height: 600

# Pre-select a specific media_player entity.
# The user can change it at runtime; their choice is saved per-browser.
entity: media_player.my_speaker

# Custom buttons on the LEFT of the tab bar
nav_buttons_left:
  - icon: mdi:home
    name: Home          # tooltip / label shown on narrow screens
    tap_action:
      action: navigate
      navigation_path: /

# Custom buttons on the RIGHT of the tab bar
nav_buttons_right:
  - icon: mdi:lightbulb
    entity: light.living_room   # highlights when the entity is on / playing / active
    tap_action:
      action: toggle
    hold_action:
      action: more-info
```

---

## Player Groups

The device picker (click the device row at the bottom of the Player tab) now has three sections:

```
┌──────────────────────────────────────┐
│  Active                              │
│    ● Living Room          playing    │  ← current master, not clickable
├──────────────────────────────────────┤
│  Group members                       │
│    ⊞ Kitchen              playing ✕ │  ← ✕ = detach from group
├──────────────────────────────────────┤
│  Available                           │
│    ○ Bedroom              idle    +  │  ← + = attach to group
│    ○ Bathroom             idle    +  │  ← click name = switch master
└──────────────────────────────────────┘
```

- **Click `+`** next to an available player → it joins the group (`media_player.join`).
  All group members receive the same audio stream as the master.
- **Click `✕`** next to a member → it leaves the group (`media_player.unjoin`).
  The detached player resumes its own independent state.
- **Click a player name** in the *Available* section → switches the active master player.
- The device row shows `Living Room +2` when two members are grouped.
- Groups are persisted server-side (in HA storage) and survive page reloads.
  On next load the stored group is reconciled with the actual HA state:
  if HA reports no group (e.g. after a restart), the stored group is cleared automatically.

---

## Custom Tab-Bar Buttons

### Button properties

| Property | Type | Description |
|---|---|---|
| `icon` | `string` | MDI icon, e.g. `mdi:home`. Falls back to the entity's own icon when `entity` is set. |
| `name` | `string` | Tooltip / label (optional). |
| `entity` | `string` | HA entity ID. The button highlights when the entity state is `on`, `playing`, `active` or `home`. |
| `width` | `number \| string` | Button width override (`48` = 48 px, or any CSS value like `"3rem"`). |
| `height` | `number \| string` | Button height override. |
| `tap_action` | `Action` | Fired on a single tap / click. |
| `hold_action` | `Action` | Fired after holding the button ≥ 500 ms. |
| `double_tap_action` | `Action` | Fired on a double-click. |

### Action types

| `action` | Description | Required extra fields |
|---|---|---|
| `none` | Do nothing. | — |
| `toggle` | Toggle an entity on/off. | `entity_id` (defaults to the button's `entity`) |
| `more-info` | Open the More Info dialog. | `entity_id` |
| `navigate` | Navigate to a HA path. | `navigation_path` |
| `url` | Open a URL. | `url_path`, optional `new_tab: true` |
| `call-service` / `perform-action` | Call a HA service. | `perform_action: domain.service`, `data: {}`, `target: {}` |
| `assist` | Open the Assist / voice dialog. | — |

### Examples

#### Navigate to a dashboard view
```yaml
nav_buttons_left:
  - icon: mdi:view-dashboard
    name: Overview
    tap_action:
      action: navigate
      navigation_path: /lovelace/overview
```

#### Toggle a light / open more-info on hold
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

#### Run a script
```yaml
nav_buttons_right:
  - icon: mdi:sleep
    name: Good Night
    tap_action:
      action: perform-action
      perform_action: script.good_night
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

#### Call a service with data and target
```yaml
nav_buttons_right:
  - icon: mdi:volume-off
    name: Mute all
    tap_action:
      action: perform-action
      perform_action: media_player.volume_mute
      data:
        is_volume_muted: true
      target:
        entity_id: media_player.living_room
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

## Responsive Behaviour

| Viewport | Layout |
|---|---|
| < 480 px | Nav tab icons stack above labels |
| < 640 px | Player panel: album art, controls and queue stacked vertically |
| ≥ 640 px | Player panel (2/3 width) + queue panel (1/3 width) side by side |
| ≥ 1024 px | Larger fonts, taller modals |

---

## Project Structure

```
custom_components/my_music_library/
├── __init__.py          # Integration setup, static paths, Lovelace resource, queue/group Store
├── manifest.json        # Integration metadata (version, dependencies)
├── config_flow.py       # UI config flow + options flow (player exclusion)
├── const.py             # Domain constants
├── api.py               # HTTP proxy views → Music Assistant
│                        #   MusicAssistantSearchView   GET /api/.../search
│                        #   MusicAssistantLibraryView  GET /api/.../library
│                        #   MusicAssistantSubitemsView GET /api/.../subitems
│                        #   PlayerQueueView            GET/POST /api/.../queue
│                        #   PlayerGroupView            GET/POST /api/.../groups
├── strings.json         # Config flow / options flow translation source
├── icon.png             # Integration icon (256×256)
├── translations/
│   ├── en.json
│   ├── fr.json
│   └── de.json
└── www/
    └── my-music-library-card.js   # Lovelace custom element (vanilla JS, no build step)
```

---

## Changelog

### 2.7.0
- **Player groups** — attach/detach players from the device picker; group persisted server-side
- **Hidden players** — options flow to exclude unwanted media_player entities from the picker
- New backend endpoint `GET/POST /api/my_music_library/groups`
- Device row shows group icon and member count when a group is active
- Translations updated (EN / FR / DE)

### 2.6.1
- Server-side queue storage (`POST /api/my_music_library/queue`)
- Stale queue auto-detection
- Mobile nav tab fix (icon stacks above label on narrow screens)

### 2.5.1
- Initial public release

---

## License

[MIT](LICENSE)
x
