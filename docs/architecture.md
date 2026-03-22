# My Music Library — Architecture

## Component Overview

```
┌─────────────────────────────────────────────────────────┐
│  Home Assistant Instance                                  │
│                                                           │
│  ┌─────────────────────────┐   ┌───────────────────────┐ │
│  │ custom_components/       │   │ Lovelace Frontend     │ │
│  │ my_music_library/        │   │                       │ │
│  │                          │   │  my-music-library-    │ │
│  │  __init__.py             │   │  card.js              │ │
│  │  ├ registers /www path   │◄──┤  (Custom Element)     │ │
│  │  └ registers LR resource │   │                       │ │
│  │                          │   │  Uses:                │ │
│  │  config_flow.py          │   │  ├ hass.callService() │ │
│  │  coordinator.py          │   │  ├ hass.callWS()      │ │
│  │  const.py                │   │  └ hass.states        │ │
│  └─────────────────────────┘   └───────────────────────┘ │
│                                          │                │
│  ┌───────────────────────────────────────▼─────────────┐ │
│  │  Music Assistant Integration (music_assistant)       │ │
│  │  ├ media_player.* entities                          │ │
│  │  ├ music_assistant.play_media service               │ │
│  │  ├ music_assistant.queue_command service            │ │
│  │  └ media_player/browse_media WebSocket command      │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Backend (`custom_components/my_music_library`)

| File | Responsibility |
|------|---------------|
| `__init__.py` | Setup entry: registers static path `/my_music_library/` and auto-adds Lovelace resource |
| `config_flow.py` | UI config flow: detect MA players, pick default device |
| `coordinator.py` | `DataUpdateCoordinator` polling MA state (players list, queue) |
| `const.py` | All constants: domain, platforms, config keys |
| `manifest.json` | Integration metadata, no hard dep on MA (checked at runtime) |

## Frontend (`custom_components/my_music_library/www/`)

Single file: `my-music-library-card.js`

- Vanilla JS Custom Element (no build step, no external deps)
- Shadow DOM for style encapsulation
- CSS Grid + media queries for responsive layout
- Communicates with HA via the `hass` object injected by Lovelace

### Card State Machine
```
IDLE ──► LOADING ──► READY
              │
              ▼
           ERROR (MA not installed / no players)
```

### Data Flow
1. HA injects `hass` object into card on every state change
2. Card reads `hass.states` to find MA `media_player.*` entities
3. User actions call `hass.callService()` (play, pause, volume…)
4. Browse/search calls `hass.callWS({ type: 'media_player/browse_media', … })`
5. Queue data fetched via `hass.callWS({ type: 'music_assistant/queue', … })`

## Music Assistant URIs
MA uses URI-based media content IDs:
```
music_assistant://search?query=<term>
music_assistant://artists
music_assistant://albums
music_assistant://playlists
music_assistant://tracks/favorites
```

## Responsive Layout Strategy
- CSS container queries on the card root element
- Three layout modes: `layout-mobile`, `layout-tablet`, `layout-desktop`
- Applied via JS class on the root element based on `ResizeObserver`

## Lovelace Resource Registration
The integration auto-registers itself as a Lovelace resource on setup using
`lovelace_resources` storage. No manual YAML edit needed.
