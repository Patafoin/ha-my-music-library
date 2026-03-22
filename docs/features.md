# My Music Library — Feature Specifications

## Overview
My Music Library is a Home Assistant custom integration providing a full-featured, responsive music player interface built on top of [Music Assistant](https://music-assistant.io/). It aims to replace "Yet Another Media Player" with a layout that truly adapts to any screen size (phone, tablet, desktop).

---

## F1 — Player Controls

### F1.1 Transport Controls
- Play / Pause toggle
- Stop
- Previous track
- Next track
- Seek (progress bar, click or drag)

### F1.2 Volume
- Volume slider (0–100%)
- Mute / Unmute toggle

### F1.3 Playback Modes
- Shuffle on / off
- Repeat: off / repeat-one / repeat-all

### F1.4 Now Playing Display
- Album art (large, centered on mobile)
- Track title
- Artist name
- Album name
- Progress: elapsed time / total duration

### F1.5 Queue
- View current queue (ordered list)
- Remove tracks from queue
- Move tracks up/down in queue
- Clear queue

---

## F2 — Device Selection

### F2.1 Player Picker
- Dropdown or modal listing all Music Assistant media_player entities
- Show player name + current state (idle, playing, unavailable)
- Switch playback to selected device instantly

### F2.2 Transfer Playback
- Transfer current playing track + position to another device

---

## F3 — Search

### F3.1 Global Search
- Single search bar, searches across all content types simultaneously

### F3.2 Filtered Results
- Tabs / chips to filter by: **All · Tracks · Artists · Albums · Playlists**
- Result cards show: cover art, title, subtitle (artist/year)

### F3.3 Actions on Results
- Play now (replaces queue)
- Add to queue (append)
- Add to queue next (insert)
- Navigate to artist/album detail

---

## F4 — Library & Favorites

### F4.1 Sections
- **Favorite Tracks** — liked/starred tracks list
- **Favorite Artists** — followed artists grid
- **Favorite Albums** — saved albums grid
- **Playlists** — all playlists (MA + provider playlists)
- **Recently Played** — last played items

### F4.2 Browse
- Drill into Artist → see bio + albums + top tracks
- Drill into Album → see tracklist
- Drill into Playlist → see tracks

### F4.3 Actions
- Play entire album/playlist/artist radio
- Add to queue
- Toggle favorite on any item

---

## F5 — Responsive UI (Priority #1)

### F5.1 Breakpoints
| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile     | < 640px | Single column, tabs at bottom, player compact |
| Tablet     | 640–1024px | Player panel (left) + content (right), 50/50 |
| Desktop    | > 1024px | Sidebar nav (left) + content (center) + queue (right) |

### F5.2 Height Behavior
- Card **fills 100% of the available height** in the Lovelace panel — no fixed min-height cutoff
- On mobile: scrollable content area, sticky player bar at bottom
- On tablet/desktop: overflow scroll within panels, player always visible

### F5.3 Touch Support
- Swipe left/right between tabs on mobile
- Tap anywhere on progress bar to seek
- Large touch targets (min 44px) for all controls

---

## F6 — Configuration

### F6.1 Config Flow (UI)
- Select Music Assistant instance (auto-detected if MA integration is present)
- Optionally pre-select a default player device
- Choose default start tab (Player / Search / Library)

### F6.2 Card YAML Options
```yaml
type: custom:my-music-library-card
entity: media_player.my_ma_player   # optional: auto-picks first MA player
default_tab: player                 # player | search | library
accent_color: "#1DB954"             # optional theme color
show_queue: true                    # show queue panel on desktop
```

---

## Non-Goals (v1)
- Lyrics display
- Equalizer / DSP settings
- Social features (sharing, following users)
- Multi-room group management (defer to MA native UI)
