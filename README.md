# My Music Library — Home Assistant Integration

A custom Home Assistant integration that provides a fully-featured Lovelace music player card connected to [Music Assistant](https://music-assistant.io/).

![Version](https://img.shields.io/badge/version-4.8.2-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2026.2%2B-brightgreen)
![HACS](https://img.shields.io/badge/HACS-default-41BDF5)

> [!WARNING]
> **Version 4 is a breaking update for 3.x users — read this before updating.**
>
> - **New connection, token required.** My Music Library now connects to Music Assistant **by itself**. After the update and a restart, Home Assistant asks you to **re-authenticate**: enter your Music Assistant URL and a **long-lived API token** created in Music Assistant (**Settings > your user > API tokens**). Until you do, the card only shows a "reconnection needed" banner.
> - **Home Assistant 2026.2 or later** is required (3.x ran on 2025.1), with a Music Assistant server able to issue API tokens (tested with 2.10).
> - **New `media_player` entities.** My Music Library creates its own player entities. If the official Music Assistant integration is still installed, it keeps the original entity IDs and the new ones get a suffix (`media_player.kitchen_2`): a fixable issue in **Settings > Repairs** offers to swap them, so your automations, scripts and dashboards follow.
> - **Actions.** `music_assistant.play_media` and the other actions of the official integration do not work on My Music Library players: use **`my_music_library.play_media`** and **`my_music_library.transfer_queue`**.
> - **Card behaviour.** The device picker is replaced by an output panel and only offers **Music Assistant players** (add `show_other_players: true` to bring back other media players); the Library tab always shows your **favorites**.
>
> Step-by-step guide: **[Upgrading from 3.x](#upgrading-from-3x)**.

---

## What's new in 4.x (since 3.14.0)

- **Output panel** — see where the music plays and **switch** it to other outputs (same track, same position), **group** outputs with per-output and group volume, **control** any output from the card; favorite groups, power on from the card, a default output per device.
- **Own Music Assistant connection and players** — no dependency on the official integration; live `media_player` entities usable in automations, with `my_music_library.play_media` and `my_music_library.transfer_queue` ("the music follows me").
- **Instant queue** — the queue updates as soon as Music Assistant changes it (pushed, no more delays).
- **Playback that keeps going** — works around a Music Assistant bug that sometimes stopped an album or playlist after its first track.
- **Artist page** — favorites and full catalog split into albums, EPs, singles and live albums, reachable from search, the library or the new **Artist** button of the player.
- **Discovery tab** — Music Assistant's recommendation folders.
- **Safer setup** — connection test, re-authentication prompt, a clear banner when Music Assistant is unreachable, a Repairs flow for duplicate players.
- **Fixes** — browsing sub-folders of the filesystem provider ([#17](https://github.com/Patafoin/ha-my-music-library/issues/17)) and Deezer's "Made For You", "Start a mix" feedback, logging levels.

Details: [Changelog](#changelog).

---

## Features

- **Now Playing** — album art, track title, artist, progress bar, volume control
- **Playback controls** — play/pause, previous, next, shuffle, repeat (off / all / one)
- **Queue** — live queue display alongside the player, updated as soon as Music Assistant changes it (pushed, no polling), persisted server-side per player across page reloads and devices
- **Search** — full-text search across artists, albums, tracks and playlists via Music Assistant; also searches local library (filenames) for more complete results
- **Library** — your Music Assistant favorites (artists, albums, playlists, tracks, radios…) with a source filter (All / Local / Streaming); **Browse mode** to navigate the filesystem directory tree and play folders
- **Discovery tab** — Music Assistant's recommendation folders (recently played, recently added, suggestions…), one section per folder
- **Artist page** — the artist's favorites from your library, plus their full album catalog, split into albums, EPs, singles and live albums; reachable from search, the library, or the "Artist" button of the player
- **Playlist tab** — a dedicated tab locked to one playlist (picked in the visual editor), showing every track with list/grid view toggle; tapping a track plays it instantly without leaving the tab, thanks to a compact player bar (transport, progress, volume, output row) pinned at the bottom
- **Own media players** — one `media_player` entity per Music Assistant player, updated live (push), usable in automations and scripts, plus a `my_music_library.play_media` action
- **Output panel** — the output row under the player shows where the music plays ("Living room + Kitchen") and opens a panel over the player with three modes: **Switch** (move the music — same track, same position — to one or more outputs, which then form a group), **Group** (add outputs to the current group or remove them, with a volume slider per output and one for the whole group) and **Control** (see what plays where and pick which output the card controls). Outputs are shown as tiles with an icon, a short name (card alias → Home Assistant area → cleaned-up name; an "i" button shows the full name, entity, model and provider), their state, the group leader's crown, and outputs that can't be grouped together greyed out with the reason. Also: favorite groups ("Whole house"…) saved server-side, turn an output on from its tile, offline outputs hidden behind a link, and a per-device default output (pin)
- **Player exclusion** — hide specific players from the card via integration options; supports wildcard patterns (`media_player.browser_mod_*`)
- **Fully configurable tabs** — reorder, rename, re-icon any tab; add action buttons in the tab bar; control which library sections appear and in what order; style any tab's nav button with a custom element (e.g. `button-card`)
- **Visual card editor** — WYSIWYG editor in the Lovelace UI: drag-and-drop tab reorder, live preview, no YAML needed
- **Clear connection status** — if the Music Assistant connection is down (server unreachable, token revoked), the card shows a banner instead of going blank, and Home Assistant asks you to re-authenticate
- **Debug logging** — toggleable from integration options; detailed logs in HA and browser console for troubleshooting
- **Responsive layout** — stacked on mobile, side-by-side on tablet/desktop; horizontal scroll nav bar for small screens
- **Multilingual** — English, French, German (auto-detected from HA language setting)

---

## Requirements

- Home Assistant **2026.2** or later
- A [Music Assistant](https://music-assistant.io/) server reachable from Home Assistant, recent enough to issue **long-lived API tokens** (tested with 2.10), and a token for it (see below)

The official Music Assistant integration for Home Assistant is **not** required: My Music Library has its own connection to the server.

---

## Installation

### Via HACS

1. Open HACS, search for **My Music Library** and install it.
2. Restart Home Assistant.
3. In the Music Assistant web UI, create a long-lived API token: **Settings > your user > API tokens**, e.g. named `my_music_library`.
4. Go to **Settings > Devices & Services > Add Integration** and search for **My Music Library**.
5. Enter the Music Assistant server URL (e.g. `http://192.168.1.10:8095`) and the token. The connection is tested before the entry is created.
6. Optionally pick a **default player** in the integration options (see below) — it can only be chosen once the player entities exist.

> The Lovelace card resource is registered automatically — no manual resource addition required.

If the token is later revoked or the server URL changes, Home Assistant shows a **re-authentication** prompt: enter the new URL and/or token there, no need to remove the integration.

---

## Upgrading from 3.x

Version 4 is a **breaking change**. In 3.x, My Music Library borrowed the connection of the official Music Assistant integration (`mass` / `music_assistant`) and drove its media players. Since 4.x it has its own connection, authenticated with a Music Assistant API token, and its own `media_player` entities.

What happens when you update:

1. **Restart Home Assistant** after the update, as for any integration update.
2. Your configuration is migrated automatically. Since a 3.x setup has no Music Assistant token, Home Assistant then shows a **re-authentication** prompt for My Music Library: enter the server URL and a long-lived token created in Music Assistant (**Settings > your user > API tokens**). Until then, the card shows a "reconnection needed" banner.
3. If you had chosen a default player in 3.x, it is kept and moved to the integration **options**.
4. My Music Library creates its own `media_player` entities, one per Music Assistant player.

**If the official Music Assistant integration is still installed**, it keeps the original entity IDs (e.g. `media_player.kitchen`), so the new My Music Library entities get a suffix (`media_player.kitchen_2`). Your automations, scripts and dashboards keep pointing at the official entities. My Music Library detects this and raises a fixable issue in **Settings > Repairs**:

- it lists the duplicated players, and the automations and scripts that use their original IDs;
- if you confirm, each official entity is renamed `<id>_music_assistant` (and optionally disabled), and the My Music Library entity takes the original ID — so automations, scripts and dashboards now drive My Music Library;
- both renames can be undone from each entity's settings.

After the swap, standard `media_player.*` actions (play, pause, stop, volume, shuffle, repeat, `media_player.play_media`, grouping) keep working. **Actions of the official integration** (`music_assistant.play_media`, `music_assistant.play_announcement`, `music_assistant.transfer_queue`…) only work on the official entities: replace `music_assistant.play_media` with `my_music_library.play_media` (see [Actions and entities](#actions-and-entities)).

Queue transfer is available as `my_music_library.transfer_queue` (and in the card's output panel). Announcements (`music_assistant.play_announcement`) are not available in My Music Library yet (planned): keep the official integration if you rely on them. Once nothing uses the official integration anymore, you can disable it, then remove it.

**Card changes to know about:**

- The device picker is replaced by the **output panel** (output row under the player). Grouping now goes through Music Assistant directly; groups saved by the 3.x card are not carried over (Music Assistant already knows the real groups).
- The card only offers **Music Assistant players**. Other Home Assistant media players (TV, smart speakers, browser_mod…) cannot play Music Assistant's queue; add `show_other_players: true` to the card to control them from the output panel anyway.
- The Library tab always shows your **favorites** (the favorites toggle is gone): use Search or Browse mode for the full catalog.

Everything else — the card YAML configuration (tabs, sections, layouts, nav buttons) and your dashboards — keeps working as is.

---

## Integration Options

After installation, you can configure additional options via **Settings > Devices & Services > My Music Library > Configure**.

### Default player

The player the card selects when it opens (until the user picks another one, which is remembered per browser). Leave on *Auto-detect* to use the first available player.

### Hidden players

Select one or more media player entities to hide from the device picker inside the card. This is useful to exclude virtual players, browser tabs, or any device you do not want to see in the list.

You can also type a **wildcard pattern** (e.g. `media_player.browser_mod_*`) and press **Enter** to exclude all matching players at once.

### Debug logging

Enable the **"Enable debug logging"** toggle to activate detailed logging:

- **HA logs** — go to **Settings > System > Logs**, filter by `my_music_library` to see all backend activity (API calls, MA client, queue operations, etc.)
- **Browser console** — press **F12**, go to the Console tab, filter by `[MML]` to see frontend activity (config loading, search strategies, player selection, library loading, playback, etc.)

A pulsing orange **"Debug mode is active"** banner appears in the card's Settings panel as a reminder to disable it when you're done.

When debug logging is **off**, My Music Library does not set any log level of its own: the level configured with `logger:` in `configuration.yaml` applies (Home Assistant's default is `warning`). For example:

```yaml
logger:
  logs:
    custom_components.my_music_library: info
```

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
| `library` | Your Music Assistant favorites, with a source filter (All / Local / Streaming) and Browse mode |
| `discovery` | Music Assistant recommendation folders, one section per folder (no options) |
| `playlist` | All tracks of one playlist, with a built-in mini player bar |
| `settings` | Integration settings (providers, debug indicator) |
| `button` | Action button (supports tap/hold/double-tap actions) |
| `custom_element` | Embed any HA custom element in the nav bar (e.g. `button-card`) |

Any tab can set `show_in_nav: false` to hide it from the nav bar while keeping it reachable via `mml_navigate_tab` actions.

#### Styled nav button for a panel tab

Any panel tab (`player`, `search`, `library`, `discovery`, `playlist`, `settings`) can render its nav button with a custom element, the same way as `custom_element`, while still opening its panel when clicked:

```yaml
tabs:
  - type: library
    sections: [artists, albums, playlists, radios]
    element: custom:button-card
    element_config: { name: Library, icon: mdi:music-box-multiple }
    width: 90
```

In the visual editor, `element` / `element_config` are edited in the tab's **Advanced (YAML)** block.

#### Library sections

When `type: library`, the optional `sections` array controls which media types appear and in what order. The library always shows your **favorites** (what you saved in Music Assistant); use Search or Browse mode for the full catalog.

Valid values: `artists`, `albums`, `playlists`, `tracks`, `radios`, `recently_played`, `recently_added`, `recommended`, `flows`.

Defaults to `[artists, albums, playlists, tracks]` when omitted.

#### Playlist tab

When `type: playlist`, pick the playlist from the dropdown in the visual editor — it fills in `playlist_uri` (and caches `playlist_label` / `playlist_thumbnail` for display) automatically:

```yaml
- type: playlist
  playlist_uri: "library://playlist/123"   # set via the editor's playlist picker
  playlist_label: "Chill mix"              # cached display name (auto-filled)
  playlist_thumbnail: "/api/..."           # cached thumbnail URL (auto-filled)
```

Tapping a track plays it immediately — the tab stays active, it never switches to the Player tab. The pinned bottom bar (previous / play‑pause / next, progress bar, volume, device picker) keeps playback controllable without leaving the playlist. Use the header button to toggle between list and grid track display; the choice is remembered per tab.

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
| `show_device_select` | `boolean` | `true` | Show the output row at the bottom of the player tab (and in the playlist tab's mini player). Set to `false` to hide it. |
| `show_other_players` | `boolean` | `false` | Also offer Home Assistant media players that are not Music Assistant players (Echo, TV, browser_mod…) — in the output panel's **Control** mode only, since they can't play Music Assistant's queue or join its groups. |
| `devices` | `map` | — | Per-output overrides, keyed by entity ID: `name` (short name shown in the card), `icon` (`mdi:…`), `hidden: true` (never offered by this card). Editable in the visual editor's **Outputs** section. |

```yaml
devices:
  media_player.squeeze_salle_d_eau: { name: Bathroom, icon: mdi:shower }
  media_player.web_chrome_on_linux: { hidden: true }
```

### Nav bar layout

Control the position and alignment of the navigation bar with the `nav_bar` object:

| Option | Type | Default | Values | Description |
|---|---|---|---|---|
| `nav_bar.position` | `string` | `top` | `top` / `bottom` / `left` / `right` | Where the nav bar is rendered relative to the card content |
| `nav_bar.align` | `string` | `start` | `start` / `center` / `end` / `space-between` | How tabs are distributed along the nav bar |

```yaml
nav_bar:
  position: bottom    # top | bottom | left | right
  align: center       # start | center | end | space-between
```

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
| `mml_navigate_tab` | Navigate to a MML tab. | `tab: player` / `search` / `library` / `playlist` / `settings` |
| `mml_navigate_section` | Scroll to a library section. | `section: artists` / `albums` / `playlists` / `tracks` / `radios` / `recently_played` / `recently_added` / `recommended` / `flows` |
| `mml_control` | Trigger a player control. | `command: play_pause` / `next` / `prev` / `shuffle` / `repeat` / `mute` |

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

  - type: playlist
    playlist_uri: "library://playlist/123"
    playlist_label: "Chill mix"

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

## Actions and entities

### Media players

My Music Library creates one `media_player` entity per Music Assistant player (entity ID derived from the player name). They support play / pause / stop, previous / next, seek, volume (set, step, mute), shuffle, repeat, turn on / off, `media_player.play_media` and grouping (join / unjoin, when the player supports it). Each entity exposes a `mass_player_id` attribute (the Music Assistant player ID).

### `my_music_library.play_media`

Plays a Music Assistant item on one of these players.

| Field | Required | Description |
|---|---|---|
| `media_id` | yes | URI of a Music Assistant item (e.g. `library://playlist/16`), a stream URL, or a name to look up |
| `enqueue` | no | `play` (default), `replace`, `next`, `replace_next` or `add` |
| `radio_mode` | no | Keep playing similar tracks once the queue is finished |

```yaml
action: my_music_library.play_media
target:
  entity_id: media_player.living_room
data:
  media_id: https://stream.radiofrance.fr/fipreggae/fipreggae_hifi.m3u8
```

Replaces `music_assistant.play_media` from the official integration (no `media_type` field: Music Assistant resolves the type itself).

### `my_music_library.transfer_queue`

Moves what a player is playing — same track, same position — to one or more other players ("the music follows me"). With several targets, the first one leads a group of them all. The source stops. Same as the output panel's **Switch** mode.

| Field | Required | Description |
|---|---|---|
| `targets` | yes | My Music Library players that take over the music |

```yaml
action: my_music_library.transfer_queue
target:
  entity_id: media_player.living_room   # the source
data:
  targets:
    - media_player.office
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
| Card shows "Music Assistant reconnection needed" | The integration can't reach Music Assistant: check the server is running, then answer the re-authentication prompt (Settings > Devices & Services) with a valid URL and token |
| Re-authentication prompt after updating from 3.x | Expected: 4.x needs a Music Assistant API token — see [Upgrading from 3.x](#upgrading-from-3x) |
| Players have `_2` / `_3` suffixes | The official Music Assistant integration still owns the original IDs — use the fix in Settings > Repairs (see [Upgrading from 3.x](#upgrading-from-3x)) |
| An automation using `music_assistant.play_media` fails | That action only works on the official integration's entities: use `my_music_library.play_media` |
| Library is empty | The library only shows favorites: favorite some items in Music Assistant, or use Search / Browse mode; also try the source filter (All / Local / Streaming) |
| No players found | Make sure at least one My Music Library media player entity is enabled and not `unavailable` |
| Players missing from picker | Check that they're not in the hidden players list (integration options) |

---

## Project Structure

```
custom_components/my_music_library/
├── __init__.py          # Integration setup, static paths, Lovelace resource registration,
│                        # WebSocket command (my_music_library/config),
│                        # per-player queue and favorite-group storage (Store),
│                        # debug mode toggle
├── manifest.json        # Integration metadata (version, dependencies)
├── config_flow.py       # UI configuration flow (setup: URL + token, re-authentication,
│                        # options: default player, hidden players, debug mode)
├── mass_connection.py   # Own Music Assistant connection (connect, listen, auto-reload)
├── entity.py            # Base entity for Music Assistant players
├── media_player.py      # media_player platform + play_media / transfer_queue actions
├── queue_push.py        # Relays Music Assistant queue events to the card (WebSocket subscription)
├── queue_watchdog.py    # Resumes queues Music Assistant leaves stopped after a track (MA bug workaround)
├── duplicates.py        # Detects duplicates with the official integration, swaps entity IDs
├── repairs.py           # Repairs fix flow for duplicates
├── services.yaml        # Action descriptions
├── const.py             # Domain constants
├── api.py               # HTTP views for the card (search, library, browse, subitems, queue, outputs → MA)
├── outputs.py           # Output panel backend: outputs, transfer, group members, group volume, power, favorite groups
├── strings.json         # UI translation source
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

> **4.8.2 is the first public release of the 4.x line.** Versions 4.0.0 to 4.8.1 were never published: together, the entries from 4.5.0 to 4.8.2 below describe everything 4.8.2 brings since 3.14.0.

### 4.8.2 — first public 4.x release
- **Fix** — the output panel showed **no output at all** with the oldest supported Music Assistant client (1.3.3, shipped with Home Assistant 2026.2): its "hide player" setting is a set of conditions (when off, when synced…), never empty, which was read as "hidden". Only "always" hides a player now.
- **Fix** — the duplicate-players Repairs issue had a description both on the issue and on its fix flow, which Home Assistant's validation (hassfest) rejects; the issue keeps its title, the details stay in the fix flow.

### 4.8.1
- **Fix** — **Switch restarted the queue from its first track** when moving a group to one of its own members (e.g. "Bathroom + Living room" → "Living room"). The integration ungrouped the target itself before asking Music Assistant to transfer the queue, which made the source re-set its stream right when Music Assistant reads the current track and position. Music Assistant frees such a target itself (and waits for it): the integration no longer touches the source's group before the transfer, other targets are ungrouped afterwards. The current track and position are kept.
- **Fix** — Switch with the source kept in the selection now gives exactly the selected outputs (outputs left out leave the group), and switching while the card controls a group member moves the whole group's music.

### 4.8.0
- **New** — **output panel**, replacing the device picker. The output row under the player shows the output(s) playing ("Bathroom + Living room") and opens a panel over the player (the queue stays visible on wide screens) with three modes:
  - **Switch**: move the music (same track, same position) to one or more outputs; with several, the first one leads a group of them all. Confirmed with a button, since the source stops.
  - **Group**: add outputs to the current group or remove them, immediately; a volume slider per output (with mute) and one for the whole group; ungroup all.
  - **Control**: one row per output or group playing (artwork, title, outputs), then the idle outputs; tap one to control it with the card.
  - Outputs are tiles: icon by type (speaker, web player, TV, Cast, AirPlay, group), short name (card alias → Home Assistant area when it is the only output there → cleaned name: `squeeze-salle-d-eau` becomes "Salle d'eau"), state, crown on the group leader, outputs that can't join the group greyed out with the reason (from Music Assistant's own compatibility list). Names cut short get an "i" button with the full name, entity, area, model and provider.
  - **Favorite groups**: save the current group ("Whole house"…), apply it in one tap in Switch or Group mode; stored server-side, shared by all devices.
  - **Turn on** an output that is off, from its tile.
  - **Default output per device**: pin an output in Control mode; this browser opens on it.
  - Offline outputs are hidden behind a "Show N offline" link.
- **New** — card options `devices` (per-output short name, icon, hidden; **Outputs** section in the visual editor) and `show_other_players`.
- **Change** — the card only offers Music Assistant players by default: other Home Assistant media players (Echo, TV, browser_mod…) can't play Music Assistant's queue. `show_other_players: true` brings them back, in Control mode.
- **Change** — grouping goes through Music Assistant directly (it used `media_player.join` / `unjoin` plus a copy of the group stored by the card, which could drift). The `/my_music_library/groups` view is replaced by `/my_music_library/outputs`.
- **New** — **`my_music_library.transfer_queue`** action, for automations ("the music follows me").

### 4.7.1
- **Fix (workaround for a Music Assistant bug)** — **playback stopped after the first track** of an album or playlist, with the rest still in the queue ("next" worked). Music Assistant (seen on 2.10.4) hands the next track to the player while the current one starts, and skips that step when the queue was empty just before — typically right after a launch that failed and emptied the queue (e.g. a Deezer "Flow" with nothing to play). Nothing retries it, so the player stops at the end of the first track. The integration now watches the queues: when one stops on a track played to its end while a next track is waiting (not at the end of the queue, not in "repeat one", not stopped by you mid-track), it waits 6 seconds, then skips to the next track — what you would do by pressing "next". Logged as a warning.

### 4.7.0
- **New** — **"Artist" button on the player tab**: opens the page of the artist of the track being played (favorite albums and full catalog). The back button returns to the player. New `track_artist` action on the `/my_music_library/subitems` view (main artist of a track, library version when the artist is in the library).
- **Improvement** — **artist page: albums, EPs, singles and live albums in separate sections**, in both "Favorites" and "All albums" (sorting by name or date applies inside each section). Live albums (`live` type) used to be missing from the "Favorites" section.
- **Fix** — **artist page "Favorites" showed the artist's whole streaming catalog** when the page was opened with a streaming provider's artist (a search result, or the track playing): e.g. 47 Deezer albums instead of the 4 albums in your library. "Favorites" now only lists your library's albums of that artist (none if the artist isn't in your library).
- **Improvement** — **"Start a mix" gives immediate feedback**: Music Assistant builds the whole mix (similar-track lookups at the streaming providers) before answering, which takes several seconds. The card now switches to the player and shows "Preparing the mix…" right away, and shows an error message if the mix fails (it used to fail silently).

### 4.6.2
- **Fix** — **browsing Deezer's "Made For You" (and any folder with an explicit navigation path)** failed with a 502: the URI was rebuilt from the item ID (`…://made_for_me`) instead of Music Assistant's navigation path (`…://Made For You`). Root cause: the Music Assistant client converts browse folders into a type that has no `path` field, so the path was lost before reaching the integration. Browsing now requests the raw data from the server, and the navigation path is used whenever the provider sets one.

### 4.6.1
- **Fix** — **browsing sub-folders of the filesystem provider** ([#17](https://github.com/Patafoin/ha-my-music-library/issues/17)): opening a sub-folder repeated its parent in the path (`Disco/Disco/ABBA Gold…`), so every sub-folder failed with a 502 error. Since 3.10.0, folder URIs were rebuilt as *parent + item ID*, but the filesystem provider's item ID already contains the full path from its root. The parent is no longer repeated.

### 4.6.0
- **Improvement** — **the queue updates as soon as Music Assistant changes it**. The card used to reload the queue after fixed delays (500 ms to 1.5 s after an action, plus waiting for the action itself to finish): after starting an album or playlist, the queue showed up about 2.3 s after the click although Music Assistant had it ready after about 0.75 s. Music Assistant's queue events are now relayed to the card through a WebSocket subscription (`my_music_library/subscribe_queue`), so the queue is reloaded right when it changes — when starting media, skipping tracks, enqueuing, moving or removing items. A reload every 4 s after an action remains as a safety net; if the subscription is unavailable, the previous delays apply.

### 4.5.0
First 4.x version (never published on its own) — everything below is new since 3.14.0 (versions 4.0.0 to 4.4.4 were never published either). **Breaking change**: read [Upgrading from 3.x](#upgrading-from-3x) first.

- **Breaking** — **own Music Assistant connection**: the integration connects to the Music Assistant server itself, with the server URL and a long-lived API token entered in the setup flow (connection tested). The official Music Assistant integration is no longer required or used.
- **Breaking** — **own `media_player` entities**, one per Music Assistant player, updated live from Music Assistant events. The card now drives these entities.
- **Breaking** — new `my_music_library.play_media` action, replacing `music_assistant.play_media` for the card and for your automations.
- **Breaking** — the default player moved from the setup step to the integration **options**. Existing configurations are migrated automatically (config entry version 2); 3.x setups are asked to re-authenticate with a token.
- **Breaking** — requires Home Assistant **2026.2** or later (the first release shipping a Music Assistant client ≥ 1.3.3); `music-assistant-client>=1.3.3,<2`, so Home Assistant never has to install a version conflicting with its own.
- **Breaking** — the Library tab always shows your **favorites**; the favorites toggle is gone (use Search or Browse mode for the full catalog). Radios from recommendation folders are no longer mixed into the library's radio section.
- **Feature** — **Repairs: duplicate players** — when the official integration still owns the original entity IDs, a fixable issue lists the duplicates and the automations/scripts using them, and on confirmation gives the original IDs to My Music Library (official entities renamed `<id>_music_assistant`, optionally disabled). The integration's own options (default player, hidden players) follow the renames.
- **Feature** — **re-authentication flow**: a revoked token or a moved server triggers Home Assistant's re-authentication prompt instead of a broken integration.
- **Feature** — **connection banner** in the card when Music Assistant is unreachable, instead of a blank card; the card, its resources and HTTP views are registered even when the connection fails.
- **Feature** — **`discovery` tab**: Music Assistant recommendation folders, one section per folder, filtered by the enabled providers.
- **Feature** — **artist page**: the artist's favorites from your library, plus their full album catalog.
- **Feature** — **styled nav button for any panel tab** (`element` / `element_config` / `width` / `height` on `player`, `search`, `library`, `discovery`, `playlist`, `settings`).
- **Improvement** — search, library and sub-items call the Music Assistant client directly: no more scanning of other integrations, REST fallbacks or method-signature guessing.
- **Improvement** — a failed playback now shows an error toast with the reason, instead of failing silently.
- **Fix** — logging: with debug mode off, the level set with `logger:` in `configuration.yaml` is respected (it used to be forced to `warning`); turning debug mode off restores it. Per-request logs of the card's HTTP views moved from `info` to `debug`.
- **Fix** — the `play_media` action is now described (`services.yaml`, en/fr/de), which removes the "Failed to load services.yaml" error from the Home Assistant log.

### 3.14.0
- **Feature** — **`playlist` tab type**: a new tab locked to one playlist, picked from a dropdown in the visual editor (populated from your Music Assistant library — queries both favorited and non-favorited playlists, since some providers such as Deezer only sync their playlists as favorites). Every track is listed and tapping one plays it instantly without leaving the tab. A compact player bar (previous / play-pause / next, progress bar, volume slider, device picker — no album art) stays pinned at the bottom, reusing the exact same components and callbacks as the main Player tab. Tracks can be toggled between list and grid view via a header button, remembered per tab.

### 3.12.5
- **Fix** — **Suggestions tab always empty**: Music Assistant's `music/recommendations` call only returns the recommendation folders' metadata (name, provider, item_id), not their content — a second call per folder (`music/recommendations/items`) is required to fetch the actual items. The integration now issues that second call in parallel for every folder, so Deezer/TuneIn/library suggestions display correctly. A folder that fails or times out is now skipped individually instead of blanking the whole tab.

### 3.12.4
- **Feature** — **nav bar position and alignment**: new `nav_bar` configuration block with `position` (`top` / `bottom` / `left` / `right`, default `top`) and `align` (`start` / `center` / `end` / `space-between`, default `start`). Configurable in the visual editor under the new "Nav bar" section.
- **Feature** — **`custom_element` tab type**: embed any HA custom element (e.g. `button-card`, `mini-graph-card`) directly in the nav bar. Configure `element` (custom element tag name) and `element_config` (YAML/JSON). Supports `tap_action`. Editable in the visual editor.
- **Feature** — **`show_in_nav` property**: set `show_in_nav: false` on any tab to hide it from the nav bar while keeping it navigable via `mml_navigate_tab` actions.
- **Feature** — **MML internal actions**: three new action types for `button` and `custom_element` tabs:
  - `mml_navigate_tab` — navigate to a named card tab (`player`, `search`, `library`, `settings`)
  - `mml_navigate_section` — scroll the library tab to a specific section (`artists`, `albums`, `playlists`, `tracks`, `radios`, `recently_played`, `recently_added`, `recommended`, `flows`)
  - `mml_control` — trigger a player control without leaving the card (`play_pause`, `next`, `prev`, `shuffle`, `repeat`, `mute`)
- **Improvement** — **visual editor**: nav bar section with position/alignment selects; `custom_element` in the add-tab menu; action selector shared between `button` and `custom_element` tabs and includes all MML actions.

### 3.11.2
- **Fix** — **library scroll conflict on mobile (iPhone)** ([#13](https://github.com/Patafoin/ha-my-music-library/issues/13)): scrolling vertically through library sections was blocked when the touch gesture started on a horizontal lane (albums, artists). A direction-lock mechanism now detects the dominant gesture direction on the first touch move — if vertical, horizontal scroll on all lanes is temporarily disabled so the page scrolls smoothly. Horizontal lane scrolling remains fully functional when the gesture is clearly horizontal.

### 3.11.1
- **Fix** — **library tab not scrollable on iOS Safari** ([#13](https://github.com/Patafoin/ha-my-music-library/issues/13)): both `.library-panel` and `.lib-content` had `overflow-y: auto`, creating nested scroll containers that iOS Safari cannot handle. Changed `.library-panel` to `overflow: hidden` (matching the search panel pattern) so only `.lib-content` scrolls. Added `min-height: 0` and `-webkit-overflow-scrolling: touch` for proper flex shrinking and older iOS compatibility.

### 3.11.0
- **Fix** — **cover images missing in library, search, browse & queue** ([#12](https://github.com/Patafoin/ha-my-music-library/issues/12)): raw image paths from Music Assistant (Plex URLs requiring auth, internal MA references) were exposed directly to the browser, which couldn't load them. All thumbnails are now routed through a new server-side proxy endpoint (`/my_music_library/thumb`) that resolves images via the MA server — handling provider authentication (Plex tokens), internal paths, and mixed-content issues transparently. Both backend normalization and frontend WebSocket search results wrap thumbnails in this proxy.
- **Fix** — **clicking artist in library shows empty results** ([#12](https://github.com/Patafoin/ha-my-music-library/issues/12)): `get_artist_albums` calls via the MA Python client could fail silently (logged at DEBUG). Added a REST API fallback (`/api/music/artists/{id}/albums`) that kicks in when all client attempts fail. Upgraded failure logging from DEBUG to WARNING for diagnosability.

### 3.10.4
- **Fix** — **cover images missing in Library, Search and Browse tabs** ([#12](https://github.com/Patafoin/ha-my-music-library/issues/12)): thumbnails were not displayed because the backend only accepted image paths starting with `http://`, rejecting relative or proxy paths from Music Assistant. A new centralized `_extract_thumbnail()` helper now searches all known MA image locations (`thumbnail`, `image.path`, `metadata.images[].path`) without protocol restriction. Also fixes thumbnails in search results and MA queue items.
- **Fix** — **`image` property lost during serialization**: Music Assistant exposes `image` as a `@property` on media items, which `dataclasses.fields()` does not include. The serializer now explicitly captures this property so cover art is preserved even when it's the only image source.
- **Fix** — **search results missing thumbnails server-side**: `_serialize_search_results()` now injects a `thumbnail` field into each search result item, so the frontend no longer has to guess where MA stores image paths.
- **Improvement** — **image error fallback on all tabs**: a delegated error handler on the shadow root automatically replaces broken `<img>` elements with SVG placeholder icons, matching the player tab's existing fallback behavior.

### 3.10.3
- **Feature** — **hide device picker**: new `show_device_select` option (default: `true`) and matching checkbox in the visual card editor. When unchecked, the device selection row at the bottom of the player tab is hidden.
- **Fix** — **i18n: hardcoded strings**: the device modal title ("Choose a device"), play button tooltips, and editor move/delete tooltips were hardcoded in English. All are now translated (EN / FR / DE).
- **Fix** — **FR translation**: corrected anglicism "sélection du device" → "sélection de l'appareil".

### 3.10.2
- **Fix** — **provider filter server-side post-filter**: MA's library API silently ignores the `provider` parameter (absorbed by `**kwargs`), returning all items instead of filtering by provider instance. Added a server-side post-filter that verifies each returned item's `provider_instances` contains the requested provider, ensuring items from disabled providers (e.g., a second Deezer account) are excluded.

### 3.10.1
- **Fix** — **provider filter race condition**: library could load before providers were fetched, causing `_activeProviderFilter()` to always return `null` and bypassing server-side per-provider queries. Provider fetch is now awaited before proceeding, and library tabs are invalidated when providers arrive late.
- **Fix** — **provider validation by domain**: stored provider filter keys are now validated against both `instance_id` and `domain`, preventing a full filter reset when MA provider instance IDs change across restarts.
- **Improvement** — **alphabetical sort in library lanes**: artists sorted by name, albums by album name, tracks by title, etc. Uses locale-aware case-insensitive comparison.

### 3.10.0
- **Feature** — **per-tab library filter state**: when using multiple library tabs (e.g., one for catalogue, one for discover/recommendations), each tab now has its own independent source filter (All / Local / Streaming), favorites toggle, and browse mode state. Switching filters in one tab no longer affects the other. Preferences are saved per tab in localStorage.
- **Feature** — **search lazy loading**: search results now fetch up to 100 items (was 25) and render progressively — initial batch on screen, then more items load on scroll (15 cards / 20 list items initially, 30 per scroll batch).
- **Fix** — **browse back navigation**: clicking ".." in filesystem and radio browsers now correctly navigates back. The back-item detector now handles `title == ".."` and `root`-level URIs.
- **Fix** — **browse empty titles**: provider sub-items (Deezer, Music Assistant builtin, TuneIn) that returned empty `name` now fall back to `display_name`, `translation_key`, or `item_id` for a readable title.
- **Fix** — **browse recommendations sub-folders**: navigating into recommendation folders (e.g., Deezer "Made for you") no longer fails with "Invalid subpath". URIs are now reconstructed from parent URI + `item_id` instead of relying on MA's auto-generated `folder/`-prefixed URIs.
- **Fix** — **browse path priority**: `BrowseFolder` items now use the `path` field (navigation path) over `uri` (semantic identifier), matching what Music Assistant expects.
- **Improvement** — **discover tabs hide filters**: library tabs that only contain discover sections (recently_played, recently_added, recommended, flows) now automatically hide the source/favorites filter bar since those filters don't apply.

### 3.9.4
- **Fix** — **discover section thumbnails**: items returned by Music Assistant with image data in the `image` field (e.g., "Recently played" flows) were missing their cover art. The backend now reads `image.path` / `image.url` in addition to `metadata.images`.
- **Feature** — **artist queue & mix**: artists now have a (+) button in the library lane, search results, and artist detail page. The dropdown menu offers "Play next", "Add to end", and "Start a mix" (radio mode) — same as albums and playlists.

### 3.9.3
- **Fix** — **discover sections now respect provider filter**: Music Assistant returns recommendation folders without provider metadata. The backend now infers each folder's provider by analyzing its items — folders where all items share one provider (e.g., a Deezer account's "Made for you") are tagged with that provider. Mixed folders (e.g., "Recently added tracks") are filtered at the item level. Disabling a Deezer account in Settings now correctly hides that account's recommendations, mood flows, genre flows, and radios.

### 3.9.2
- **Fix** — **library provider filter restored**: the per-source filter (Deezer account A vs B, TuneIn, etc.) was broken — items from all providers were shown regardless of checkbox state. Root cause: items with a `library://` URI scheme or `library` provider tag were unconditionally bypassing the filter. Now only items with truly no identifiable provider pass through; all others are correctly checked against the enabled providers list.

### 3.9.1
- **Fix** — **search now finds local files by filename**: search runs both a normal query and a `library_only` query in parallel, then merges and deduplicates results. Tracks whose filename contains the search term (but whose metadata does not) now appear in results, matching Music Assistant's own search behavior.

### 3.9.0
- **Feature** — **discover sections in library**: new `recently_played`, `recently_added`, `recommended`, and `flows` sections available in the library tab. Powered by Music Assistant's recommendations API.
- **Feature** — **radios enriched with recommendations**: radio section now includes MA-recommended radios alongside library radios.

### 3.8.1
- **Fix** — **mobile touch targets**: device modal attach/detach buttons now have visible circle backgrounds and 38×38 px hit zones on Companion mobile.

### 3.8.0
- **Feature** — **Companion mobile mode**: automatically detects HA Companion app on phone-sized screens and activates a touch-optimized UI.
- **Feature** — **queue bottom-sheet overlay**: on mobile, the queue slides up from the bottom with a backdrop; tap outside or the close button to dismiss.
- **Feature** — **enlarged touch targets**: add-to-queue buttons with accent circle, queue remove buttons with visible circle, bigger slider thumbs and progress bar hit zone.
- **Feature** — **player controls reflowed**: queue toggle button integrated in the control row instead of overlapping on narrow screens.
- **Feature** — **version in Settings**: version number displayed at the bottom of the Settings panel.
- **Fix** — queue toast messages now show confirmation text ("Added after current track" / "Added to end of queue") instead of repeating the menu label.

### 3.7.4
- **Fix** — **library provider filter**: server-side filtering via Music Assistant's `provider_instance_id_or_domain` parameter. Previously the filter relied on client-side matching of `provider_instances`, which didn't work because MA deduplicates content and assigns all available playback sources to each item. Now each enabled provider is queried individually and results are merged/deduplicated.
- **Fix** — exclude MA internal `builtin` provider from the settings provider list, from item `provider_instances`, and from localStorage cache. The `builtin` provider (MA's internal library manager) was causing all items to pass the filter.
- **Feature** — **device volume sliders**: the group/device modal now shows per-device volume sliders for the master and all group members, with live updating and drag support.

### 3.6.3
- **Fix** — **cover art & thumbnails mixed-content proxy**: new `_resolveImageUrl` helper detects HTTPS pages loading HTTP images (mixed content blocked by browsers) and routes them through a server-side image proxy (`/my_music_library/image_proxy`). HTTP-only setups are unaffected — images load directly as before.
- **Fix** — subitems API compatibility: reordered `get_album_tracks` / `get_playlist_tracks` call attempts to try `(item_id, provider)` first, matching newer Music Assistant API signatures. Reduced fallback log noise from `warning` to `debug`.

### 3.6.2 *(yanked)*
- Broken release — incorrect proxy URL path caused all images to fail. Superseded by 3.6.3.

### 3.6.2
- **Fix** — **cover art server-side image proxy**: new `/api/my_music_library/image_proxy` endpoint fetches images server-side, solving mixed-content (HTTPS page → HTTP MA) and CORS issues that prevented cover art from loading on Safari, iOS, and wall panels.
- **Fix** — all thumbnail URLs (library, search, queue) are now routed through the image proxy, preventing mixed-content blocking everywhere.
- **Fix** — subitems API compatibility: reordered `get_album_tracks` / `get_playlist_tracks` call attempts to try `(item_id, provider)` first, matching the new Music Assistant API signature. Reduced fallback log noise from `warning` to `debug`.

### 3.6.1
- **Fix** — `_resolve_queue_id` now async: awaits `player_queues.get_active_queue()` which became a coroutine in recent Music Assistant versions (fixes `RuntimeWarning: coroutine was never awaited`).
- **Fix** — cover art fallback: when the direct MA imageproxy URL fails (CORS, network), the card now falls back to HA's built-in media player proxy (`/api/media_player_proxy/{entity_id}`) before showing the placeholder.

### 3.6.0
- **Feature** — **MA native queue integration**: new `MAQueueView` endpoint reads and controls the Music Assistant queue directly, keeping the card in sync with MA's actual playback queue.
- **Feature** — **queue actions**: play next, add to end, remove from queue, jump to track.
- **Feature** — **queue UI**: toggle queue visibility, empty state display.
- **Feature** — **search layout toggle**: switch between rows and columns view for search results.

### 3.5.0
- **Feature** — **library layout modes**: `lanes` (horizontal scroll with arrows on hover), `grid` (responsive CSS grid), `columns` (side-by-side sections), `auto` (adaptive).
- **Feature** — **layout selector** in Settings panel (persisted in localStorage).
- **Feature** — **lane navigation arrows** on desktop hover.
- **Feature** — YAML `layout` option on the library tab configuration.

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
