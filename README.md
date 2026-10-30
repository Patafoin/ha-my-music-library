# My Music Library — Home Assistant Integration

A full-featured Music Assistant player card for Home Assistant: now playing, live queue, search, library and artist pages, playlists, and an output panel to move or group the music between speakers — with its own `media_player` entities for your automations.

![Version](https://img.shields.io/badge/version-4.10.1-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2026.2%2B-brightgreen)
[![HACS](https://img.shields.io/badge/HACS-default-41BDF5)](https://hacs.xyz/)

![Player with the live queue](https://raw.githubusercontent.com/Patafoin/ha-my-music-library/main/images/player.png)

[![Open your Home Assistant instance and open this repository inside HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Patafoin&repository=ha-my-music-library&category=integration)

💬 Questions, feedback, ideas: [discussion on the Home Assistant Community forum](https://community.home-assistant.io/t/my-music-library-a-full-music-assistant-player-card-with-speaker-switching-and-grouping/1028632).

> [!TIP]
> **New in 4.9 — Profiles.** Each member of the household can have **their own music** in the card: their own Music Assistant account, streaming account, library and speakers — a child's tablet with their Deezer account and the bedtime stories, without seeing (or messing with) the parents' library. **[Set up profiles](#profiles--one-music-assistant-account-per-user)**.

> [!WARNING]
> **Updating from 3.x?** Version 4 is a breaking update (Music Assistant API token, new player entities, new actions). Read **[Upgrading from 3.x](#upgrading-from-3x)** before updating.

<details>
<summary>What changes for 3.x users</summary>

- **New connection, token required.** My Music Library now connects to Music Assistant **by itself**. After the update and a restart, Home Assistant asks you to **re-authenticate**: enter your Music Assistant URL and a **long-lived API token** created in Music Assistant (**Settings > your user > API tokens**). Until you do, the card only shows a "reconnection needed" banner.
- **Home Assistant 2026.2 or later** is required (3.x ran on 2025.1), with a Music Assistant server able to issue API tokens (tested with 2.10).
- **New `media_player` entities.** My Music Library creates its own player entities. If the official Music Assistant integration is still installed, it keeps the original entity IDs and the new ones get a suffix (`media_player.kitchen_2`): a fixable issue in **Settings > Repairs** offers to swap them, so your automations, scripts and dashboards follow.
- **Actions.** `music_assistant.play_media` and the other actions of the official integration do not work on My Music Library players: use **`my_music_library.play_media`** and **`my_music_library.transfer_queue`**.
- **Card behaviour.** The device picker is replaced by an output panel and only offers **Music Assistant players** (add `show_other_players: true` to bring back other media players); the Library tab always shows your **favorites**.

Step-by-step guide: **[Upgrading from 3.x](#upgrading-from-3x)**.

</details>

---

## Contents

- [What's new in 4.x](#whats-new-in-4x-since-3140)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Upgrading from 3.x](#upgrading-from-3x)
- [Integration options](#integration-options) — default player, hidden players, debug logging
- [Profiles — one Music Assistant account per user](#profiles--one-music-assistant-account-per-user)
- [Adding the card to a dashboard](#adding-the-card-to-a-dashboard)
- [Card configuration (YAML)](#card-configuration-yaml) — tabs, library sections, playlist tab, nav bar
- [Button actions](#button-actions)
- [Full configuration example](#full-configuration-example)
- [Actions and entities](#actions-and-entities) — announcements and TTS, `my_music_library.play_media`, `my_music_library.transfer_queue`
- [Troubleshooting](#troubleshooting)
- [Project structure](#project-structure)
- [Changelog](#changelog)

---

## What's new in 4.x (since 3.14.0)

- **Output panel** — see where the music plays and **switch** it to other outputs (same track, same position), **group** outputs with per-output and group volume, **control** any output from the card; favorite groups, power on from the card, a default output per device.
- **Profiles** (4.9) — each Home Assistant user can browse and play with their own Music Assistant account: their own library, music sources and speakers, and playback from their own streaming account. See [Profiles](#profiles--one-music-assistant-account-per-user).
- **Own Music Assistant connection and players** — no dependency on the official integration; live `media_player` entities usable in automations, with `my_music_library.play_media` and `my_music_library.transfer_queue` ("the music follows me").
- **Instant queue** — the queue updates as soon as Music Assistant changes it (pushed, no more delays).
- **Playback that keeps going** — works around a Music Assistant bug that sometimes stopped an album or playlist after its first track.
- **Artist page** — favorites and full catalog split into albums, EPs, singles and live albums, reachable from search, the library or the new **Artist** button of the player.
- **Discovery tab** — Music Assistant's recommendation folders.
- **Safer setup** — connection test, re-authentication prompt, a clear banner when Music Assistant is unreachable, a Repairs flow for duplicate players.
- **Fixes** — browsing sub-folders of the filesystem provider ([#17](https://github.com/Patafoin/ha-my-music-library/issues/17)) and Deezer's "Made For You", "Start a mix" feedback, logging levels.

Details: [Changelog](https://github.com/Patafoin/ha-my-music-library/blob/main/CHANGELOG.md).

---

## Features

**Output panel** — switch the music to other speakers, group them with per-speaker and group volume, or pick which one the card controls:

![Output panel: Switch, Group and Control modes](https://raw.githubusercontent.com/Patafoin/ha-my-music-library/main/images/outputs.png)

**Artist page** — your favorites and the full catalog, split into albums, EPs and singles:

![Artist page](https://raw.githubusercontent.com/Patafoin/ha-my-music-library/main/images/artist.png)

<img src="https://raw.githubusercontent.com/Patafoin/ha-my-music-library/main/images/mobile.png" alt="Phone layout" width="280" align="right">

- **Now Playing** — album art, track title, artist, progress bar, volume control
- **Playback controls** — play/pause, previous, next, shuffle, repeat (off / all / one)
- **Queue** — live queue display alongside the player, updated as soon as Music Assistant changes it (pushed, no polling), persisted server-side per player across page reloads and devices
- **Search** — full-text search across artists, albums, tracks and playlists via Music Assistant; also searches local library (filenames) for more complete results
- **Library** — your Music Assistant favorites (artists, albums, playlists, tracks, radios…) with a source filter (All / Local / Streaming); **Browse mode** to navigate the filesystem directory tree and play folders
- **Discovery tab** — Music Assistant's recommendation folders (recently played, recently added, suggestions…), one section per folder
- **Artist page** — the artist's favorites from your library, plus their full album catalog, split into albums, EPs, singles and live albums; reachable from search, the library, or the "Artist" button of the player
- **Playlist tab** — a dedicated tab locked to one playlist (picked in the visual editor), showing every track with list/grid view toggle; tapping a track plays it instantly without leaving the tab, thanks to a compact player bar (transport, progress, volume, output row) pinned at the bottom
- **Own media players** — one `media_player` entity per Music Assistant player, updated live (push), usable in automations and scripts, plus a `my_music_library.play_media` action; announcements and `tts.speak` with resume of the music
- **Output panel** — the output row under the player shows where the music plays ("Living room + Kitchen") and opens a panel over the player with three modes: **Switch** (move the music — same track, same position — to one or more outputs, which then form a group), **Group** (add outputs to the current group or remove them, with a volume slider per output and one for the whole group) and **Control** (see what plays where and pick which output the card controls). Outputs are shown as tiles with an icon, a short name (card alias → Home Assistant area → cleaned-up name; an "i" button shows the full name, entity, model and provider), their state, the group leader's crown, and outputs that can't be grouped together greyed out with the reason. Also: favorite groups ("Whole house"…) saved server-side, turn an output on from its tile, offline outputs hidden behind a link, and a per-device default output (pin)
- **Profiles** — one Music Assistant account per Home Assistant user: each person sees their own library, music sources and speakers, and plays from their own streaming account (see [Profiles](#profiles--one-music-assistant-account-per-user))
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

Queue transfer is available as `my_music_library.transfer_queue` (and in the card's output panel). Announcements work through the standard actions: `tts.speak`, or `media_player.play_media` with `announce: true` (see [Announcements and text-to-speech](#announcements-and-text-to-speech)). Once nothing uses the official integration anymore, you can disable it, then remove it.

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

## Profiles — one Music Assistant account per user

By default, every Home Assistant user sees the same thing in the card: the library, music sources and speakers of the Music Assistant account whose token you entered at setup. With **profiles**, a Home Assistant user uses **their own Music Assistant account** instead.

**Example** — a child has a tablet with the Home Assistant app, their own Deezer account and a folder of bedtime stories. With a profile, the card on their tablet shows *their* Deezer library and stories, plays from *their* Deezer account (their listening history and recommendations stay theirs), and only offers the speakers they're allowed to use. The parents keep their own library, untouched.

### What you need

- Music Assistant with user accounts (tested with 2.10) — the server is shared, each person gets an account.
- One Home Assistant **user** per person who gets a profile (a login account; a *person* is not needed).

### Step 1 — Music Assistant: create the user and choose what they may use

1. In Music Assistant, add the music sources of this person if they have their own — e.g. a second **Deezer** provider logged in with *their* account, a **local folder** provider for their files.
2. Go to **Settings > Users**, create the user (role **User**), and set their filters:
   - **Music sources (providers)** — the sources this user may use, e.g. *Deezer (child)* and *Stories*.
   - **Players** — the speakers this user may use. Leave it empty to allow all speakers.
3. Do the same for **the account you entered at setup** if it should not see the other sources (e.g. exclude the child's Deezer from the parents' account). My Music Library applies these filters even to a Music Assistant admin.

### Step 2 — Music Assistant: create a token for that user

Log in to Music Assistant **as that user** and create a long-lived token (**Settings > your user > API tokens**). The token decides whose account is used: a token created by another user would show *their* library.

> An admin can also create a token for another user through Music Assistant's API (`auth/token/create` with `user_id`).

### Step 3 — Home Assistant: create the user

In **Settings > People**, add a person with **Allow person to login** (or create a user only, in **Settings > People > Users** with advanced mode). Give them a non-admin account if this is a child.

### Step 4 — Home Assistant: add the profile

1. Go to **Settings > Devices & Services > My Music Library** and click **Add profile**.
2. Choose the **Home Assistant user**, paste the **Music Assistant token** from step 2, and optionally a **default player** (selected when this user opens the card on a device where no player was chosen yet).
3. Submit: the integration checks the token and reconnects by itself — no restart needed.

Then log in to the Home Assistant app on their device **with their account**. Done.

To change the token or the default player later: on the integration page, open the profile's menu (**⋮**) > **Reconfigure** (leave the token empty to keep it). Deleting a profile sends that user back to the setup account.

### How it works

| | User **with** a profile | User **without** a profile |
|---|---|---|
| Library, search, browse, discovery | their Music Assistant account | the setup account |
| Music sources and speakers offered | their account's filters | the setup account's filters |
| Playback started from the card | from their account (streaming account, history) | from the setup account |
| If their connection is down (token revoked…) | "not connected" banner — **never** someone else's library | — |

Good to know:

- **What the card shows** is separated. Home Assistant itself has no per-user permissions on entities: every user can still find every media player elsewhere in Home Assistant (developer tools, other dashboards).
- **Player controls** (play/pause, next, volume…) and automations go through the setup account; starting a playback from the card goes through the user's own account.
- **Same speaker, two people**: a speaker allowed to both plays whoever started the music last.
- **Favorites**: Music Assistant shares one library and one "favorite" flag between accounts; My Music Library only shows each user the items that are in *their own* library.

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
| `show_device_select` | `boolean` | `true` | Show the output row at the bottom of the player tab (and in the playlist tab's mini player). Set to `false` to hide it. Hidden anyway when only one player is available (nothing to choose); shown with "No player found" when there is none. |
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

My Music Library creates one `media_player` entity per Music Assistant player (entity ID derived from the player name). They support play / pause / stop, previous / next, seek, volume (set, step, mute), shuffle, repeat, turn on / off, `media_player.play_media`, announcements (`tts.speak`, `announce: true`) and grouping (join / unjoin, when the player supports it). Each entity exposes a `mass_player_id` attribute (the Music Assistant player ID).

### Announcements and text-to-speech

My Music Library players accept announcements, played by Music Assistant itself: the player stops, the announcement plays, then the music **resumes where it was** (a paused player stays paused, at the same position). The pre-announce chime and the announcement volume follow the player's settings in Music Assistant (**Settings > Players > the player > Announcements**).

Speak a text with any Home Assistant TTS engine:

```yaml
action: tts.speak
target:
  entity_id: tts.piper
data:
  media_player_entity_id: media_player.kids_room
  message: Time for bed!
```

Or play a sound file (any `http(s)` URL, or a media source such as `media-source://media_source/local/bell.mp3`):

```yaml
action: media_player.play_media
target:
  entity_id: media_player.kids_room
data:
  media_content_id: http://192.168.1.10:8123/local/bell.mp3
  media_content_type: music
  announce: true
  extra:
    use_pre_announce: false   # optional: chime before the announcement
    announce_volume: 40       # optional: volume (0-100) for the announcement only
```

Music Assistant downloads the announcement from Home Assistant: Home Assistant's URL (**Settings > System > Network**, local network) must be reachable from the Music Assistant server.

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
| Old copies of a player (`_2`, `_3`, unavailable) after a device came back | Music Assistant saw it under a new identifier (for Squeezelite: its MAC address — set a fixed one in the player's settings). Delete the old ones from Settings > Repairs, or from their device page |
| Players missing from picker | Check that they're not in the hidden players list (integration options), and — with [profiles](#profiles--one-music-assistant-account-per-user) — that the user's Music Assistant account may use them (player filter in Music Assistant) |
| A user sees someone else's library | They have no profile (they use the setup account), or their profile's token was created by another Music Assistant user: create the token while logged in as them (see [Profiles](#profiles--one-music-assistant-account-per-user)) |
| "Not connected" banner for one user only | Their profile's token was revoked or expired (Music Assistant tokens last one year): open the profile (⋮ > Reconfigure) and paste a new token |

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
│                        # options: default player, hidden players, debug mode;
│                        # profiles: Home Assistant user ↔ Music Assistant token)
├── mass_connection.py   # Own Music Assistant connections (connect, listen, auto-reload)
├── profiles.py          # Profiles: each Home Assistant user's own Music Assistant connection
├── entity.py            # Base entity for Music Assistant players
├── media_player.py      # media_player platform + play_media / transfer_queue actions
├── queue_push.py        # Relays Music Assistant queue events to the card (WebSocket subscription)
├── queue_watchdog.py    # Resumes queues Music Assistant leaves stopped after a track (MA bug workaround)
├── duplicates.py        # Detects duplicates with the official integration, swaps entity IDs
├── missing_players.py   # Media players whose Music Assistant player is gone (removal, Repairs issue)
├── repairs.py           # Repairs fix flows (duplicates, players that no longer exist)
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

See [CHANGELOG.md](https://github.com/Patafoin/ha-my-music-library/blob/main/CHANGELOG.md).

---

## License

MIT
