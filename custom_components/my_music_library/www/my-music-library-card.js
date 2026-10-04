/**
 * My Music Library Card
 * A responsive music player card for Home Assistant + Music Assistant.
 * No external dependencies — pure vanilla JS Custom Element.
 * @version 1.0.0
 */

const CARD_VERSION = "4.8.4";

/* ─── Icons (inline SVG strings) ─────────────────────────── */
const ICONS = {
  swap: `<svg viewBox="0 0 24 24"><path d="M21 9l-4-4v3h-7v2h7v3l4-4zM7 11l-4 4 4 4v-3h7v-2H7v-3z"/></svg>`,
  crown: `<svg viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="M21 7L9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59 21 7z"/></svg>`,
  info: `<svg viewBox="0 0 24 24"><path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>`,
  power: `<svg viewBox="0 0 24 24"><path d="M16.56 5.44l-1.45 1.45A5.97 5.97 0 0 1 18 12a6 6 0 0 1-12 0c0-2.17 1.16-4.06 2.88-5.12L7.44 5.44A7.96 7.96 0 0 0 4 12a8 8 0 0 0 16 0c0-2.72-1.36-5.12-3.44-6.56zM13 3h-2v10h2V3z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>`,
  star: `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
  stop: `<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>`,
  prev: `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>`,
  next: `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z"/></svg>`,
  shuffle: `<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
  repeat: `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`,
  repeatOne: `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>`,
  volumeHigh: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
  volumeMute: `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
  library: `<svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg>`,
  player: `<svg viewBox="0 0 24 24"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  heartOutline: `<svg viewBox="0 0 24 24"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>`,
  device: `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 2.5c1.38 0 2.5 1.12 2.5 2.5S13.38 11.5 12 11.5 9.5 10.38 9.5 9s1.12-2.5 2.5-2.5zM20 18H4v-.57c0-.81.48-1.53 1.22-1.85C6.88 14.96 9.26 14.5 12 14.5s5.12.46 6.78 1.08c.74.32 1.22 1.04 1.22 1.85V18z"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  settings: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
  music: `<svg viewBox="0 0 24 24"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>`,
  album: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>`,
  artist: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  playlist: `<svg viewBox="0 0 24 24"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
  group: `<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
  folder: `<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`,
  folderOpen: `<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>`,
  home: `<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  radio: `<svg viewBox="0 0 24 24"><path d="M20 6H8.3L20.1 3.2 19.6 1.3 2 5.5V20c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`,
  queue: `<svg viewBox="0 0 24 24"><path d="M3 5.5h18v3H3V5.5zm0 5h18v3H3v-3zm0 5h12v3H3v-3z"/></svg>`,
  remove: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  addNext: `<svg viewBox="0 0 24 24"><path d="M21 3H3v18h18V3zm-4 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>`,
  history: `<svg viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>`,
  sparkle: `<svg viewBox="0 0 24 24"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>`,
  newBox: `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-7.5 12H11V10.5H9.5V9h3v7zm5.5 0h-1.5v-2.5H15V16h-1.5V9H15v2.5h1.5V9H18v7z"/></svg>`,
  wave: `<svg viewBox="0 0 24 24"><path d="M21 6c-1.66 0-3 1.34-3 3 0 .55.15 1.06.41 1.5L15 14.5l-2.59-2.59c.35-.51.59-1.12.59-1.91 0-1.66-1.34-3-3-3s-3 1.34-3 3c0 .79.24 1.4.59 1.91L3 16.5 4.5 18l5-5L12 15.5l5-5 .5.5c.44.26.95.41 1.5.41 1.66 0 3-1.34 3-3s-1.34-3-3-3z"/></svg>`,
  list: `<svg viewBox="0 0 24 24"><path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"/></svg>`,
  grid: `<svg viewBox="0 0 24 24"><path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/></svg>`,
  warning: `<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
};

/* ─── i18n ────────────────────────────────────────────────── */
const TRANSLATIONS = {
  en: {
    tabs: { player: "Player", search: "Search", library: "Library", playlist: "Playlist", settings: "Settings", discovery: "Discovery" },
    player: {
      nothing_playing: "Nothing playing",
      select_player: "Select a player",
      no_player: "No player found",
      goto_artist: "Artist",
      artist_not_found: "No artist found for this track",
    },
    playlist: {
      not_configured: "No playlist selected — choose one in the card editor.",
      empty: "This playlist has no tracks.",
      load_error: "Could not load playlist tracks",
      play_all: "Play playlist",
      toggle_view: "Toggle list/grid view",
    },
    btns: {
      shuffle: "Shuffle", prev: "Previous", play_pause: "Play/Pause",
      next: "Next", repeat: "Repeat", mute: "Mute", play: "Play",
    },
    search: {
      placeholder: "Artists, albums, tracks…",
      type_hint: "Type to search your music library",
      searching: "Searching…",
      unavailable: "Search unavailable",
      no_results: "No results for",
      player_label: "Player",
      console_hint: "Check browser console (F12) for details.",
      artists: "Artists", albums: "Albums", tracks: "Tracks", playlists: "Playlists", radios: "Radios",
    },
    lib: {
      loading: "Loading library…",
      loading_short: "Loading…",
      artists: "Artists",
      albums: "Albums",
      playlists: "Playlists",
      tracks: "Tracks",
      radios: "Radios",
      recently_played: "Recently played",
      recently_added: "Recently added",
      recommended: "Recommended",
      flows: "Flows",
      filter_all: "All",
      filter_local: "Local",
      filter_streaming: "Streaming",
      empty: "Library is empty or Music Assistant is not connected.",
      empty_hint: "Make sure Music Assistant integration is installed and running.",
      no_albums: "No albums found",
      load_error: "Could not load albums",
      album_types: { album: "Albums", ep: "EPs", single: "Singles", live: "Live albums", compilation: "Compilations" },
      mode_catalogue: "Catalogue",
      mode_browse: "Browse",
      browse_root: "Root",
      browse_play: "Play",
      browse_error: "Could not load folder contents",
      browse_empty: "Empty folder",
    },
    artist: {
      favorites: "Favorites",
      all_albums: "All albums",
      sort_name: "Name",
      sort_date: "Date",
      no_albums: "No albums found",
      load_error: "Could not load albums",
    },
    discovery: {
      empty: "No recommendations available right now",
      load_error: "Could not load recommendations",
    },
    queue: { up_next: "Up Next", empty: "Queue is empty", play_next: "Play next", add_to_end: "Add to end", added_next: "Added after current track", added_end: "Added to end of queue", remove: "Remove", toggle: "Toggle queue", start_mix: "Start a mix", mix_preparing: "Preparing the mix…", mix_started: "Mix started" },
    errors: { media_not_found: "Media not found on source", play_failed: "Playback failed" },
    connection: {
      title: "Music Assistant reconnection needed",
      desc: "The connection to Music Assistant is down — search, library and playback won't work until this is fixed.",
      action: "Reconfigure",
    },
    nav: { back: "← Back" },
    outputs: {
      open: "Choose output",
      mode_switch: "Switch", mode_group: "Group", mode_control: "Control",
      hint_switch: "Move the music to one or more outputs (same track, same position).",
      hint_group: "Add outputs to the current group, or remove them.",
      hint_control: "Choose which output this card controls.",
      close: "Close", source: "Playing on", to: "Move to", current: "Current output",
      select_hint: "Select one or more outputs",
      switch_to_one: "Switch to {name}", switch_to_many: "Switch to {n} outputs",
      switched: "Music moved to {name}",
      group_of: "Group of {name}", in_group: "In the group", member_of: "With {name}",
      cannot_group: "Can't be grouped with {name}", no_other_outputs: "No other output",
      volumes: "Volume", group_volume: "Whole group",
      presets: "Favorite groups", save_preset: "Save this group", preset_name: "Group name",
      save: "Save", cancel: "Cancel", preset_saved: "Group “{name}” saved",
      delete_preset: "Delete", delete_preset_confirm: "Delete the favorite group “{name}”?",
      dissolve: "Ungroup all",
      sessions: "Playing now", no_sessions: "Nothing is playing.", other_outputs: "Other outputs",
      other_players: "Other Home Assistant players",
      show_offline: "Show {n} offline", hide_offline: "Hide offline",
      leader: "Leads the group", playing: "Playing", paused: "Paused", idle: "Idle", off: "Off", unavailable: "Offline",
      power_on: "Turn on", pin: "Default output on this device", unpin: "Default output on this device — tap to unpin",
      details: "Details", info_entity: "Entity", info_area: "Area", info_model: "Model", info_provider: "Provider", info_state: "State",
      browser: "Browser", nothing: "Nothing playing", no_outputs: "No Music Assistant output found.",
      action_failed: "Failed: {msg}",
    },
    settings: {
      title: "Settings",
      providers_title: "Library providers",
      providers_hint: "Choose which providers appear in your library",
      providers_empty: "No providers found — check Music Assistant connection",
      debug_active: "Debug mode is active",
      debug_hint: "Detailed logs are visible in the browser console (F12) and in HA logs (filter: my_music_library). Disable in integration options when done.",
      layout_title: "Library layout",
      layout_hint: "How sections are displayed",
      layout_lanes: "Lanes",
      layout_grid: "Grid",
      layout_columns: "Columns",
      layout_auto: "Auto",
    },
    editor: {
      default_tab: "Default tab",
      entity: "Entity (media_player)",
      entity_hint: "e.g. media_player.living_room",
      height: "Height",
      height_hint: "Auto (fill container)",
      tabs_title: "Tabs",
      add_tab: "Add tab",
      tab_label: "Label",
      tab_label_hint: "Custom label (empty = default)",
      tab_icon: "Icon",
      tab_icon_hint: "e.g. mdi:play-circle",
      tab_show_in_nav: "Show in nav bar",
      advanced_config: "Advanced (YAML)",
      advanced_config_hint: "Extra properties not covered above, e.g. tap_action data/target",
      sections_title: "Library sections",
      layout_label: "Layout",
      layout_grid_disabled: "Grid is only available with a single section",
      btn_icon: "Icon",
      btn_name: "Name",
      btn_entity: "Entity",
      btn_action: "Tap action",
      btn_action_type: "Action type",
      btn_nav_path: "Navigation path",
      btn_url: "URL",
      btn_service: "Service",
      action_none: "None",
      action_toggle: "Toggle",
      action_more_info: "More info",
      action_navigate: "Navigate",
      action_url: "Open URL",
      action_call_service: "Call service",
      action_assist: "Assist",
      type_player: "Player",
      type_search: "Search",
      type_library: "Library",
      type_discovery: "Discovery",
      type_playlist: "Playlist",
      type_settings: "Settings",
      type_button: "Button",
      playlist_select: "Playlist",
      playlist_select_placeholder: "Choose a playlist…",
      confirm_delete: "Remove this tab?",
      move_up: "Move up",
      move_down: "Move down",
      delete: "Delete",
      search_layout: "Layout",
      search_layout_rows: "Rows",
      search_layout_columns: "Columns",
      show_device_select: "Show the output row",
      show_other_players: "Offer other Home Assistant players (Control mode)",
      outputs_title: "Outputs",
      outputs_hint: "Short name, icon (mdi:…) and visibility of each output in the output panel.",
      outputs_alias: "Short name",
      outputs_hide: "Hide",
      type_custom_element: "Custom element",
      btn_element_name: "Element tag",
      btn_element_config: "Config (JSON)",
      action_mml_navigate_tab: "Show tab (MML)",
      action_mml_navigate_section: "Show section (MML)",
      action_mml_control: "Player control (MML)",
      btn_mml_tab: "Tab",
      btn_mml_section: "Section",
      btn_mml_command: "Command",
      mml_cmd_play_pause: "Play / Pause",
      mml_cmd_next: "Next",
      mml_cmd_prev: "Previous",
      mml_cmd_shuffle: "Shuffle",
      mml_cmd_repeat: "Repeat",
      mml_cmd_mute: "Mute",
      nav_bar_section: "Navigation bar",
      nav_bar_position: "Position",
      nav_bar_pos_top: "Top",
      nav_bar_pos_bottom: "Bottom",
      nav_bar_pos_left: "Left",
      nav_bar_pos_right: "Right",
      nav_bar_align: "Alignment",
      nav_bar_align_start: "Start",
      nav_bar_align_center: "Center",
      nav_bar_align_end: "End",
      nav_bar_align_space_between: "Space between",
    },
  },
  fr: {
    tabs: { player: "Lecteur", search: "Recherche", library: "Bibliothèque", playlist: "Playlist", settings: "Paramètres", discovery: "Découverte" },
    player: {
      nothing_playing: "Rien en cours de lecture",
      select_player: "Sélectionnez un lecteur",
      no_player: "Aucun lecteur trouvé",
      goto_artist: "Artiste",
      artist_not_found: "Aucun artiste trouvé pour ce titre",
    },
    playlist: {
      not_configured: "Aucune playlist sélectionnée — choisissez-en une dans l'éditeur de carte.",
      empty: "Cette playlist ne contient aucun titre.",
      load_error: "Impossible de charger les titres de la playlist",
      play_all: "Lire la playlist",
      toggle_view: "Basculer affichage liste/grille",
    },
    btns: {
      shuffle: "Aléatoire", prev: "Précédent", play_pause: "Lecture / Pause",
      next: "Suivant", repeat: "Répéter", mute: "Muet", play: "Lecture",
    },
    search: {
      placeholder: "Artistes, albums, titres…",
      type_hint: "Tapez pour rechercher dans votre bibliothèque musicale",
      searching: "Recherche en cours…",
      unavailable: "Recherche indisponible",
      no_results: "Aucun résultat pour",
      player_label: "Lecteur",
      console_hint: "Consultez la console du navigateur (F12) pour plus de détails.",
      artists: "Artistes", albums: "Albums", tracks: "Titres", playlists: "Playlists", radios: "Radios",
    },
    lib: {
      loading: "Chargement de la bibliothèque…",
      loading_short: "Chargement…",
      artists: "Artistes",
      albums: "Albums",
      playlists: "Playlists",
      tracks: "Titres",
      radios: "Radios",
      recently_played: "Écoutés récemment",
      recently_added: "Ajoutés récemment",
      recommended: "Recommandations",
      flows: "Flows",
      filter_all: "Tout",
      filter_local: "Local",
      filter_streaming: "Streaming",
      empty: "La bibliothèque est vide ou Music Assistant n'est pas connecté.",
      empty_hint: "Assurez-vous que l'intégration Music Assistant est installée et en cours d'exécution.",
      no_albums: "Aucun album trouvé",
      load_error: "Impossible de charger les albums",
      album_types: { album: "Albums", ep: "EPs", single: "Singles", live: "Albums live", compilation: "Compilations" },
      mode_catalogue: "Catalogue",
      mode_browse: "Parcourir",
      browse_root: "Racine",
      browse_play: "Lire",
      browse_error: "Impossible de charger le contenu du dossier",
      browse_empty: "Dossier vide",
    },
    artist: {
      favorites: "Favoris",
      all_albums: "Tous les albums",
      sort_name: "Nom",
      sort_date: "Date",
      no_albums: "Aucun album trouvé",
      load_error: "Impossible de charger les albums",
    },
    discovery: {
      empty: "Aucune recommandation disponible pour le moment",
      load_error: "Impossible de charger les recommandations",
    },
    queue: { up_next: "À suivre", empty: "File d'attente vide", play_next: "Lire après le titre en cours", add_to_end: "Ajouter à la fin", added_next: "Ajouté après le titre en cours", added_end: "Ajouté à la fin de la file d'attente", remove: "Supprimer", toggle: "Afficher/masquer la file", start_mix: "Lancer un mix", mix_preparing: "Préparation du mix…", mix_started: "Mix lancé" },
    errors: { media_not_found: "Média introuvable sur la source", play_failed: "Échec de la lecture" },
    connection: {
      title: "Reconnexion à Music Assistant nécessaire",
      desc: "La connexion à Music Assistant est coupée — recherche, bibliothèque et lecture ne fonctionneront pas tant que ce n'est pas résolu.",
      action: "Reconfigurer",
    },
    nav: { back: "← Retour" },
    outputs: {
      open: "Choisir la sortie",
      mode_switch: "Basculer", mode_group: "Grouper", mode_control: "Contrôler",
      hint_switch: "Déplacer la musique vers une ou plusieurs sorties (même titre, même position).",
      hint_group: "Ajouter des sorties au groupe en cours, ou en retirer.",
      hint_control: "Choisir la sortie que cette carte pilote.",
      close: "Fermer", source: "En cours sur", to: "Vers", current: "Sortie actuelle",
      select_hint: "Sélectionnez une ou plusieurs sorties",
      switch_to_one: "Basculer vers {name}", switch_to_many: "Basculer vers {n} sorties",
      switched: "Musique basculée vers {name}",
      group_of: "Groupe de {name}", in_group: "Dans le groupe", member_of: "Avec {name}",
      cannot_group: "Ne peut pas être groupé avec {name}", no_other_outputs: "Aucune autre sortie",
      volumes: "Volume", group_volume: "Tout le groupe",
      presets: "Groupes favoris", save_preset: "Enregistrer ce groupe", preset_name: "Nom du groupe",
      save: "Enregistrer", cancel: "Annuler", preset_saved: "Groupe « {name} » enregistré",
      delete_preset: "Supprimer", delete_preset_confirm: "Supprimer le groupe favori « {name} » ?",
      dissolve: "Dissoudre le groupe",
      sessions: "En cours de lecture", no_sessions: "Rien n'est en cours de lecture.", other_outputs: "Autres sorties",
      other_players: "Autres lecteurs Home Assistant",
      show_offline: "Afficher {n} hors ligne", hide_offline: "Masquer les sorties hors ligne",
      leader: "Mène le groupe", playing: "Lecture", paused: "Pause", idle: "Inactif", off: "Éteint", unavailable: "Hors ligne",
      power_on: "Allumer", pin: "Sortie par défaut de cet appareil", unpin: "Sortie par défaut de cet appareil — toucher pour retirer",
      details: "Détails", info_entity: "Entité", info_area: "Pièce", info_model: "Modèle", info_provider: "Fournisseur", info_state: "État",
      browser: "Navigateur", nothing: "Rien en cours de lecture", no_outputs: "Aucune sortie Music Assistant trouvée.",
      action_failed: "Échec : {msg}",
    },
    settings: {
      title: "Paramètres",
      providers_title: "Sources de la bibliothèque",
      providers_hint: "Choisissez quelles sources apparaissent dans votre bibliothèque",
      providers_empty: "Aucune source trouvée — vérifiez la connexion à Music Assistant",
      debug_active: "Mode débogage actif",
      debug_hint: "Les logs détaillés sont visibles dans la console du navigateur (F12) et dans les journaux HA (filtre : my_music_library). Désactivez dans les options de l'intégration une fois terminé.",
      layout_title: "Disposition de la bibliothèque",
      layout_hint: "Mode d'affichage des sections",
      layout_lanes: "Lignes",
      layout_grid: "Grille",
      layout_columns: "Colonnes",
      layout_auto: "Auto",
    },
    editor: {
      default_tab: "Onglet par défaut",
      entity: "Entité (media_player)",
      entity_hint: "ex. media_player.salon",
      height: "Hauteur",
      height_hint: "Auto (remplit le conteneur)",
      tabs_title: "Onglets",
      add_tab: "Ajouter un onglet",
      tab_label: "Libellé",
      tab_label_hint: "Libellé personnalisé (vide = défaut)",
      tab_icon: "Icône",
      tab_icon_hint: "ex. mdi:play-circle",
      tab_show_in_nav: "Afficher dans la barre de nav",
      advanced_config: "Avancé (YAML)",
      advanced_config_hint: "Propriétés supplémentaires non couvertes ci-dessus, ex. data/target de tap_action",
      sections_title: "Sections de la bibliothèque",
      layout_label: "Disposition",
      layout_grid_disabled: "La grille n'est disponible qu'avec une seule section",
      btn_icon: "Icône",
      btn_name: "Nom",
      btn_entity: "Entité",
      btn_action: "Action au toucher",
      btn_action_type: "Type d'action",
      btn_nav_path: "Chemin de navigation",
      btn_url: "URL",
      btn_service: "Service",
      action_none: "Aucune",
      action_toggle: "Basculer",
      action_more_info: "Plus d'infos",
      action_navigate: "Naviguer",
      action_url: "Ouvrir URL",
      action_call_service: "Appeler un service",
      action_assist: "Assistant",
      type_player: "Lecteur",
      type_search: "Recherche",
      type_library: "Bibliothèque",
      type_discovery: "Découverte",
      type_playlist: "Playlist",
      type_settings: "Paramètres",
      type_button: "Bouton",
      playlist_select: "Playlist",
      playlist_select_placeholder: "Choisir une playlist…",
      confirm_delete: "Supprimer cet onglet ?",
      move_up: "Monter",
      move_down: "Descendre",
      delete: "Supprimer",
      search_layout: "Disposition",
      search_layout_rows: "Lignes",
      search_layout_columns: "Colonnes",
      show_device_select: "Afficher la ligne de sortie",
      show_other_players: "Proposer les autres lecteurs Home Assistant (mode Contrôler)",
      outputs_title: "Sorties",
      outputs_hint: "Nom court, icône (mdi:…) et visibilité de chaque sortie dans le panneau des sorties.",
      outputs_alias: "Nom court",
      outputs_hide: "Masquer",
      type_custom_element: "Élément custom",
      btn_element_name: "Balise élément",
      btn_element_config: "Config (JSON)",
      action_mml_navigate_tab: "Afficher un onglet (MML)",
      action_mml_navigate_section: "Afficher une section (MML)",
      action_mml_control: "Contrôle lecteur (MML)",
      btn_mml_tab: "Onglet",
      btn_mml_section: "Section",
      btn_mml_command: "Commande",
      mml_cmd_play_pause: "Lecture / Pause",
      mml_cmd_next: "Suivant",
      mml_cmd_prev: "Précédent",
      mml_cmd_shuffle: "Aléatoire",
      mml_cmd_repeat: "Répéter",
      mml_cmd_mute: "Muet",
      nav_bar_section: "Barre de navigation",
      nav_bar_position: "Position",
      nav_bar_pos_top: "Haut",
      nav_bar_pos_bottom: "Bas",
      nav_bar_pos_left: "Gauche",
      nav_bar_pos_right: "Droite",
      nav_bar_align: "Alignement",
      nav_bar_align_start: "Début",
      nav_bar_align_center: "Centre",
      nav_bar_align_end: "Fin",
      nav_bar_align_space_between: "Réparti",
    },
  },
  de: {
    tabs: { player: "Wiedergabe", search: "Suche", library: "Bibliothek", playlist: "Playlist", settings: "Einstellungen", discovery: "Entdecken" },
    player: {
      nothing_playing: "Nichts wird abgespielt",
      select_player: "Player auswählen",
      no_player: "Kein Player gefunden",
      goto_artist: "Künstler",
      artist_not_found: "Kein Künstler für diesen Titel gefunden",
    },
    playlist: {
      not_configured: "Keine Playlist ausgewählt — wählen Sie eine im Karten-Editor.",
      empty: "Diese Playlist enthält keine Titel.",
      load_error: "Playlist-Titel konnten nicht geladen werden",
      play_all: "Playlist abspielen",
      toggle_view: "Listen-/Rasteransicht umschalten",
    },
    btns: {
      shuffle: "Zufällig", prev: "Zurück", play_pause: "Wiedergabe / Pause",
      next: "Weiter", repeat: "Wiederholen", mute: "Stummschalten", play: "Abspielen",
    },
    search: {
      placeholder: "Künstler, Alben, Titel…",
      type_hint: "Eingabe um die Musikbibliothek zu durchsuchen",
      searching: "Suche läuft…",
      unavailable: "Suche nicht verfügbar",
      no_results: "Keine Ergebnisse für",
      player_label: "Player",
      console_hint: "Browser-Konsole (F12) für Details prüfen.",
      artists: "Künstler", albums: "Alben", tracks: "Titel", playlists: "Playlists", radios: "Radios",
    },
    lib: {
      loading: "Bibliothek wird geladen…",
      loading_short: "Laden…",
      artists: "Künstler",
      albums: "Alben",
      playlists: "Playlists",
      tracks: "Titel",
      radios: "Radios",
      recently_played: "Kürzlich gespielt",
      recently_added: "Kürzlich hinzugefügt",
      recommended: "Empfehlungen",
      flows: "Flows",
      filter_all: "Alle",
      filter_local: "Lokal",
      filter_streaming: "Streaming",
      empty: "Bibliothek ist leer oder Music Assistant ist nicht verbunden.",
      empty_hint: "Stellen Sie sicher, dass die Music Assistant Integration installiert und aktiv ist.",
      no_albums: "Keine Alben gefunden",
      load_error: "Alben konnten nicht geladen werden",
      album_types: { album: "Alben", ep: "EPs", single: "Singles", live: "Live-Alben", compilation: "Kompilationen" },
      mode_catalogue: "Katalog",
      mode_browse: "Durchsuchen",
      browse_root: "Wurzel",
      browse_play: "Abspielen",
      browse_error: "Ordnerinhalt konnte nicht geladen werden",
      browse_empty: "Leerer Ordner",
    },
    artist: {
      favorites: "Favoriten",
      all_albums: "Alle Alben",
      sort_name: "Name",
      sort_date: "Datum",
      no_albums: "Keine Alben gefunden",
      load_error: "Alben konnten nicht geladen werden",
    },
    discovery: {
      empty: "Momentan keine Empfehlungen verfügbar",
      load_error: "Empfehlungen konnten nicht geladen werden",
    },
    queue: { up_next: "Als Nächstes", empty: "Warteschlange ist leer", play_next: "Als Nächstes abspielen", add_to_end: "Am Ende hinzufügen", added_next: "Nach dem aktuellen Titel hinzugefügt", added_end: "Am Ende der Warteschlange hinzugefügt", remove: "Entfernen", toggle: "Warteschlange ein-/ausblenden", start_mix: "Mix starten", mix_preparing: "Mix wird vorbereitet…", mix_started: "Mix gestartet" },
    errors: { media_not_found: "Medium auf der Quelle nicht gefunden", play_failed: "Wiedergabe fehlgeschlagen" },
    connection: {
      title: "Erneute Verbindung zu Music Assistant erforderlich",
      desc: "Die Verbindung zu Music Assistant ist unterbrochen — Suche, Bibliothek und Wiedergabe funktionieren erst wieder, wenn dies behoben ist.",
      action: "Neu konfigurieren",
    },
    nav: { back: "← Zurück" },
    outputs: {
      open: "Ausgabe wählen",
      mode_switch: "Wechseln", mode_group: "Gruppieren", mode_control: "Steuern",
      hint_switch: "Die Musik auf eine oder mehrere Ausgaben verschieben (gleicher Titel, gleiche Position).",
      hint_group: "Ausgaben zur aktuellen Gruppe hinzufügen oder entfernen.",
      hint_control: "Wählen, welche Ausgabe diese Karte steuert.",
      close: "Schließen", source: "Läuft auf", to: "Nach", current: "Aktuelle Ausgabe",
      select_hint: "Eine oder mehrere Ausgaben wählen",
      switch_to_one: "Zu {name} wechseln", switch_to_many: "Zu {n} Ausgaben wechseln",
      switched: "Musik zu {name} verschoben",
      group_of: "Gruppe von {name}", in_group: "In der Gruppe", member_of: "Mit {name}",
      cannot_group: "Kann nicht mit {name} gruppiert werden", no_other_outputs: "Keine weitere Ausgabe",
      volumes: "Lautstärke", group_volume: "Ganze Gruppe",
      presets: "Lieblingsgruppen", save_preset: "Diese Gruppe speichern", preset_name: "Gruppenname",
      save: "Speichern", cancel: "Abbrechen", preset_saved: "Gruppe „{name}“ gespeichert",
      delete_preset: "Löschen", delete_preset_confirm: "Lieblingsgruppe „{name}“ löschen?",
      dissolve: "Gruppe auflösen",
      sessions: "Aktuelle Wiedergabe", no_sessions: "Nichts wird abgespielt.", other_outputs: "Weitere Ausgaben",
      other_players: "Weitere Home-Assistant-Player",
      show_offline: "{n} offline anzeigen", hide_offline: "Offline ausblenden",
      leader: "Führt die Gruppe", playing: "Wiedergabe", paused: "Pause", idle: "Inaktiv", off: "Aus", unavailable: "Offline",
      power_on: "Einschalten", pin: "Standardausgabe auf diesem Gerät", unpin: "Standardausgabe auf diesem Gerät — tippen zum Lösen",
      details: "Details", info_entity: "Entität", info_area: "Bereich", info_model: "Modell", info_provider: "Anbieter", info_state: "Status",
      browser: "Browser", nothing: "Keine Wiedergabe", no_outputs: "Keine Music-Assistant-Ausgabe gefunden.",
      action_failed: "Fehlgeschlagen: {msg}",
    },
    settings: {
      title: "Einstellungen",
      providers_title: "Bibliotheksquellen",
      providers_hint: "Wählen Sie, welche Quellen in Ihrer Bibliothek angezeigt werden",
      providers_empty: "Keine Quellen gefunden — Music Assistant-Verbindung prüfen",
      debug_active: "Debug-Modus ist aktiv",
      debug_hint: "Detaillierte Protokolle sind in der Browser-Konsole (F12) und in den HA-Logs (Filter: my_music_library) sichtbar. Nach dem Debugging in den Integrationsoptionen deaktivieren.",
      layout_title: "Bibliothek-Layout",
      layout_hint: "Anzeigemodus der Bereiche",
      layout_lanes: "Bahnen",
      layout_grid: "Raster",
      layout_columns: "Spalten",
      layout_auto: "Auto",
    },
    editor: {
      default_tab: "Standard-Tab",
      entity: "Entität (media_player)",
      entity_hint: "z.B. media_player.wohnzimmer",
      height: "Höhe",
      height_hint: "Auto (Container füllen)",
      tabs_title: "Tabs",
      add_tab: "Tab hinzufügen",
      tab_label: "Bezeichnung",
      tab_label_hint: "Eigene Bezeichnung (leer = Standard)",
      tab_icon: "Symbol",
      tab_icon_hint: "z.B. mdi:play-circle",
      tab_show_in_nav: "In Navigationsleiste anzeigen",
      advanced_config: "Erweitert (YAML)",
      advanced_config_hint: "Zusätzliche Eigenschaften, die oben nicht abgedeckt sind, z.B. tap_action data/target",
      sections_title: "Bibliotheksbereiche",
      layout_label: "Layout",
      layout_grid_disabled: "Raster ist nur mit einem einzelnen Bereich verfügbar",
      btn_icon: "Symbol",
      btn_name: "Name",
      btn_entity: "Entität",
      btn_action: "Tipp-Aktion",
      btn_action_type: "Aktionstyp",
      btn_nav_path: "Navigationspfad",
      btn_url: "URL",
      btn_service: "Dienst",
      action_none: "Keine",
      action_toggle: "Umschalten",
      action_more_info: "Mehr Infos",
      action_navigate: "Navigieren",
      action_url: "URL öffnen",
      action_call_service: "Dienst aufrufen",
      action_assist: "Assistent",
      type_player: "Wiedergabe",
      type_search: "Suche",
      type_library: "Bibliothek",
      type_discovery: "Entdecken",
      type_playlist: "Playlist",
      type_settings: "Einstellungen",
      type_button: "Schaltfläche",
      playlist_select: "Playlist",
      playlist_select_placeholder: "Playlist auswählen…",
      confirm_delete: "Diesen Tab entfernen?",
      move_up: "Nach oben",
      move_down: "Nach unten",
      delete: "Löschen",
      search_layout: "Layout",
      search_layout_rows: "Zeilen",
      search_layout_columns: "Spalten",
      show_device_select: "Ausgabezeile anzeigen",
      show_other_players: "Andere Home-Assistant-Player anbieten (Modus Steuern)",
      outputs_title: "Ausgaben",
      outputs_hint: "Kurzname, Symbol (mdi:…) und Sichtbarkeit jeder Ausgabe im Ausgabenbereich.",
      outputs_alias: "Kurzname",
      outputs_hide: "Ausblenden",
      type_custom_element: "Benutzerelement",
      btn_element_name: "Element-Tag",
      btn_element_config: "Konfiguration (JSON)",
      action_mml_navigate_tab: "Tab anzeigen (MML)",
      action_mml_navigate_section: "Abschnitt anzeigen (MML)",
      action_mml_control: "Player-Steuerung (MML)",
      btn_mml_tab: "Tab",
      btn_mml_section: "Abschnitt",
      btn_mml_command: "Befehl",
      mml_cmd_play_pause: "Wiedergabe / Pause",
      mml_cmd_next: "Weiter",
      mml_cmd_prev: "Zurück",
      mml_cmd_shuffle: "Zufällig",
      mml_cmd_repeat: "Wiederholen",
      mml_cmd_mute: "Stummschalten",
      nav_bar_section: "Navigationsleiste",
      nav_bar_position: "Position",
      nav_bar_pos_top: "Oben",
      nav_bar_pos_bottom: "Unten",
      nav_bar_pos_left: "Links",
      nav_bar_pos_right: "Rechts",
      nav_bar_align: "Ausrichtung",
      nav_bar_align_start: "Anfang",
      nav_bar_align_center: "Mitte",
      nav_bar_align_end: "Ende",
      nav_bar_align_space_between: "Verteilt",
    },
  },
};

/* ─── YAML utilities (no external deps) ──────────────────── */
function _yamlDump(obj, indent = 0) {
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "boolean" || typeof obj === "number") return String(obj);
  if (typeof obj === "string") {
    if (!obj || /[\r\n:#\[\]{},&*?|<>=!%@`"']/.test(obj) || /^\s|\s$/.test(obj) ||
        /^(true|false|yes|no|on|off|null|~)$/i.test(obj) || /^\d/.test(obj)) {
      return `"${obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    if (!obj.length) return "[]";
    const pad = " ".repeat(indent);
    return obj.map(v => `${pad}- ${_yamlDump(v, indent + 2)}`).join("\n");
  }
  if (typeof obj === "object") {
    const keys = Object.keys(obj);
    if (!keys.length) return "";
    const pad = " ".repeat(indent);
    return keys.map(k => {
      const v = obj[k];
      if (v !== null && typeof v === "object") {
        const nested = _yamlDump(v, indent + 2);
        return nested ? `${pad}${k}:\n${nested}` : `${pad}${k}: {}`;
      }
      return `${pad}${k}: ${_yamlDump(v, indent)}`;
    }).join("\n");
  }
  return String(obj);
}

function _parseYamlScalar(v) {
  if (v === "true" || v === "yes" || v === "on") return true;
  if (v === "false" || v === "no" || v === "off") return false;
  if (v === "null" || v === "~" || v === "") return null;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"');
  }
  return v;
}

function _yamlLoad(text) {
  if (window.jsyaml?.load) return window.jsyaml.load(text);
  const t = text.trim();
  if (!t || t === "{}") return {};
  // Basic line-by-line parser for HA card config subset
  const lines = t.split("\n");
  const stack = [{ obj: {}, indent: -1 }];
  const arrKeys = new Map(); // tracks which keys hold arrays
  for (const raw of lines) {
    const trimEnd = raw.trimEnd();
    if (!trimEnd || trimEnd.trimStart().startsWith("#")) continue;
    const il = trimEnd.length - trimEnd.trimStart().length;
    const content = trimEnd.trimStart();
    while (stack.length > 1 && stack[stack.length - 1].indent >= il) stack.pop();
    const top = stack[stack.length - 1];
    if (content.startsWith("- ")) {
      const val = _parseYamlScalar(content.slice(2).trim());
      const arrKey = arrKeys.get(top);
      if (arrKey !== undefined && Array.isArray(top.obj[arrKey])) top.obj[arrKey].push(val);
      continue;
    }
    const ci = content.indexOf(": ");
    const colonEnd = content === content.replace(/:$/, "") ? -1 : content.length - 1;
    if (ci === -1 && colonEnd === -1) continue;
    const key = ci >= 0 ? content.slice(0, ci).trim() : content.slice(0, colonEnd).trim();
    const val = ci >= 0 ? content.slice(ci + 2).trim() : "";
    if (!val) {
      const newObj = {};
      top.obj[key] = newObj;
      stack.push({ obj: newObj, indent: il });
    } else if (val === "[]") {
      top.obj[key] = [];
      arrKeys.set(stack[stack.length - 1], key);
    } else {
      top.obj[key] = _parseYamlScalar(val);
    }
  }
  return stack[0].obj;
}

/* ─── CSS ─────────────────────────────────────────────────── */
const STYLES = `
  :host {
    display: block;
    height: 100%;
    min-height: var(--mml-height, 400px);
    font-family: var(--paper-font-body1_-_font-family, sans-serif);
    --accent: var(--primary-color, #1db954);
    --bg: var(--ha-card-background, var(--card-background-color, #1e1e2e));
    --bg2: color-mix(in srgb, var(--bg) 80%, white 20%);
    --text: var(--primary-text-color, #fff);
    --text2: var(--secondary-text-color, rgba(255,255,255,0.78));
    --border: color-mix(in srgb, var(--text) 12%, transparent);
    --radius: 12px;
    --control-size: 52px;
    color: var(--text);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .card-root {
    background: var(--bg);
    border-radius: 0 0 var(--radius) var(--radius);
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  /* ── NAV TABS ── */
  .nav-wrapper {
    position: relative;
    flex-shrink: 0;
  }
  .nav {
    display: flex;
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
  }
  .nav::-webkit-scrollbar { display: none; }
  .nav-fade-left,
  .nav-fade-right {
    position: absolute;
    top: 0;
    bottom: 1px;
    width: 24px;
    pointer-events: none;
    opacity: 0;
    transition: opacity .2s;
    z-index: 2;
  }
  .nav-fade-left {
    left: 0;
    background: linear-gradient(to right, var(--bg2), transparent);
  }
  .nav-fade-right {
    right: 0;
    background: linear-gradient(to left, var(--bg2), transparent);
  }
  .nav-fade-left.visible,
  .nav-fade-right.visible { opacity: 1; }
  .nav-tab {
    flex: 1 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px 8px;
    cursor: pointer;
    border: none;
    background: none;
    color: var(--text2);
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    scroll-snap-align: start;
    transition: color .2s, background .2s;
    -webkit-tap-highlight-color: transparent;
  }
  .nav-tab svg { width: 18px; height: 18px; fill: currentColor; flex-shrink: 0; }
  .nav-tab ha-icon { --mdc-icon-size: 18px; display: block; pointer-events: none; flex-shrink: 0; }
  .nav-tab { border-right: 2px solid var(--border); }
  .nav-tab.active {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border-bottom: 2px solid var(--accent);
  }
  .nav-tab:not(.active):hover { color: var(--text); background: rgba(255,255,255,0.04); }

  /* ── NAV TABS WRAPPER (allows extra buttons on sides) ── */
  .nav-tabs { display: flex; flex: 1 0 auto; align-items: stretch; }
  .nav-tab { align-self: stretch; }

  /* ── NAV ACTION BUTTONS ── */
  .nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 6px 8px;
    min-width: 36px;
    min-height: 44px;
    box-sizing: border-box;
    cursor: pointer;
    border: none;
    border-radius: 0;
    background: none;
    color: var(--text2);
    white-space: nowrap;
    flex-shrink: 0;
    scroll-snap-align: start;
    transition: color .2s, background .2s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    user-select: none;
  }
  .nav-btn:hover { color: var(--text); background: rgba(255,255,255,0.06); }
  .nav-btn:active { background: rgba(255,255,255,0.12); }
  .nav-btn.active { color: var(--accent); }
  .nav-btn ha-icon { --mdc-icon-size: 20px; display: block; pointer-events: none; }
  .nav-btn svg { width: 20px; height: 20px; fill: currentColor; flex-shrink: 0; }
  .nav-btn-label { font-size: 10px; font-weight: 500; line-height: 1; pointer-events: none; }

  /* ── CUSTOM ELEMENT SLOT ── */
  .nav-btn-custom { padding: 0; min-width: 36px; min-height: 44px; overflow: hidden; flex-shrink: 0; }
  .nav-btn-custom > * { pointer-events: none; display: block; width: 100%; height: 100%; }

  /* ── NAV BAR POSITION VARIANTS ── */
  .card-root[data-nav-pos="bottom"] { flex-direction: column-reverse; }
  .card-root[data-nav-pos="left"],
  .card-root[data-nav-pos="right"] { flex-direction: row; }
  .card-root[data-nav-pos="right"] { flex-direction: row-reverse; }

  .card-root[data-nav-pos="left"] .nav,
  .card-root[data-nav-pos="right"] .nav {
    flex-direction: column;
    overflow-y: auto; overflow-x: hidden;
    border-bottom: none; border-right: 1px solid var(--border);
    scroll-snap-type: y mandatory;
    width: auto; height: 100%;
  }
  .card-root[data-nav-pos="right"] .nav { border-right: none; border-left: 1px solid var(--border); }

  .card-root[data-nav-pos="left"] .nav-tabs,
  .card-root[data-nav-pos="right"] .nav-tabs { flex-direction: column; flex: none; width: 100%; }

  .card-root[data-nav-pos="left"] .nav-tab,
  .card-root[data-nav-pos="right"] .nav-tab {
    border-right: none; border-bottom: none;
    justify-content: flex-start; padding: 10px 14px;
    border-left: 3px solid transparent; flex: none;
  }
  .card-root[data-nav-pos="right"] .nav-tab { border-left: none; border-right: 3px solid transparent; }

  .card-root[data-nav-pos="left"] .nav-tab.active {
    border-left-color: var(--accent); border-bottom: none;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }
  .card-root[data-nav-pos="right"] .nav-tab.active {
    border-right-color: var(--accent); border-bottom: none;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }
  .card-root[data-nav-pos="left"] .nav-fade-left,
  .card-root[data-nav-pos="left"] .nav-fade-right,
  .card-root[data-nav-pos="right"] .nav-fade-left,
  .card-root[data-nav-pos="right"] .nav-fade-right { display: none; }

  /* ── NAV TABS ALIGNMENT ── */
  .nav-tabs[data-align="center"] { justify-content: center; }
  .nav-tabs[data-align="end"] { justify-content: flex-end; }
  .nav-tabs[data-align="space-between"] { justify-content: space-between; }

  /* ── CONTENT AREA ── */
  /* position:relative + inset:0 on children is the most reliable way to
     give tab panels a definite pixel height without relying on flex cross-axis
     height inheritance, which breaks in certain browser/HA layout combinations */
  .content { flex: 1; min-height: 0; position: relative; overflow: hidden; }
  .tab-panel { display: none; position: absolute; inset: 0; flex-direction: column; overflow: hidden; }
  .tab-panel.active { display: flex; }

  /* ══════════════════════════════════════════
     PLAYER TAB
  ══════════════════════════════════════════ */

  /* Wrapper that holds player-panel + queue side by side (or stacked on mobile) */
  .player-tab-body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column; /* mobile: stacked */
    overflow: hidden;
  }

  .player-panel {
    flex: 1;
    min-height: 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Art section — fills all available space above controls */
  .player-art-section {
    flex: 1;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 16px 8px;
    overflow: hidden;
  }

  /* Controls section — pinned to bottom, never scrolls away */
  .player-controls-section {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 8px 16px 16px;
  }

  /* Album art */
  .art-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    max-width: 100%;
  }
  .art {
    height: 100%;
    width: auto;
    aspect-ratio: 1;
    max-width: 100%;
    border-radius: 12px;
    object-fit: cover;
    background: var(--bg2);
    box-shadow: 0 8px 40px rgba(0,0,0,.5);
  }
  .art-placeholder {
    height: 100%;
    width: auto;
    aspect-ratio: 1;
    max-width: 100%;
    border-radius: 12px;
    background: var(--bg2);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .art-placeholder svg { width: 72px; height: 72px; fill: var(--text2); opacity: .5; }

  /* Track info */
  .track-info { text-align: center; }
  .track-title {
    font-size: 18px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .track-artist {
    font-size: 14px;
    color: var(--text2);
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .goto-artist-btn {
    display: inline-flex; align-items: center; gap: 4px;
    margin-top: 8px; padding: 4px 12px; border-radius: 14px;
    border: 1px solid var(--border); background: transparent;
    color: var(--text2); font-size: 12px; font-weight: 600; cursor: pointer;
  }
  .goto-artist-btn svg { width: 14px; height: 14px; fill: currentColor; }
  .goto-artist-btn:hover { border-color: var(--accent); color: var(--accent); }
  .goto-artist-btn:disabled { opacity: .5; cursor: progress; }

  /* Progress */
  .progress-wrapper { display: flex; flex-direction: column; gap: 6px; }
  .progress-bar-container {
    position: relative;
    height: 6px;
    background: var(--border);
    border-radius: 3px;
    cursor: pointer;
    padding: 8px 0;
    background-clip: content-box;
  }
  .progress-bar-fill {
    height: 6px;
    border-radius: 3px;
    background: var(--accent);
    pointer-events: none;
    transition: width .5s linear;
    margin-top: 8px;
  }
  .progress-bar-container:hover .progress-bar-fill { background: var(--accent); }
  .progress-times {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text2);
  }

  /* Controls */
  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
  }
  .ctrl-btn {
    width: var(--control-size);
    height: var(--control-size);
    border: none;
    background: none;
    color: var(--text2);
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color .15s, background .15s, transform .1s;
    -webkit-tap-highlight-color: transparent;
  }
  .ctrl-btn svg { width: 26px; height: 26px; fill: currentColor; }
  .ctrl-btn:hover { color: var(--text); background: rgba(255,255,255,0.1); }
  .ctrl-btn:active { transform: scale(.9); }
  .ctrl-btn.active { color: var(--accent); }
  /* Prev / Next — slightly larger than secondary controls */
  .ctrl-btn.ctrl-nav { width: 58px; height: 58px; }
  .ctrl-btn.ctrl-nav svg { width: 30px; height: 30px; }
  .ctrl-btn.primary {
    width: 70px;
    height: 70px;
    background: var(--accent);
    color: #000;
    box-shadow: 0 4px 16px rgba(0,0,0,.35);
  }
  .ctrl-btn.primary svg { width: 36px; height: 36px; }
  .ctrl-btn.primary:hover { filter: brightness(1.1); }

  /* Volume */
  .volume-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .volume-row .ctrl-btn { width: 42px; height: 42px; flex-shrink: 0; }
  .volume-row .ctrl-btn svg { width: 22px; height: 22px; }
  input[type=range] {
    flex: 1;
    -webkit-appearance: none;
    height: 6px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--text) 30%, transparent);
    outline: none;
    cursor: pointer;
    touch-action: none;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
  }
  input[type=range]::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--accent);
    border: none;
    cursor: pointer;
  }

  /* Device picker */
  .device-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg2);
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid var(--border);
    transition: background .15s;
  }
  .device-row:hover { background: color-mix(in srgb, var(--bg2) 80%, white 20%); }
  .device-row svg { width: 18px; height: 18px; fill: var(--text2); flex-shrink: 0; }
  .device-icon { display: flex; flex-shrink: 0; }
  .device-icon ha-icon { --mdc-icon-size: 18px; color: var(--accent); }
  .device-name { flex: 1; font-size: 13px; color: var(--text); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .device-switch-btn {
    display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%;
    background: color-mix(in srgb, var(--accent) 16%, transparent); flex-shrink: 0;
  }
  .device-switch-btn svg { width: 18px; height: 18px; fill: var(--accent); }


  /* Modals (settings) */
  .modal-overlay {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,.6);
    z-index: 100;
    align-items: flex-end;
    justify-content: center;
    border-radius: var(--radius);
  }
  .modal-overlay.open { display: flex; }
  .modal-sheet {
    width: 100%;
    background: var(--bg2);
    border-radius: var(--radius) var(--radius) 0 0;
    padding: 16px;
    max-height: 60%;
    overflow-y: auto;
  }
  .modal-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text2);
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .modal-title button { background: none; border: none; cursor: pointer; color: var(--text2); }
  .modal-title button svg { width: 18px; height: 18px; fill: currentColor; display: block; }
  /* Output panel (switch / group / control) — over the player's art + controls */
  .player-panel { position: relative; }
  .out-panel {
    position: absolute; inset: 0; z-index: 50;
    display: flex; flex-direction: column;
    background: var(--bg);
    overflow: hidden;
  }
  .out-panel[hidden] { display: none; }
  .out-panel-floating { z-index: 100; border-radius: var(--radius); }
  .out-head { display: flex; align-items: center; gap: 8px; padding: 12px 12px 6px; flex-shrink: 0; }
  .out-modes {
    flex: 1; display: flex; gap: 2px; padding: 3px; border-radius: 10px;
    background: var(--bg2); border: 1px solid var(--border);
  }
  .out-mode {
    flex: 1; padding: 7px 6px; border: none; border-radius: 8px; cursor: pointer;
    background: transparent; color: var(--text2); font-size: 13px; font-weight: 600;
  }
  .out-mode.active { background: var(--accent); color: var(--text-primary-on-accent, #fff); }
  .out-close { background: none; border: none; cursor: pointer; color: var(--text2); padding: 6px; border-radius: 50%; }
  .out-close svg { width: 20px; height: 20px; fill: currentColor; display: block; }
  .out-hint { font-size: 12px; color: var(--text2); padding: 0 16px 6px; flex-shrink: 0; }
  .out-body { flex: 1; min-height: 0; overflow-y: auto; padding: 0 12px 12px; }
  .out-section-title {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
    color: var(--text2); opacity: .75; padding: 12px 4px 6px;
  }
  .out-empty { font-size: 13px; color: var(--text2); padding: 8px 4px; }
  .out-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 8px; }
  .out-tile {
    position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 12px 8px 10px; border-radius: 12px; cursor: pointer; text-align: center;
    background: var(--bg2); border: 2px solid var(--border);
    transition: border-color .15s, background .15s, opacity .15s;
    -webkit-tap-highlight-color: transparent;
  }
  .out-tile:hover { background: color-mix(in srgb, var(--bg2) 85%, var(--text) 15%); }
  .out-tile.sel { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, var(--bg2)); }
  .out-tile.disabled { opacity: .4; cursor: not-allowed; }
  .out-tile.off .out-tile-icon { opacity: .55; }
  .out-tile-icon { position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
  .out-tile-icon ha-icon { --mdc-icon-size: 34px; color: var(--text); }
  .out-tile.sel .out-tile-icon ha-icon, .out-tile.playing .out-tile-icon ha-icon { color: var(--accent); }
  .out-tile-name {
    width: 100%; font-size: 13px; font-weight: 600; line-height: 1.25; color: var(--text);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    word-break: break-word;
  }
  .out-tile-sub {
    width: 100%; font-size: 11px; color: var(--text2);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .out-check {
    position: absolute; top: 6px; left: 6px; width: 18px; height: 18px; border-radius: 50%;
    background: var(--accent); display: flex; align-items: center; justify-content: center;
  }
  .out-check svg { width: 13px; height: 13px; fill: var(--text-primary-on-accent, #fff); }
  .out-crown { position: absolute; top: -4px; right: -6px; }
  .out-crown svg { width: 16px; height: 16px; fill: #f5b301; }
  .out-eq { position: absolute; bottom: 0; right: -4px; display: flex; align-items: flex-end; gap: 1px; height: 12px; }
  .out-eq i { width: 3px; background: var(--accent); border-radius: 1px; animation: out-eq 1s ease-in-out infinite; }
  .out-eq i:nth-child(2) { animation-delay: .2s; }
  .out-eq i:nth-child(3) { animation-delay: .4s; }
  @keyframes out-eq { 0%, 100% { height: 3px; } 50% { height: 12px; } }
  .out-info, .out-power, .out-pin {
    position: absolute; width: 24px; height: 24px; padding: 0; border: none; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    background: color-mix(in srgb, var(--text) 12%, transparent); color: var(--text2);
  }
  .out-info[hidden] { display: none; }
  .out-info { top: 6px; right: 6px; }
  .out-power { bottom: 6px; right: 6px; color: var(--accent); }
  .out-tile .out-pin { top: 6px; left: 6px; opacity: .6; }
  .out-tile.sel .out-pin { left: auto; right: 34px; }
  .out-pin.on { opacity: 1; color: var(--accent); background: color-mix(in srgb, var(--accent) 20%, transparent); }
  .out-info svg, .out-power svg, .out-pin svg { width: 14px; height: 14px; fill: currentColor; }
  .out-info-pop {
    position: absolute; z-index: 5; padding: 10px 12px; border-radius: 10px;
    background: var(--bg2); border: 1px solid var(--border); box-shadow: 0 6px 24px rgba(0,0,0,.35);
    font-size: 12px; color: var(--text2);
  }
  .out-info-pop[hidden] { display: none; }
  .out-info-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 6px; word-break: break-word; }
  .out-info-row { display: flex; justify-content: space-between; gap: 10px; padding: 2px 0; }
  .out-info-row span:last-child { color: var(--text); text-align: right; word-break: break-all; }
  .out-source {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px;
    background: color-mix(in srgb, var(--accent) 10%, var(--bg2)); border: 1px solid var(--border);
  }
  .out-source-icons { display: flex; }
  .out-source-icons ha-icon { --mdc-icon-size: 26px; color: var(--accent); margin-right: -6px; }
  .out-source-text { flex: 1; min-width: 0; }
  .out-source-names { font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .out-source-np { font-size: 12px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .out-presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .out-chip {
    display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 16px; cursor: pointer;
    background: var(--bg2); border: 1px solid var(--border); font-size: 12px; font-weight: 600;
  }
  .out-chip svg { width: 14px; height: 14px; fill: #f5b301; }
  .out-chip-del { background: none; border: none; padding: 0 0 0 2px; cursor: pointer; display: flex; }
  .out-chip-del svg { width: 13px; height: 13px; fill: var(--text2); }
  .out-link { background: none; border: none; color: var(--accent); font-size: 12px; cursor: pointer; padding: 10px 4px 0; }
  .out-volumes { display: flex; flex-direction: column; gap: 4px; }
  .out-vol-row { display: grid; grid-template-columns: minmax(70px, 30%) 28px 1fr 36px; align-items: center; gap: 6px; }
  .out-vol-row.group .out-vol-name { font-weight: 700; color: var(--text); }
  .out-vol-name { font-size: 12px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .out-vol-icon, .out-mute { display: flex; align-items: center; justify-content: center; background: none; border: none; color: var(--text2); cursor: pointer; padding: 0; }
  .out-mute.on { color: var(--accent); }
  .out-vol-icon svg, .out-mute svg { width: 18px; height: 18px; fill: currentColor; }
  .out-vol-row input[type=range] {
    width: 100%; -webkit-appearance: none; height: 4px; border-radius: 2px;
    background: color-mix(in srgb, var(--text) 25%, transparent); outline: none; cursor: pointer; touch-action: none;
  }
  .out-vol-row input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--accent); }
  .out-vol-row input[type=range]::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: var(--accent); border: none; }
  .out-vol-pct { font-size: 11px; color: var(--text2); text-align: right; }
  .out-sessions { display: flex; flex-direction: column; gap: 6px; }
  .out-session {
    position: relative; display: flex; align-items: center; gap: 10px; padding: 8px 40px 8px 8px; border-radius: 12px;
    background: var(--bg2); border: 2px solid var(--border); cursor: pointer;
  }
  .out-session.active { border-color: var(--accent); }
  .out-session-art { width: 44px; height: 44px; border-radius: 8px; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--text) 8%, transparent); }
  .out-session-art img { width: 100%; height: 100%; object-fit: cover; }
  .out-session-art ha-icon { --mdc-icon-size: 26px; color: var(--accent); }
  .out-session-text { flex: 1; min-width: 0; }
  .out-session-names { font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .out-session-np { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text2); min-width: 0; }
  .out-session-np svg { width: 14px; height: 14px; fill: currentColor; flex-shrink: 0; }
  .out-session-np span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .out-session .out-pin { top: 50%; right: 8px; transform: translateY(-50%); }
  .out-foot { display: flex; gap: 8px; padding: 10px 12px 12px; border-top: 1px solid var(--border); flex-shrink: 0; }
  .out-primary, .out-secondary {
    flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 12px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
  }
  .out-primary { background: var(--accent); color: var(--text-primary-on-accent, #fff); border: none; }
  .out-secondary { background: var(--bg2); color: var(--text); border: 1px solid var(--border); }
  .out-secondary.danger { color: #ff6b6b; }
  .out-secondary svg { width: 16px; height: 16px; fill: #f5b301; }
  .out-primary:disabled, .out-secondary:disabled { opacity: .45; cursor: default; }
  .out-preset-input {
    flex: 2; min-width: 0; padding: 9px 10px; border-radius: 10px; font-size: 13px;
    background: var(--bg2); color: var(--text); border: 1px solid var(--border);
  }

  /* ══════════════════════════════════════════
     SEARCH TAB
  ══════════════════════════════════════════ */
  .search-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .search-bar-wrapper {
    padding: 12px 16px;
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .search-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg);
    border-radius: 8px;
    padding: 8px 12px;
    border: 1px solid var(--border);
  }
  .search-input-row svg { width: 18px; height: 18px; fill: var(--text2); flex-shrink: 0; }
  .search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font-size: 14px;
  }
  .search-input::placeholder { color: var(--text2); }

  .filter-chips {
    display: flex;
    gap: 6px;
    padding: 10px 16px;
    overflow-x: auto;
    flex-shrink: 0;
    border-bottom: 1px solid var(--border);
    scrollbar-width: none;
  }
  .filter-chips::-webkit-scrollbar { display: none; }
  .chip {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    border: 1px solid var(--border);
    background: none;
    color: var(--text2);
    transition: all .15s;
  }
  .chip.active {
    background: var(--accent);
    color: #000;
    border-color: var(--accent);
    font-weight: 600;
  }
  .chip:not(.active):hover { border-color: var(--text2); color: var(--text); }

  .results-container { flex: 1; overflow-y: auto; padding: 8px 0; }

  .result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    cursor: pointer;
    transition: background .15s;
  }
  .result-item:hover { background: rgba(255,255,255,.04); }
  .result-thumb {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    object-fit: cover;
    background: var(--bg2);
    flex-shrink: 0;
  }
  .result-thumb-placeholder {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    background: var(--bg2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .result-thumb-placeholder svg { width: 22px; height: 22px; fill: var(--text2); }
  .result-info { flex: 1; min-width: 0; }
  .result-title { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .result-sub { font-size: 12px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .result-play {
    width: 32px; height: 32px; border: none; background: none; cursor: pointer;
    color: var(--text2); border-radius: 50%; display: flex; align-items: center; justify-content: center;
    transition: color .15s, background .15s;
  }
  .result-play:hover { color: var(--accent); background: rgba(255,255,255,.06); }
  .result-play svg { width: 18px; height: 18px; fill: currentColor; }

  /* ── Browse mode ── */
  .browse-mode-toggle {
    display: flex;
    gap: 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .browse-mode-btn {
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 500;
    background: none;
    color: var(--text2);
    border: none;
    cursor: pointer;
    transition: background .15s, color .15s;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }
  .browse-mode-btn:not(:last-child) { border-right: 1px solid var(--border); }
  .browse-mode-btn:hover { background: rgba(255,255,255,.06); }
  .browse-mode-btn.active { background: var(--accent); color: #000; }

  .browse-breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
    padding: 8px 16px 4px;
    font-size: 12px;
    color: var(--text2);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .browse-crumb {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background .15s;
    -webkit-tap-highlight-color: transparent;
  }
  .browse-crumb:hover { background: rgba(255,255,255,.06); }
  .browse-crumb.current { color: var(--text); cursor: default; }
  .browse-crumb.current:hover { background: none; }
  .browse-sep { color: var(--text2); opacity: .5; user-select: none; }

  .browse-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    cursor: pointer;
    transition: background .15s;
    border-bottom: 1px solid rgba(255,255,255,.04);
  }
  .browse-item:hover { background: rgba(255,255,255,.04); }
  .browse-item-icon {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg2);
  }
  .browse-item-icon img { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; }
  .browse-item-icon svg { width: 20px; height: 20px; fill: var(--text2); }
  .browse-item-icon.folder svg { fill: var(--accent); opacity: .8; }
  .browse-item-info { flex: 1; min-width: 0; }
  .browse-item-name { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .browse-item-sub { font-size: 12px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
  .browse-item-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
  .browse-play-btn {
    width: 32px; height: 32px; border: none; background: none; cursor: pointer;
    color: var(--text2); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: color .15s, background .15s;
    -webkit-tap-highlight-color: transparent;
  }
  .browse-play-btn:hover { color: var(--accent); background: rgba(255,255,255,.06); }
  .browse-play-btn svg { width: 18px; height: 18px; fill: currentColor; }
  .browse-chevron { color: var(--text2); opacity: .4; display: flex; align-items: center; }
  .browse-chevron svg { width: 16px; height: 16px; fill: currentColor; }

  .search-section { margin-bottom: 4px; }
  .search-section-title {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--text2);
    padding: 12px 16px 6px;
  }
  .search-section-title-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 8px; padding-right: 16px;
  }
  .search-section-title-row .search-section-title { padding-right: 0; }
  .search-subsection { margin-bottom: 8px; }
  .search-section-subtitle {
    font-size: 12px;
    font-weight: 600;
    color: var(--text2);
    opacity: .8;
    padding: 4px 16px;
  }
  .artist-sort-toggles { display: flex; gap: 6px; }
  .artist-sort-btn {
    display: flex; align-items: center; gap: 3px;
    padding: 4px 10px; border-radius: 14px;
    border: 1px solid var(--divider, rgba(127,127,127,.3));
    background: transparent; color: var(--text2);
    font-size: 11px; font-weight: 600; cursor: pointer;
    text-transform: none; letter-spacing: normal;
  }
  .artist-sort-btn.active {
    border-color: var(--accent); color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }
  .artist-sort-btn.active[data-dir="asc"]::after { content: "\\2191"; }
  .artist-sort-btn.active[data-dir="desc"]::after { content: "\\2193"; }

  .search-card {
    flex-shrink: 0;
    width: 110px;
    cursor: pointer;
    border-radius: 8px;
    padding: 8px;
    transition: background .15s;
    text-align: center;
  }
  .search-card:hover { background: rgba(255,255,255,.05); }
  .search-card-art {
    width: 94px;
    height: 94px;
    border-radius: 6px;
    object-fit: cover;
    background: var(--bg2);
    display: block;
    margin: 0 auto 6px;
  }
  .search-card-art-placeholder {
    width: 94px;
    height: 94px;
    border-radius: 6px;
    background: var(--bg2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 6px;
  }
  .search-card-art-placeholder svg { width: 36px; height: 36px; fill: var(--text2); }
  .search-card-art.round { border-radius: 50%; }
  .search-card-art-placeholder.round { border-radius: 50%; }
  .search-card-name {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .search-card-sub {
    font-size: 11px;
    color: var(--text2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }

  .search-columns {
    display: flex;
    gap: 0;
    height: 100%;
  }
  .search-column {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    border-right: 1px solid var(--border);
  }
  .search-column:last-child { border-right: none; }
  @media (max-width: 639px) {
    .search-columns { flex-direction: column; height: auto; }
    .search-column { border-right: none; border-bottom: 1px solid var(--border); overflow-y: visible; }
    .search-column:last-child { border-bottom: none; }
  }

  .section-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--text2);
    padding: 12px 16px 4px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 16px;
    color: var(--text2);
    text-align: center;
  }
  .empty-state svg { width: 48px; height: 48px; fill: currentColor; opacity: .3; }
  .empty-state p { font-size: 14px; }

  /* ══════════════════════════════════════════
     LIBRARY TAB
  ══════════════════════════════════════════ */
  .library-panel { flex: 1; overflow: hidden; padding: 0 0 16px; display: flex; flex-direction: column; }

  .lib-filters {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px 6px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }
  .lib-filter-group {
    display: flex;
    gap: 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .lib-filter-btn {
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 500;
    background: none;
    color: var(--text2);
    border: none;
    cursor: pointer;
    transition: background .15s, color .15s;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }
  .lib-filter-btn:not(:last-child) { border-right: 1px solid var(--border); }
  .lib-filter-btn:hover { background: rgba(255,255,255,.06); }
  .lib-filter-btn.active { background: var(--accent); color: #000; }

  .lib-content { flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; }

  .lib-section { margin-bottom: 8px; }
  .lib-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 8px;
  }
  .lib-section-title { font-size: 16px; font-weight: 700; }
  .lib-see-all { font-size: 12px; color: var(--accent); cursor: pointer; background: none; border: none; }
  .lib-see-all:hover { text-decoration: underline; }

  /* ── Lanes layout (horizontal scroll) ── */
  .lib-scroll {
    display: flex;
    gap: 12px;
    padding: 0 16px 4px;
    overflow-x: auto;
    scrollbar-width: none;
    position: relative;
  }
  .lib-scroll.scroll-locked { overflow-x: hidden !important; }
  .lib-scroll::-webkit-scrollbar { display: none; }
  @media (hover: hover) and (pointer: fine) {
    .lib-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.2) transparent; }
    .lib-scroll::-webkit-scrollbar { display: block; height: 6px; }
    .lib-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.2); border-radius: 3px; }
    .lib-scroll::-webkit-scrollbar-track { background: transparent; }
  }
  .lib-sentinel { flex-shrink: 0; width: 1px; height: 1px; pointer-events: none; }
  .lib-sentinel-v { height: 1px; pointer-events: none; }

  /* Lane arrows (desktop only) */
  .lib-lane-wrap { position: relative; }
  .lib-lane-arrow {
    display: none;
    position: absolute;
    top: 0;
    bottom: 6px;
    width: 36px;
    z-index: 2;
    border: none;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    color: var(--text);
    opacity: 0;
    transition: opacity .2s;
  }
  .lib-lane-arrow svg { width: 20px; height: 20px; fill: currentColor; filter: drop-shadow(0 0 4px rgba(0,0,0,.6)); }
  .lib-lane-arrow.left { left: 0; background: linear-gradient(to right, var(--bg1) 30%, transparent); padding-left: 4px; }
  .lib-lane-arrow.right { right: 0; background: linear-gradient(to left, var(--bg1) 30%, transparent); padding-right: 4px; }
  @media (hover: hover) and (pointer: fine) {
    .lib-lane-arrow { display: flex; }
    .lib-lane-wrap:hover .lib-lane-arrow.visible { opacity: 1; }
  }

  .lib-card {
    flex-shrink: 0;
    width: 120px;
    cursor: pointer;
    transition: transform .15s;
  }
  .lib-card:hover { transform: translateY(-2px); }
  .lib-card-art {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    object-fit: cover;
    background: var(--bg2);
    display: block;
  }
  .lib-card-art-placeholder {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    background: var(--bg2);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .lib-card-art-placeholder svg { width: 40px; height: 40px; fill: var(--text2); opacity: .4; }
  .lib-card-name {
    font-size: 12px;
    font-weight: 500;
    margin-top: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .lib-card-sub { font-size: 11px; color: var(--text2); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* ── Grid layout ── */
  .lib-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px 12px;
    padding: 0 16px 4px;
  }
  .lib-grid .lib-card { width: auto; flex-shrink: unset; }
  .lib-grid .lib-card-art { width: 100%; height: auto; aspect-ratio: 1; }
  .lib-grid .lib-card-art-placeholder { width: 100%; height: auto; aspect-ratio: 1; }

  /* ── Columns layout ── */
  .lib-content.lib-layout-columns { overflow-y: hidden; }
  .lib-columns-wrap {
    display: flex;
    flex: 1;
    min-height: 0;
    height: 100%;
    overflow: hidden;
  }
  .lib-columns-wrap > .lib-column {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    border-right: 1px solid var(--border);
  }
  .lib-columns-wrap > .lib-column:last-child { border-right: none; }
  .lib-column .lib-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  @media (max-width: 639px) {
    .lib-columns-wrap { flex-direction: column; }
    .lib-columns-wrap > .lib-column {
      border-right: none;
      border-bottom: 1px solid var(--border);
      overflow-y: visible;
    }
    .lib-columns-wrap > .lib-column:last-child { border-bottom: none; }
  }


  /* List style for tracks */
  .lib-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    cursor: pointer;
    transition: background .15s;
  }
  .lib-list-item:hover { background: rgba(255,255,255,.04); }
  .lib-list-thumb { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; background: var(--bg2); flex-shrink: 0; }
  .lib-list-thumb-placeholder { width: 40px; height: 40px; border-radius: 4px; background: var(--bg2); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .lib-list-thumb-placeholder svg { width: 20px; height: 20px; fill: var(--text2); opacity: .4; }
  .lib-list-info { flex: 1; min-width: 0; }
  .lib-list-title { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lib-list-sub { font-size: 12px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* ══════════════════════════════════════════
     PLAYLIST TAB
  ══════════════════════════════════════════ */
  .playlist-tab-body { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
  .playlist-header {
    display: flex; align-items: center; gap: 12px;
    padding: 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .playlist-header-art { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: var(--bg2); }
  .playlist-header-art-placeholder {
    width: 52px; height: 52px; border-radius: 8px; background: var(--bg2);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .playlist-header-art-placeholder svg { width: 26px; height: 26px; fill: var(--text2); opacity: .5; }
  .playlist-header-info { flex: 1; min-width: 0; }
  .playlist-header-name { font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .playlist-play-all { width: 44px; height: 44px; background: var(--accent); color: #000; flex-shrink: 0; }
  .playlist-play-all svg { width: 22px; height: 22px; }
  .playlist-play-all:hover { background: var(--accent); filter: brightness(1.1); }
  .playlist-view-toggle { width: 40px; height: 40px; flex-shrink: 0; }
  .playlist-track-list { flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; }

  /* Mini player bar — minimal transport controls pinned under a playlist's track list.
     No album art / large title, by design: the tab itself stays the focus. */
  .mini-player-bar {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 16px 10px;
    border-top: 1px solid var(--border);
    background: var(--bg2);
  }
  .mini-player-info {
    display: flex; align-items: baseline; gap: 6px; font-size: 12px;
    white-space: nowrap; overflow: hidden;
  }
  .mini-player-title { font-weight: 600; overflow: hidden; text-overflow: ellipsis; }
  .mini-player-artist { color: var(--text2); overflow: hidden; text-overflow: ellipsis; flex-shrink: 2; }
  .mini-player-progress { display: flex; flex-direction: column; gap: 6px; }
  .mini-player-progress .progress-bar-container { height: 4px; padding: 6px 0; }
  .mini-player-progress .progress-bar-fill { height: 4px; margin-top: 6px; }
  .mini-player-progress .progress-times { font-size: 10px; }
  .mini-player-controls { gap: 4px; }
  .mini-player-controls .ctrl-btn.ctrl-nav { width: 38px; height: 38px; }
  .mini-player-controls .ctrl-btn.ctrl-nav svg { width: 20px; height: 20px; }
  .mini-player-controls .ctrl-btn.primary { width: 44px; height: 44px; box-shadow: none; }
  .mini-player-controls .ctrl-btn.primary svg { width: 22px; height: 22px; }

  /* ── LOADING / ERROR ── */
  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: var(--text2);
    font-size: 14px;
    gap: 10px;
  }
  .spinner {
    width: 20px; height: 20px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin .8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ═══════════════════════════════════════════
     RESPONSIVE LAYOUT — TABLET (≥640px)
  ═══════════════════════════════════════════ */
  /* ── Artist page ── */
  .artist-page-panel { display: flex; flex-direction: column; overflow-y: auto; flex: 1; }
  .artist-page-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .back-btn { background: none; border: 1px solid var(--border); border-radius: 20px; color: var(--text); font-size: 13px; padding: 4px 12px; cursor: pointer; flex-shrink: 0; }
  .back-btn:hover { background: rgba(255,255,255,.06); }
  .artist-page-name { font-size: 18px; font-weight: 700; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .artist-hero-art { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
  .artist-hero-art-placeholder { width: 52px; height: 52px; border-radius: 50%; background: var(--bg2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .artist-hero-art-placeholder svg { width: 28px; height: 28px; fill: var(--text2); }
  .artist-page-sections { overflow-y: auto; flex: 1; }

  /* ── Queue (Up Next) — visual styles only, layout via media queries below ── */
  .queue-section { overflow-y: auto; min-height: 0; min-width: 0; }

  /* ═══════════════════════════════════════════
     RESPONSIVE LAYOUT — MOBILE (<640px)
  ═══════════════════════════════════════════ */
  @media (max-width: 639px) {
    .queue-section { border-top: 1px solid var(--border); flex: 0 0 180px; }
  }

  /* ═══════════════════════════════════════════
     RESPONSIVE LAYOUT — TABLET (≥640px)
  ═══════════════════════════════════════════ */
  @media (max-width: 479px) {
    .nav-tab { flex-direction: column; gap: 3px; padding: 8px 4px; font-size: 11px; }
  }

  @media (min-width: 640px) {
    .player-panel { flex: 2; min-width: 0; }
    .player-art-section { padding: 20px 24px 8px; }
    .player-controls-section { padding: 8px 24px 20px; }
    .track-title { font-size: 20px; }
    .nav-tab span { display: inline; }
    .player-tab-body { flex-direction: row; }
    /* Queue: 1/3 width alongside player (2/3), fills full height, scrollable */
    .queue-section { flex: 1; border-left: 1px solid var(--border); }
  }

  /* ═══════════════════════════════════════════
     RESPONSIVE LAYOUT — DESKTOP (≥1024px)
  ═══════════════════════════════════════════ */
  @media (min-width: 1024px) {
    .track-title { font-size: 22px; }
    .modal-sheet { max-height: 80%; }
  }
  .queue-header { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--text2); padding: 10px 16px 4px; display: flex; align-items: center; justify-content: space-between; }
  .queue-header-label { flex: 1; }
  .queue-item { display: flex; align-items: center; gap: 10px; padding: 8px 16px; cursor: pointer; transition: background .15s; }
  .queue-item:hover { background: rgba(255,255,255,.04); }
  .queue-num { font-size: 12px; color: var(--text2); width: 18px; text-align: right; flex-shrink: 0; }
  .queue-info { flex: 1; min-width: 0; }
  .queue-title { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .queue-sub { font-size: 11px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
  .queue-dur { font-size: 11px; color: var(--text2); flex-shrink: 0; }
  .queue-remove { background: none; border: none; cursor: pointer; padding: 4px; color: var(--text2); opacity: .6; flex-shrink: 0; display: flex; align-items: center; }
  .queue-remove:active { opacity: 1; }
  .queue-remove svg { width: 16px; height: 16px; fill: currentColor; }
  .queue-empty { font-size: 12px; color: var(--text2); padding: 16px; text-align: center; opacity: .6; }

  /* Queue toggle button (burger icon) */
  .queue-toggle-btn { background: none; border: none; cursor: pointer; color: var(--text2); padding: 4px; display: flex; align-items: center; opacity: .7; transition: opacity .15s; position: absolute; right: 0; }
  .queue-toggle-btn:active { opacity: 1; }
  .queue-toggle-btn svg { width: 30px; height: 30px; fill: currentColor; }
  .queue-toggle-btn.active { opacity: 1; color: var(--accent); }

  /* Add-to-queue button on items */
  .add-queue-btn { background: none; border: none; cursor: pointer; padding: 4px; color: var(--text2); flex-shrink: 0; display: flex; align-items: center; opacity: .6; position: relative; }
  .add-queue-btn:active { opacity: 1; }
  .add-queue-btn svg { width: 18px; height: 18px; fill: currentColor; }

  /* Add-to-queue dropdown */
  .queue-dropdown { position: absolute; z-index: 1000; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 4px 0; min-width: 200px; box-shadow: 0 4px 16px rgba(0,0,0,.3); }
  .queue-dropdown-item { padding: 8px 14px; font-size: 13px; color: var(--text); cursor: pointer; white-space: nowrap; }
  .queue-dropdown-item:active { background: rgba(255,255,255,.08); }
  .queue-dropdown-mix { border-top: 1px solid var(--border); margin-top: 2px; padding-top: 10px; display: flex; align-items: center; gap: 6px; }
  .queue-dropdown-mix svg { width: 16px; height: 16px; fill: var(--accent); flex-shrink: 0; }

  /* ══════════════════════════════════════════
     SETTINGS MODAL
  ══════════════════════════════════════════ */
  .settings-section-title {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .08em; color: var(--text2); padding: 4px 0 10px; opacity: .65;
  }
  .settings-hint {
    font-size: 12px; color: var(--text2); margin-bottom: 12px; line-height: 1.4; opacity: .7;
  }
  .provider-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .provider-item:last-child { border-bottom: none; }
  .provider-name { font-size: 14px; }
  .toggle-switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
  .toggle-switch input { display: none; }
  .toggle-track {
    position: absolute; inset: 0;
    background: rgba(255,255,255,.15); border-radius: 22px;
    cursor: pointer; transition: background .2s;
  }
  .toggle-track::after {
    content: ""; position: absolute;
    width: 16px; height: 16px; left: 3px; top: 3px;
    background: white; border-radius: 50%;
    transition: transform .2s; box-shadow: 0 1px 3px rgba(0,0,0,.3);
  }
  .toggle-switch input:checked + .toggle-track { background: var(--accent); }
  .toggle-switch input:checked + .toggle-track::after { transform: translateX(18px); }
  .settings-debug-banner {
    display: flex; align-items: flex-start; gap: 10px;
    background: rgba(255, 152, 0, .12); border: 1px solid rgba(255, 152, 0, .35);
    border-radius: 8px; padding: 10px 12px; margin-bottom: 14px;
  }
  .settings-debug-dot {
    width: 10px; height: 10px; min-width: 10px; border-radius: 50%;
    background: #ff9800; margin-top: 3px;
    animation: mml-debug-pulse 1.5s ease-in-out infinite;
  }
  @keyframes mml-debug-pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
  .mml-toast {
    position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
    background: var(--error-color, #b00020); color: #fff;
    padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,.3); z-index: 999;
    opacity: 0; transition: opacity .3s ease;
    pointer-events: none; max-width: 90%; text-align: center;
  }
  .mml-toast.visible { opacity: 1; }

  .mml-connection-banner {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; margin: 0 0 8px 0;
    background: color-mix(in srgb, var(--error-color, #b00020) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--error-color, #b00020) 35%, transparent);
    border-radius: 8px; font-size: 13px;
  }
  .mml-connection-banner[hidden] { display: none; }
  .mml-connection-banner svg {
    width: 20px; height: 20px; min-width: 20px;
    fill: var(--error-color, #b00020);
  }
  .mml-connection-banner-text { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .mml-connection-banner-text strong { font-weight: 600; }
  .mml-connection-banner-text span { opacity: .8; font-size: 12px; }
  .mml-connection-banner-action {
    flex-shrink: 0; padding: 6px 12px; border-radius: 6px;
    background: var(--error-color, #b00020); color: #fff;
    font-size: 12px; font-weight: 600; text-decoration: none;
    white-space: nowrap;
  }

  /* ═══════════════════════════════════════════
     COMPANION MOBILE MODE
  ═══════════════════════════════════════════ */

  /* Queue overlay backdrop */
  .queue-backdrop {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,.55);
    z-index: 49;
  }
  .queue-backdrop.open { display: block; }

  .mml-mobile .player-tab-body { position: relative; }

  /* Enlarged touch targets */
  .mml-mobile .add-queue-btn {
    width: 38px; height: 38px; min-width: 38px; padding: 0;
    opacity: 1;
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    border-radius: 50%;
    justify-content: center;
  }
  .mml-mobile .add-queue-btn:active { background: color-mix(in srgb, var(--accent) 35%, transparent); }
  .mml-mobile .add-queue-btn svg { width: 20px; height: 20px; }
  .mml-mobile .result-play { width: 44px; height: 44px; }
  .mml-mobile .result-play svg { width: 22px; height: 22px; }
  .mml-mobile .queue-remove {
    width: 34px; height: 34px; min-width: 34px; padding: 0;
    opacity: 1;
    background: color-mix(in srgb, var(--text2) 15%, transparent);
    border-radius: 50%;
    justify-content: center;
  }
  .mml-mobile .queue-remove:active { background: color-mix(in srgb, var(--text2) 30%, transparent); }
  .mml-mobile .queue-remove svg { width: 16px; height: 16px; }
  .mml-mobile .queue-dropdown { min-width: 240px; border-radius: 12px; padding: 6px 0; }
  .mml-mobile .queue-dropdown-item { padding: 16px 20px; font-size: 16px; }
  .mml-mobile .browse-mode-btn { padding: 10px 16px; font-size: 13px; }
  .mml-mobile .browse-play-btn { min-width: 44px; min-height: 44px; }

  /* Larger slider thumbs and tracks */
  .mml-mobile input[type=range] { height: 8px; border-radius: 4px; }
  .mml-mobile input[type=range]::-webkit-slider-thumb { width: 28px; height: 28px; }
  .mml-mobile input[type=range]::-moz-range-thumb { width: 28px; height: 28px; }
  .mml-mobile .device-item-volume input[type=range] { height: 6px; }
  .mml-mobile .device-item-volume input[type=range]::-webkit-slider-thumb { width: 22px; height: 22px; }
  .mml-mobile .device-item-volume input[type=range]::-moz-range-thumb { width: 22px; height: 22px; }

  /* Device modal action buttons (attach/detach) */
  .mml-mobile .device-item-action {
    width: 38px; height: 38px; min-width: 38px; padding: 0;
    background: color-mix(in srgb, var(--text2) 15%, transparent);
  }
  .mml-mobile .device-item-action svg { width: 20px; height: 20px; }
  .mml-mobile .device-item-action.attach {
    background: color-mix(in srgb, var(--accent) 18%, transparent);
  }
  .mml-mobile .device-item-action.detach {
    background: color-mix(in srgb, var(--text2) 15%, transparent);
  }

  /* Taller progress bar hit zone */
  .mml-mobile .progress-bar-container { padding: 12px 0; }

  /* More spacious controls */
  .mml-mobile .controls { gap: 4px; }
  .mml-mobile .ctrl-btn { min-width: 44px; min-height: 44px; }
  .mml-mobile .ctrl-btn.ctrl-nav { width: 50px; height: 50px; }
  .mml-mobile .ctrl-btn.primary { width: 62px; height: 62px; }
  .mml-mobile .queue-toggle-btn { position: static; }
  .mml-mobile .volume-row { gap: 14px; }
  .mml-mobile .player-controls-section { gap: 16px; }

  /* Queue as bottom-sheet overlay */
  .mml-mobile .queue-section {
    position: absolute !important;
    bottom: 0; left: 0; right: 0;
    max-height: 70%;
    border-radius: 16px 16px 0 0;
    background: var(--bg);
    border-top: 1px solid var(--border);
    border-left: none !important;
    box-shadow: 0 -4px 24px rgba(0,0,0,.4);
    z-index: 50;
    flex: none !important;
    transform: translateY(100%);
    transition: transform .3s ease;
    overflow-y: auto;
  }
  .mml-mobile .queue-section.mml-queue-open {
    transform: translateY(0);
  }

  /* Queue close button */
  .queue-close-btn {
    background: none; border: none; cursor: pointer; color: var(--text2);
    padding: 8px; display: flex; align-items: center; justify-content: center;
    border-radius: 50%; transition: background .15s;
    -webkit-tap-highlight-color: transparent;
  }
  .queue-close-btn:active { background: rgba(255,255,255,.12); }
  .queue-close-btn svg { width: 20px; height: 20px; fill: currentColor; }

  /* Queue items: larger touch targets */
  .mml-mobile .queue-item { padding: 12px 16px; gap: 12px; }
  .mml-mobile .queue-title { font-size: 14px; }
  .mml-mobile .queue-sub { font-size: 12px; }

  /* Result items: more breathing room */
  .mml-mobile .result-item { padding: 12px 16px; }
  .mml-mobile .browse-item { padding: 12px 16px; }
  .mml-mobile .lib-list-item { padding: 10px 16px; }
`;

/* ─── Helpers ─────────────────────────────────────────────── */
function fmt(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function icon(name) {
  return `<span class="svg-icon">${ICONS[name] || ""}</span>`;
}

function throttle(fn, ms) {
  let last = 0, timer = null, latestArgs = null;
  return (...args) => {
    latestArgs = args;
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      if (timer) { clearTimeout(timer); timer = null; }
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn(...latestArgs);
      }, ms - (now - last));
    }
  };
}

/* ─── Main Card Class ─────────────────────────────────────── */
/* Pure function of `config` — shared by MyMusicLibraryCard (to build its actual
   panels) and MyMusicLibraryCardEditor (to compute the same tab ids so nav
   actions like mml_navigate_tab can target a specific tab unambiguously). */
function _buildResolvedTabs(config) {
  const DEFAULT_SECTIONS = ["artists", "albums", "playlists", "tracks"];
  const VALID_SECTIONS = ["artists", "albums", "playlists", "tracks", "radios", "recently_played", "recently_added", "recommended", "flows"];
  const TAB_ICONS = { player: "player", search: "search", library: "library", playlist: "playlist", settings: "settings", discovery: "sparkle" };

  if (config.tabs && Array.isArray(config.tabs)) {
    let idx = 0;
    const typeCounts = {};
    return config.tabs.map(t => {
      const type = t.type || "button";
      if (type === "custom_element") {
        return { type: "custom_element", id: `ce-${idx++}`, element: t.element || "",
          element_config: t.element_config || {}, name: t.name || "",
          tap_action: t.tap_action, hold_action: t.hold_action, double_tap_action: t.double_tap_action,
          width: t.width, height: t.height };
      }
      if (type === "button") {
        return { type: "button", id: `btn-${idx++}`, icon: t.icon, name: t.name || "", entity: t.entity,
          tap_action: t.tap_action, hold_action: t.hold_action, double_tap_action: t.double_tap_action,
          width: t.width, height: t.height };
      }
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      const id = type === "settings" ? "settings" : (typeCounts[type] > 1 ? `${type}-${typeCounts[type] - 1}` : type);
      const tab = { type, id, label: t.label || null, iconOverride: t.icon || null,
        defaultIcon: TAB_ICONS[type] || null, show_in_nav: t.show_in_nav !== false,
        // Optional: let this panel carry its own custom nav element (button-card etc.)
        // instead of the default icon+label button — see _renderCustomElementSlot.
        element: t.element || null, element_config: t.element_config || null,
        width: t.width, height: t.height };
      if (type === "library") {
        const sections = Array.isArray(t.sections) ? t.sections.filter(s => VALID_SECTIONS.includes(s)) : null;
        tab.sections = sections && sections.length ? sections : DEFAULT_SECTIONS;
        const VALID_LAYOUTS = ["lanes", "grid", "columns", "auto"];
        tab.layout = VALID_LAYOUTS.includes(t.layout) ? t.layout : "lanes";
      }
      if (type === "search") {
        tab.search_layout = t.search_layout === "columns" ? "columns" : "rows";
      }
      if (type === "playlist") {
        tab.playlist_uri = t.playlist_uri || "";
        tab.playlist_label = t.playlist_label || "";
        tab.playlist_thumbnail = t.playlist_thumbnail || "";
      }
      return tab;
    });
  }

  // Backward compatibility: build from legacy config
  const tabs = [];
  if (config.nav_buttons_left) {
    let idx = 0;
    for (const b of config.nav_buttons_left) {
      tabs.push({ type: "button", id: `btn-${idx++}`, icon: b.icon, name: b.name || "", entity: b.entity,
        tap_action: b.tap_action, hold_action: b.hold_action, double_tap_action: b.double_tap_action,
        width: b.width, height: b.height });
    }
  }
  tabs.push({ type: "player", id: "player", label: null, iconOverride: null, defaultIcon: "player" });
  tabs.push({ type: "search", id: "search", label: null, iconOverride: null, defaultIcon: "search", search_layout: "rows" });
  tabs.push({ type: "library", id: "library", label: null, iconOverride: null, defaultIcon: "library",
    sections: DEFAULT_SECTIONS, layout: "lanes" });
  if (config.nav_buttons_right) {
    let idx = (config.nav_buttons_left?.length || 0);
    for (const b of config.nav_buttons_right) {
      tabs.push({ type: "button", id: `btn-${idx++}`, icon: b.icon, name: b.name || "", entity: b.entity,
        tap_action: b.tap_action, hold_action: b.hold_action, double_tap_action: b.double_tap_action,
        width: b.width, height: b.height });
    }
  }
  tabs.push({ type: "settings", id: "settings", label: null, iconOverride: null, defaultIcon: "settings" });
  return tabs;
}

class MyMusicLibraryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
    this._tab = "player";
    this._searchQuery = "";
    this._searchFilter = "all";
    this._searchResults = null;
    this._searchLoading = false;
    this._libData = {};
    this._libLoading = false;
    this._libLoadedTabs = new Set();
    this._plLoadedTabs = new Set();
    this._discoveryLoadedTabs = new Set();
    this._libSections = {}; // type → { offset, loading, exhausted, favorite, iconName }
    this._libTabState = {}; // tabId → { source, fav, browse, browseStack }
    this._maProviders = [];
    this._enabledProviders = (() => {
      try {
        const s = this._loadPref("mml_providers");
        if (!s) return null;
        const set = new Set(JSON.parse(s));
        set.delete("builtin");
        return set.size > 0 ? set : null;
      } catch (_) { return null; }
    })();
    this._searching = false;
    this._searchTimeout = null;
    this._searchId = 0;
    this._players = [];
    this._activePlayer = null;
    this._progressInterval = null;
    this._localPosition = null;
    this._localPositionTime = null;
    this._localPositionKey = null;  // player + track the seek override belongs to
    this._maQueueItems = [];
    this._maQueueId = null;        // MA queue_id of the active player, from the last ma_queue load
    this._queueLoadSeq = 0;        // drops out-of-order ma_queue responses
    this._queuePushUnsub = null;   // unsubscribe fn of my_music_library/subscribe_queue
    this._queuePushActive = false; // true while the backend pushes queue changes
    this._queuePushTimer = null;
    this._lastKnownUri = null;
    this._queueVisible = this._loadPref("mml_queue_visible") !== "false";
    this._outputs = null;          // Map entity_id → MA facts (GET outputs), see _loadOutputs
    this._outputsSeq = 0;
    this._outputsSig = null;
    this._presets = [];            // favorite groups (server-side)
    this._outputPanelOpen = false;
    this._outputMode = "switch";   // switch | group | control
    this._switchSel = new Set();   // switch mode: selected destinations, first = new leader
    this._showOffline = false;
    this._presetEditing = false;
    this._outDragging = false;
    this._excludedPlayers = [];    // entity_ids hidden from the device picker (HA options)
    // Per-tab library filter state is in this._libTabState[tabId]
    this._rendered = false;
    this._isMobile = this._detectMobile();
    // MA config fetched from backend via WebSocket
    this._maUrl = null;       // stored but only used as a last-resort hint
    this._maConfigLoaded = false;
    this._maConnected = true; // assume connected until the config fetch says otherwise
    this._debugMode = false;
  }

  _debugLog(...args) {
    if (this._debugMode) console.debug("[MML]", ...args);
  }

  _detectMobile() {
    const isCompanion = !!window.externalApp || !!window.webkit?.messageHandlers?.getExternalAuth;
    return isCompanion && window.innerWidth < 640;
  }

  /* ── i18n helper ── */
  _t(key) {
    const raw = this._hass?.locale?.language || this._hass?.language || "en";
    const lang = raw.toLowerCase().split("-")[0];
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    const val = key.split(".").reduce((o, k) => o?.[k], dict);
    if (val !== undefined) return val;
    return key.split(".").reduce((o, k) => o?.[k], TRANSLATIONS.en) ?? key;
  }

  /* ── MA Queue (via Music Assistant native queue) ── */

  async _loadMAQueue() {
    if (!this._activePlayer || !this._hass) { this._maQueueItems = []; this._maQueueId = null; this._updateQueueUI(); return; }
    // Loads can overlap (push event + safety timer): only the latest one may update the UI.
    const seq = ++this._queueLoadSeq;
    let items = [];
    let queueId = null;
    try {
      const data = await this._callIntegration("GET", `ma_queue?player=${encodeURIComponent(this._activePlayer)}&limit=100`);
      items = data?.items || [];
      queueId = data?.queue_id || null;
    } catch (_) {
      items = [];
    }
    if (seq !== this._queueLoadSeq) return;
    this._maQueueItems = items;
    this._maQueueId = queueId;
    this._debugLog("MA queue loaded →", items.length, "items, queue:", queueId);
    this._updateQueueUI();
  }

  /* Timed queue reload after an action. With push active (my_music_library/subscribe_queue),
     MA itself tells us when the queue changes, so this only remains as a safety net for a
     lost event; without push (subscription failure) it is the only mechanism. */
  _refreshQueueSoon(delay = 1200) {
    clearTimeout(this._queueRefreshTimer);
    const wait = this._queuePushActive ? Math.max(delay, 4000) : delay;
    this._queueRefreshTimer = setTimeout(() => this._loadMAQueue(), wait);
  }

  /* ── Queue push: MA queue events relayed by the backend ── */

  async _subscribeQueuePush() {
    if (this._queuePushUnsub || this._queuePushSubscribing || !this._hass?.connection) return;
    this._queuePushSubscribing = true;
    try {
      const unsub = await this._hass.connection.subscribeMessage(
        (msg) => this._onQueuePush(msg),
        { type: "my_music_library/subscribe_queue" },
      );
      if (!this.isConnected) {
        // Card left the DOM while subscribing.
        Promise.resolve().then(() => unsub()).catch(() => {});
        return;
      }
      this._queuePushUnsub = unsub;
      this._queuePushActive = true;
      this._debugLog("Queue push: subscribed");
    } catch (err) {
      this._queuePushActive = false;
      this._debugLog("Queue push unavailable, using timed refresh:", err);
    } finally {
      this._queuePushSubscribing = false;
    }
  }

  _unsubscribeQueuePush() {
    const unsub = this._queuePushUnsub;
    this._queuePushUnsub = null;
    this._queuePushActive = false;
    clearTimeout(this._queuePushTimer);
    if (unsub) Promise.resolve().then(() => unsub()).catch(() => {});
  }

  _onQueuePush(msg) {
    if (!this._isActiveQueue(msg?.queue_id)) return;
    // MA often emits several events for one action (items, then current item): coalesce them.
    clearTimeout(this._queuePushTimer);
    this._queuePushTimer = setTimeout(() => {
      clearTimeout(this._queueRefreshTimer);
      this._loadMAQueue();
    }, 100);
  }

  _isActiveQueue(queueId) {
    if (!queueId || !this._activePlayer) return false;
    if (!this._maQueueId || queueId === this._maQueueId) return true;
    // The active queue may have changed (e.g. player joined a group): also accept the player's own id.
    return queueId === this._hass?.states?.[this._activePlayer]?.attributes?.mass_player_id;
  }

  _updateQueueUI() {
    const card = this.shadowRoot?.querySelector(".card-root");
    if (card) this._updateQueueDisplay(card);
  }

  async _callIntegration(method, path, body) {
    this._debugLog(`API ${method} /my_music_library/${path}`, body !== undefined ? body : "");
    const opts = { method };
    if (body !== undefined) {
      opts.headers = { "Content-Type": "application/json" };
      opts.body = JSON.stringify(body);
    }
    const resp = await this._hass.fetchWithAuth(`/my_music_library/${path}`, opts);
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      this._debugLog(`API ${method} /my_music_library/${path} → ${resp.status}:`, text);
      throw new Error(`${resp.status}: ${text}`);
    }
    const data = await resp.json();
    this._debugLog(`API ${method} /my_music_library/${path} → OK`, data);
    return data;
  }

  /* ── Lovelace required ── */
  setConfig(config) {
    this._config = { default_tab: "player", ...config };
    this._resolvedTabs = _buildResolvedTabs(config);
    const firstPanel = this._resolvedTabs.find(t => t.type !== "button");
    const defaultTab = this._config.default_tab || (firstPanel ? firstPanel.id : "player");
    this._tab = defaultTab;
    if (config.height != null && config.height !== "") {
      const h = typeof config.height === "number" ? `${config.height}px` : String(config.height);
      this.style.setProperty("--mml-height", h);
    }
  }

  // Tell Lovelace masonry how many rows to reserve (1 row ≈ 50px)
  getCardSize() {
    const h = this._config?.height;
    if (h && typeof h === "number") return Math.ceil(h / 50);
    if (h && typeof h === "string" && h.endsWith("px")) return Math.ceil(parseInt(h) / 50);
    return 8; // default ~400px
  }

  static getConfigElement() {
    return document.createElement("my-music-library-card-editor");
  }

  static getStubConfig() {
    return { default_tab: "player" };
  }

  set hass(hass) {
    this._hass = hass;

    // Fetch integration config from backend once
    if (!this._maConfigLoaded) {
      this._maConfigLoaded = true;
      this._fetchMaConfig();
    }
    if (!this._queuePushUnsub && this.isConnected) this._subscribeQueuePush();

    this._players = this._getMaPlayers();

    if (this._players.length === 0) {
      this._activePlayer = null;
    } else {
      if (!this._activePlayer || !this._players.find(p => p.entity_id === this._activePlayer)) {
        const saved = this._loadSavedPlayer();
        const pinned = this._loadPref("mml_default_player");
        const prevActive = this._activePlayer;
        const known = (eid) => eid && this._players.find(p => p.entity_id === eid) ? eid : null;
        // Pinned output of this device (output panel, Control mode) wins over the last one used.
        this._activePlayer = known(pinned) || known(saved)
          || this._config.entity
          || (this._players.find(p => p.state === "playing") || this._players[0])?.entity_id;
        this._debugLog("Player selected:", this._activePlayer, "prev:", prevActive, "saved:", saved, "players:", this._players.map(p => p.entity_id));
        if (this._activePlayer && this._activePlayer !== prevActive) {
          this._loadMAQueue();
        }
      }
    }
    this._scheduleOutputsReload();

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    } else {
      this._update();
    }
  }

  connectedCallback() {
    this._startProgressTick();
    if (this._hass) this._subscribeQueuePush();
    // hui-card (HA wrapper) has auto height by default — force it to fill its grid cell
    // so our height:100% resolves to the actual allocated height instead of auto.
    requestAnimationFrame(() => {
      let p = this.parentNode;
      while (p && p.tagName) {
        if (p.tagName.toLowerCase() === "hui-card") {
          p.style.height = "100%";
          p.style.display = "block";
          break;
        }
        p = p.parentNode;
      }
    });
  }

  disconnectedCallback() {
    this._stopProgressTick();
    this._unsubscribeQueuePush();
    // Force config re-fetch on next reconnect so excluded_players stays in sync
    // with any options changes made while the card was away from the DOM.
    this._maConfigLoaded = false;
  }

  /* ── Fetch integration config (ma_entry_id, ma_url) via WebSocket ── */
  async _fetchMaConfig() {
    try {
      const cfg = await this._hass.callWS({ type: "my_music_library/config" });
      this._debugMode = !!cfg?.debug_mode;
      this._debugLog("Config loaded:", JSON.stringify(cfg));
      // Only flip to "disconnected" on an explicit false — a missing/failed
      // fetch (cfg undefined) shouldn't itself trigger the banner.
      this._maConnected = cfg?.connected !== false;
      this._updateConnectionBanner();
      await this._fetchProviders();
      if (cfg?.ma_url) {
        this._maUrl = cfg.ma_url.replace(/\/$/, "");
      }
      if (Array.isArray(cfg?.excluded_players)) {
        this._excludedPlayers = cfg.excluded_players;
        this._players = this._getMaPlayers();
        const card = this.shadowRoot?.querySelector(".card-root");
        if (card) this._updatePlayerContent(card);
      }
    } catch (e) {
      this._debugLog("Config fetch failed:", e);
    }
  }

  async _fetchProviders() {
    try {
      const data = await this._callIntegration("GET", "providers");
      this._maProviders = (data?.providers || []).filter(p => (p.domain || p.instance_id) !== "builtin");
      if (this._enabledProviders !== null && this._maProviders.length > 0) {
        const validKeys = new Set(this._maProviders.flatMap(p => [p.instance_id, p.domain].filter(Boolean)));
        const hasAnyValid = [...this._enabledProviders].some(k => validKeys.has(k));
        if (!hasAnyValid) {
          this._enabledProviders = null;
          this._savePref("mml_providers", "");
        }
      }
      if (this._libLoadedTabs.size > 0) {
        this._libLoadedTabs.clear();
        const activeTabDef = this._resolvedTabs?.find(t => t.id === this._tab);
        if (activeTabDef?.type === "library") this._loadLibrary();
      }
      if (this._discoveryLoadedTabs.size > 0) {
        this._discoveryLoadedTabs.clear();
        const activeTabDef = this._resolvedTabs?.find(t => t.id === this._tab);
        if (activeTabDef?.type === "discovery") this._loadDiscovery(this._tab);
      }
    } catch (_) {
      this._maProviders = [];
    }
  }

  /* ── Return an MA-capable entity for browse/search operations ──
     This is DIFFERENT from _activePlayer (which is the playback target).
     Browse operations (search, library) must go through an MA entity. ── */
  _getBrowseEntity() {
    const players = this._players || [];
    // Prefer: active player if it's an MA player
    if (this._activePlayer) {
      const active = players.find(p => p.entity_id === this._activePlayer);
      if (active?.isMa) return this._activePlayer;
    }
    // Fall back to first detected MA player
    const firstMa = players.find(p => p.isMa);
    if (firstMa) return firstMa.entity_id;
    return null;
  }

  /* ── Get media_player entities (all non-unavailable, MA players first) ── */
  /** Return true if entityId matches a plain ID or a glob pattern (supports *). */
  _isExcluded(entityId) {
    for (const pattern of (this._excludedPlayers || [])) {
      if (!pattern) continue;
      if (pattern.includes("*")) {
        // Glob → regex: escape regex meta-chars except *, then replace * with .*
        const re = new RegExp(
          "^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$"
        );
        // Test against full entity_id AND against the name part (after "media_player.")
        if (re.test(entityId) || re.test(entityId.replace(/^media_player\./, ""))) return true;
      } else {
        if (pattern === entityId) return true;
      }
    }
    return false;
  }

  _getMaPlayers() {
    if (!this._hass) return [];
    // MediaPlayerEntityFeature.GROUPING = 524288 (bit 19)
    const FEATURE_GROUPING = 524288;
    const all = Object.entries(this._hass.states)
      .filter(([id, state]) => id.startsWith("media_player.") && state.state !== "unavailable" && !this._isExcluded(id)
        && !this._config.devices?.[id]?.hidden
        && (this._config.show_other_players || !!state.attributes?.mass_player_id))
      .map(([entity_id, state]) => {
        const attr = state.attributes || {};
        // isMa: used for browse/search operations (requires MA Python client)
        const isMa = typeof attr.mass_player_id === "string" && attr.mass_player_id.length > 0;
        // canJoin: player declares support for media_player.join in HA supported_features
        const canJoin = typeof attr.supported_features === "number"
          && (attr.supported_features & FEATURE_GROUPING) !== 0;
        return {
          entity_id,
          name: attr.friendly_name || entity_id,
          state: state.state,
          attributes: attr,
          isMa,
          canJoin,
        };
      });
    return all
      // MA players first, then alphabetical within each group
      .sort((a, b) => {
        if (a.isMa !== b.isMa) return a.isMa ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }

  _getActiveState() {
    if (!this._hass || !this._activePlayer) return null;
    return this._hass.states[this._activePlayer] || null;
  }

  /* ── Render full card ── */
  _render() {
    const root = this.shadowRoot;
    root.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = STYLES;
    root.appendChild(style);

    this._isMobile = this._detectMobile();

    const card = document.createElement("div");
    card.className = `card-root${this._isMobile ? " mml-mobile" : ""}`;
    const navPos = this._config.nav_bar?.position || "top";
    if (navPos !== "top") card.dataset.navPos = navPos;

    const panels = this._resolvedTabs.filter(t => t.type !== "button" && t.type !== "custom_element");
    const panelRenderers = {
      player: (t) => this._renderPlayerTab(),
      search: (t) => this._renderSearchTab(),
      library: (t) => this._renderLibraryTab(t),
      playlist: (t) => this._renderPlaylistTab(t),
      discovery: (t) => this._renderDiscoveryTab(t),
    };

    card.innerHTML = `
      <div class="mml-connection-banner" id="mml-connection-banner" hidden>
        ${ICONS.warning}
        <div class="mml-connection-banner-text">
          <strong>${this._t("connection.title")}</strong>
          <span>${this._t("connection.desc")}</span>
        </div>
        <a class="mml-connection-banner-action" href="/config/integrations/integration/my_music_library">${this._t("connection.action")}</a>
      </div>
      ${this._renderNav()}
      <div class="content">
        ${panels.map(t => panelRenderers[t.type] ? panelRenderers[t.type](t) : "").join("")}
      </div>
      ${panels.some(t => t.type === "player") ? "" : '<div class="out-panel out-panel-floating" id="out-panel" hidden></div>'}
      ${this._renderSettingsModal()}
      <div class="mml-toast" id="mml-toast"></div>
    `;
    root.appendChild(card);
    this._updateConnectionBanner(card);

    if (!this._imgErrorBound) {
      this._imgErrorBound = true;
      root.addEventListener("error", (e) => {
        const img = e.target;
        if (!(img instanceof HTMLImageElement) || img.classList.contains("art")) return;
        const classes = img.className.split(" ").filter(Boolean);
        const primary = classes[0] || "result-thumb";
        const isRound = classes.includes("round");
        const ph = document.createElement("div");
        ph.className = [primary + "-placeholder", ...classes.slice(1)].join(" ");
        ph.innerHTML = isRound ? ICONS.artist : ICONS.music;
        img.replaceWith(ph);
      }, true);
    }

    this._attachListeners(card);
    this._setActiveTab(this._tab, card);
    this._updatePlayerContent(card);
  }

  /* ── Show/hide the "needs reconfiguration" banner based on _maConnected ── */
  _updateConnectionBanner(card) {
    const el = (card || this.shadowRoot?.querySelector(".card-root"))?.querySelector("#mml-connection-banner");
    if (!el) return;
    el.hidden = this._maConnected !== false;
  }

  /* `asPanelTab`: for a real panel (player/search/library/...) that carries its
     own `element`/`element_config` — same custom-element slot mechanism as a
     pure `custom_element` tab, but clicking it switches to that panel (like any
     other nav-tab) instead of running a configurable tap_action. This lets one
     tab entry be BOTH the content panel AND its own styled nav trigger, instead
     of needing a separate hidden panel + a separate custom_element button. */
  _renderCustomElementSlot(tab, { asPanelTab = false } = {}) {
    const sizeParts = [];
    if (tab.width)  sizeParts.push(`width:${typeof tab.width  === "number" ? tab.width  + "px" : tab.width}`);
    if (tab.height) sizeParts.push(`height:${typeof tab.height === "number" ? tab.height + "px" : tab.height}`);
    const sizeStyle = sizeParts.length ? ` style="${sizeParts.join(";")}"` : "";
    if (asPanelTab) {
      const activeClass = this._tab === tab.id ? " active" : "";
      return `<div class="nav-tab nav-btn nav-btn-custom${activeClass}" data-tab="${tab.id}" data-ce-slot="${tab.id}"${sizeStyle}></div>`;
    }
    return `<div class="nav-btn nav-btn-custom" data-tab-btn="${tab.id}" data-ce-slot="${tab.id}"${sizeStyle}></div>`;
  }

  _renderNav() {
    const align = this._config.nav_bar?.align || "start";
    const items = this._resolvedTabs.filter(t => t.show_in_nav !== false).map(t => {
      if (t.type === "custom_element") {
        return this._renderCustomElementSlot(t);
      }
      if (t.type === "button") {
        return this._renderNavButton(t);
      }
      if (t.element) {
        return this._renderCustomElementSlot(t, { asPanelTab: true });
      }
      if (t.type === "settings") {
        const label = t.label || this._t("tabs.settings");
        const icon = t.iconOverride
          ? `<ha-icon icon="${this._esc(t.iconOverride)}"></ha-icon>`
          : ICONS.settings;
        const debugStyle = this._debugMode ? ' style="color: orange;"' : '';
        return `<button class="nav-tab"${debugStyle} data-tab="settings" title="${this._esc(label)}">
          ${icon}<span>${this._esc(label)}</span>
        </button>`;
      }
      const label = t.label || this._t(`tabs.${t.type}`);
      const icon = t.iconOverride
        ? `<ha-icon icon="${this._esc(t.iconOverride)}"></ha-icon>`
        : (ICONS[t.defaultIcon] || ICONS.player);
      return `<button class="nav-tab ${this._tab === t.id ? "active" : ""}" data-tab="${t.id}">
        ${icon}<span>${this._esc(label)}</span>
      </button>`;
    }).join("");

    const alignAttr = align !== "start" ? ` data-align="${align}"` : "";
    const navStyle = this._config.nav_bar?.style ? ` style="${this._esc(this._config.nav_bar.style)}"` : "";
    return `
      <div class="nav-wrapper">
        <div class="nav-fade-left"></div>
        <div class="nav-fade-right"></div>
        <nav class="nav"${navStyle}>
          <div class="nav-tabs"${alignAttr}>${items}</div>
        </nav>
      </div>`;
  }

  _renderNavButton(btn) {
    const entity = btn.entity ? this._hass?.states[btn.entity] : null;
    const isActive = entity
      ? ["on", "playing", "active", "home"].includes(entity.state)
      : false;
    const icon = btn.icon || entity?.attributes?.icon || "mdi:gesture-tap";
    const label = btn.name || "";
    const title = label || entity?.attributes?.friendly_name || "";
    const sizeParts = [];
    if (btn.width)  sizeParts.push(`width:${typeof btn.width  === "number" ? btn.width  + "px" : btn.width}`);
    if (btn.height) sizeParts.push(`height:${typeof btn.height === "number" ? btn.height + "px" : btn.height}`);
    const sizeStyle = sizeParts.length ? ` style="${sizeParts.join(";")}"` : "";
    return `
      <button class="nav-btn${isActive ? " active" : ""}"
              data-tab-btn="${btn.id}"
              title="${this._esc(title)}"${sizeStyle}>
        <ha-icon icon="${this._esc(icon)}"></ha-icon>
        ${label ? `<span class="nav-btn-label">${this._esc(label)}</span>` : ""}
      </button>`;
  }

  _renderPlayerTab() {
    return `
      <div class="tab-panel" data-panel="player">
        <div class="player-tab-body">
          <div class="player-panel">
            <div class="player-art-section">
              <div class="art-wrapper" id="art-wrapper"></div>
            </div>
            <div class="player-controls-section">
              <div class="track-info">
                <div class="track-title" id="track-title">—</div>
                <div class="track-artist" id="track-artist">${this._t("player.select_player")}</div>
                <button class="goto-artist-btn" id="btn-goto-artist" style="display:none">${ICONS.artist}<span>${this._t("player.goto_artist")}</span></button>
              </div>
              <div class="progress-wrapper">
                <div class="progress-bar-container" id="progress-bar">
                  <div class="progress-bar-fill" id="progress-fill" style="width:0%"></div>
                </div>
                <div class="progress-times">
                  <span id="pos-time">0:00</span>
                  <span id="dur-time">0:00</span>
                </div>
              </div>
              <div class="controls">
                <button class="ctrl-btn" id="btn-shuffle" title="${this._t("btns.shuffle")}">${ICONS.shuffle}</button>
                <button class="ctrl-btn ctrl-nav" id="btn-prev" title="${this._t("btns.prev")}">${ICONS.prev}</button>
                <button class="ctrl-btn primary" id="btn-playpause" title="${this._t("btns.play_pause")}">${ICONS.play}</button>
                <button class="ctrl-btn ctrl-nav" id="btn-next" title="${this._t("btns.next")}">${ICONS.next}</button>
                <button class="ctrl-btn" id="btn-repeat" title="${this._t("btns.repeat")}">${ICONS.repeat}</button>
                <button class="queue-toggle-btn ${this._queueVisible ? "active" : ""}" id="btn-queue-toggle" title="${this._t("queue.toggle")}">${ICONS.queue}</button>
              </div>
              <div class="volume-row">
                <button class="ctrl-btn" id="btn-mute" title="${this._t("btns.mute")}">${ICONS.volumeHigh}</button>
                <input type="range" id="volume-slider" min="0" max="100" value="50">
              </div>
              <div class="device-row" id="device-row" title="${this._t("outputs.open")}"${this._config.show_device_select === false ? ' style="display:none"' : ''}>
                <span class="device-icon" id="device-icon-wrap"></span>
                <span class="device-name" id="device-name">${this._t("player.no_player")}</span>
                <span class="device-switch-btn">${ICONS.swap}</span>
              </div>
            </div>
            <div class="out-panel" id="out-panel" hidden></div>
          </div>
          <div class="queue-backdrop ${this._isMobile && this._queueVisible ? "open" : ""}" id="queue-backdrop"></div>
          <div class="queue-section ${this._isMobile && this._queueVisible ? "mml-queue-open" : ""}" id="queue-section" style="${!this._isMobile && !this._queueVisible ? "display:none" : ""}">
            <div class="queue-header">
              <span class="queue-header-label">${this._t("queue.up_next")}</span>
              ${this._isMobile ? `<button class="queue-close-btn" id="queue-close-btn">${ICONS.close}</button>` : ""}
            </div>
            <div id="queue-list">
              <div class="queue-empty">${this._t("queue.empty")}</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  _renderSearchTab() {
    return `
      <div class="tab-panel" data-panel="search">
        <div id="search-main" class="search-panel">
          <div class="search-bar-wrapper">
            <div class="search-input-row">
              ${ICONS.search}
              <input type="text" class="search-input" id="search-input"
                placeholder="${this._t("search.placeholder")}" autocomplete="off" autocorrect="off">
            </div>
          </div>
          <div class="results-container" id="search-results">
            <div class="empty-state">
              ${ICONS.search}
              <p>${this._t("search.type_hint")}</p>
            </div>
          </div>
        </div>
        <div id="artist-page" class="artist-page-panel" style="display:none"></div>
      </div>`;
  }

  _renderLibraryTab(tabDef) {
    const panelId = tabDef?.id || "library";
    const st = this._getLibTabState(panelId);
    const src = st.source;
    const browse = st.browse;
    return `
      <div class="tab-panel" data-panel="${panelId}">
        <div class="library-panel">
          <div class="lib-filters">
            <div class="lib-filter-group">
              <button class="lib-filter-btn ${src === "all" ? "active" : ""}" data-source="all">${this._t("lib.filter_all")}</button>
              <button class="lib-filter-btn ${src === "local" ? "active" : ""}" data-source="local">${this._t("lib.filter_local")}</button>
              <button class="lib-filter-btn ${src === "streaming" ? "active" : ""}" data-source="streaming">${this._t("lib.filter_streaming")}</button>
            </div>
            <div class="browse-mode-toggle" style="${src !== "local" ? "display:none" : ""}">
              <button class="browse-mode-btn ${!browse ? "active" : ""}" data-browse="false">${this._t("lib.mode_catalogue")}</button>
              <button class="browse-mode-btn ${browse ? "active" : ""}" data-browse="true">${this._t("lib.mode_browse")}</button>
            </div>
          </div>
          <div class="lib-content" id="lib-content-inner">
            <div class="loader"><div class="spinner"></div> ${this._t("lib.loading")}</div>
          </div>
        </div>
      </div>`;
  }

  _renderDiscoveryTab(tabDef) {
    const panelId = tabDef?.id || "discovery";
    return `
      <div class="tab-panel" data-panel="${panelId}">
        <div class="library-panel">
          <div class="lib-content" id="lib-content-inner">
            <div class="loader"><div class="spinner"></div> ${this._t("lib.loading")}</div>
          </div>
        </div>
      </div>`;
  }

  _renderPlaylistTab(tabDef) {
    const panelId = tabDef?.id || "playlist";
    const name = tabDef?.playlist_label || tabDef?.label || this._t("tabs.playlist");
    const thumb = tabDef?.playlist_thumbnail
      ? `<img class="playlist-header-art" src="${this._resolveImageUrl(tabDef.playlist_thumbnail)}" alt="" loading="lazy">`
      : `<div class="playlist-header-art-placeholder">${ICONS.playlist}</div>`;
    const configured = !!tabDef?.playlist_uri;
    const view = this._plView(panelId);
    return `
      <div class="tab-panel" data-panel="${panelId}">
        <div class="playlist-tab-body">
          <div class="playlist-header">
            ${thumb}
            <div class="playlist-header-info">
              <div class="playlist-header-name">${this._esc(name)}</div>
            </div>
            ${configured ? `<button class="ctrl-btn playlist-view-toggle" title="${this._t("playlist.toggle_view")}">${view === "grid" ? ICONS.list : ICONS.grid}</button>` : ""}
            ${configured ? `<button class="ctrl-btn playlist-play-all" title="${this._t("playlist.play_all")}">${ICONS.play}</button>` : ""}
          </div>
          <div class="playlist-track-list">
            ${configured
              ? `<div class="loader"><div class="spinner"></div> ${this._t("lib.loading_short")}</div>`
              : `<div class="empty-state">${ICONS.playlist}<p>${this._t("playlist.not_configured")}</p></div>`}
          </div>
        </div>
        ${this._renderMiniPlayerBar()}
      </div>`;
  }

  /* Persisted per-tab track view mode ("list" | "grid") for playlist tabs. */
  _plView(tabId) {
    return this._loadPref(`mml_playlist_view_${tabId}`) || "list";
  }
  _setPlView(tabId, view) {
    this._savePref(`mml_playlist_view_${tabId}`, view);
  }

  _renderPlaylistTrackList(tabDef, items) {
    if (!items.length) return `<div class="empty-state">${ICONS.playlist}<p>${this._t("playlist.empty")}</p></div>`;
    if (this._plView(tabDef.id) === "grid") {
      return `<div class="lib-grid">${items.map(i => this._renderLibCard(i, "music")).join("")}</div>`;
    }
    return items.map(i => this._renderLibListItem(i)).join("");
  }

  _renderMiniPlayerBar() {
    return `
      <div class="mini-player-bar">
        <div class="mini-player-info">
          <span class="mini-player-title">—</span>
          <span class="mini-player-artist"></span>
        </div>
        <div class="mini-player-progress">
          <div class="progress-bar-container mini-progress-bar">
            <div class="progress-bar-fill mini-progress-fill" style="width:0%"></div>
          </div>
          <div class="progress-times">
            <span class="mini-pos-time">0:00</span>
            <span class="mini-dur-time">0:00</span>
          </div>
        </div>
        <div class="controls mini-player-controls">
          <button class="ctrl-btn ctrl-nav mini-ctrl-prev" title="${this._t("btns.prev")}">${ICONS.prev}</button>
          <button class="ctrl-btn primary mini-ctrl-playpause" title="${this._t("btns.play_pause")}">${ICONS.play}</button>
          <button class="ctrl-btn ctrl-nav mini-ctrl-next" title="${this._t("btns.next")}">${ICONS.next}</button>
        </div>
        <div class="volume-row">
          <button class="ctrl-btn mini-ctrl-mute" title="${this._t("btns.mute")}">${ICONS.volumeHigh}</button>
          <input type="range" class="mini-volume-slider" min="0" max="100" value="50">
        </div>
        <div class="device-row mini-device-row" title="${this._t("outputs.open")}"${this._config.show_device_select === false ? ' style="display:none"' : ''}>
          <span class="device-icon mini-device-icon-wrap"></span>
          <span class="device-name mini-device-name">${this._t("player.no_player")}</span>
          <span class="device-switch-btn">${ICONS.swap}</span>
        </div>
      </div>`;
  }

  _renderSettingsModal() {
    return `
      <div class="modal-overlay" id="settings-modal">
        <div class="modal-sheet">
          <div class="modal-title">
            <span>${this._t("settings.title")}</span>
            <button id="settings-close">${ICONS.close}</button>
          </div>
          <div id="settings-content"></div>
          <div style="text-align:right;font-size:12px;color:var(--text2);opacity:.7;margin-top:12px;">v${CARD_VERSION}</div>
        </div>
      </div>`;
  }

  /* ── Event Listeners ── */
  _attachListeners(card) {
    // Nav tabs (panel tabs + settings)
    card.querySelectorAll(".nav-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (tab === "settings") {
          this._openSettings(card);
          return;
        }
        this._setActiveTab(tab, card);
        const tabDef = this._resolvedTabs.find(t => t.id === tab);
        if (tabDef?.type === "library" && !this._libLoadedTabs.has(tab)) this._loadLibrary();
        if (tabDef?.type === "playlist" && !this._plLoadedTabs.has(tab)) this._loadPlaylistTab(tabDef);
        if (tabDef?.type === "discovery" && !this._discoveryLoadedTabs.has(tab)) this._loadDiscovery(tab);
      });
    });

    // Nav scroll fade indicators
    const navEl = card.querySelector(".nav");
    if (navEl) {
      const fadeL = card.querySelector(".nav-fade-left");
      const fadeR = card.querySelector(".nav-fade-right");
      const updateFades = () => {
        const { scrollLeft, scrollWidth, clientWidth } = navEl;
        fadeL?.classList.toggle("visible", scrollLeft > 2);
        fadeR?.classList.toggle("visible", scrollLeft + clientWidth < scrollWidth - 2);
      };
      navEl.addEventListener("scroll", updateFades, { passive: true });
      requestAnimationFrame(updateFades);
    }

    // Library filters — attach per panel so multi-library-tab setups work independently
    for (const libPanel of card.querySelectorAll('.tab-panel')) {
      const tabId = libPanel.dataset.panel;
      const tabDef = this._resolvedTabs.find(t => t.id === tabId);
      if (tabDef?.type !== "library") continue;
      const ts = this._getLibTabState(tabId);

      libPanel.querySelector(".lib-filter-group")?.addEventListener("click", (e) => {
        const btn = e.target.closest(".lib-filter-btn");
        if (!btn || btn.classList.contains("active")) return;
        const source = btn.dataset.source;
        ts.source = source;
        this._savePref(`mml_lib_source_${tabId}`, source);
        if (source !== "local") ts.browse = false;
        libPanel.querySelectorAll(".lib-filter-btn").forEach(b => b.classList.toggle("active", b.dataset.source === source));
        this._libLoadedTabs.delete(tabId);
        if (this._tab === tabId) this._reloadLibrary();
      });

      libPanel.querySelector(".browse-mode-toggle")?.addEventListener("click", (e) => {
        const btn = e.target.closest(".browse-mode-btn");
        if (!btn || btn.classList.contains("active")) return;
        ts.browse = btn.dataset.browse === "true";
        ts.browseStack = [];
        this._libLoadedTabs.delete(tabId);
        if (this._tab === tabId) this._reloadLibrary();
      });

    }

    const hasPanel = (type) => this._resolvedTabs.some(t => t.type === type);

    // Player controls (only if player tab is present)
    if (hasPanel("player")) {
      card.querySelector("#btn-playpause").addEventListener("click", () => this._togglePlayPause());
      card.querySelector("#btn-prev").addEventListener("click", () => this._callService("media_previous_track"));
      card.querySelector("#btn-next").addEventListener("click", () => this._callService("media_next_track"));
      card.querySelector("#btn-shuffle").addEventListener("click", () => this._toggleShuffle());
      card.querySelector("#btn-repeat").addEventListener("click", () => this._cycleRepeat());
      card.querySelector("#btn-goto-artist").addEventListener("click", (e) => this._openCurrentArtistPage(e.currentTarget));
      card.querySelector("#btn-mute").addEventListener("click", () => this._toggleMute());

      // Volume — send command only on release (pointerup), not during drag
      this._bindVolumeSlider(card.querySelector("#volume-slider"));

      // Progress bar — seek on release only (covers both tap and drag)
      this._bindSeekBar(card.querySelector("#progress-bar"), card.querySelector("#progress-fill"), card.querySelector("#pos-time"));

      // Queue toggle
      card.querySelector("#btn-queue-toggle")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this._queueVisible = !this._queueVisible;
        this._savePref("mml_queue_visible", String(this._queueVisible));
        this._applyQueueVisibility(card);
      });

      // Queue close (mobile: backdrop tap or close button)
      const closeQueue = () => {
        this._queueVisible = false;
        this._savePref("mml_queue_visible", "false");
        this._applyQueueVisibility(card);
      };
      card.querySelector("#queue-backdrop")?.addEventListener("click", closeQueue);
      card.querySelector("#queue-close-btn")?.addEventListener("click", closeQueue);

      // Output row → output panel
      card.querySelector("#device-row").addEventListener("click", () => this._openOutputPanel(card));
    }

    // Mini player bar (playlist tabs) — independent of the "player" tab being present.
    // Same callbacks as the main player tab: _togglePlayPause / _callService / _toggleMute /
    // _bindSeekBar / _bindVolumeSlider / _openOutputPanel — just bound to a second set of elements.
    card.querySelectorAll(".mini-player-bar").forEach(bar => {
      bar.querySelector(".mini-ctrl-playpause")?.addEventListener("click", () => this._togglePlayPause());
      bar.querySelector(".mini-ctrl-prev")?.addEventListener("click", () => this._callService("media_previous_track"));
      bar.querySelector(".mini-ctrl-next")?.addEventListener("click", () => this._callService("media_next_track"));
      bar.querySelector(".mini-ctrl-mute")?.addEventListener("click", () => this._toggleMute());
      this._bindSeekBar(bar.querySelector(".mini-progress-bar"), bar.querySelector(".mini-progress-fill"), bar.querySelector(".mini-pos-time"));
      this._bindVolumeSlider(bar.querySelector(".mini-volume-slider"));
      bar.querySelector(".mini-device-row")?.addEventListener("click", () => this._openOutputPanel(card));
    });

    // Playlist tabs — header buttons (play all, list/grid view toggle)
    for (const plPanel of card.querySelectorAll(".tab-panel")) {
      const tabDef = this._resolvedTabs.find(t => t.id === plPanel.dataset.panel);
      if (tabDef?.type !== "playlist") continue;
      plPanel.querySelector(".playlist-play-all")?.addEventListener("click", () => {
        if (tabDef.playlist_uri) this._playItem(tabDef.playlist_uri, "playlist");
      });
      plPanel.querySelector(".playlist-view-toggle")?.addEventListener("click", (e) => {
        const next = this._plView(tabDef.id) === "grid" ? "list" : "grid";
        this._setPlView(tabDef.id, next);
        e.currentTarget.innerHTML = next === "grid" ? ICONS.list : ICONS.grid;
        const listEl = plPanel.querySelector(".playlist-track-list");
        const items = (this._plTracks && this._plTracks[tabDef.id]) || [];
        if (listEl) {
          listEl.innerHTML = this._renderPlaylistTrackList(tabDef, items);
          this._attachItemActions(listEl, { switchToPlayer: false });
        }
      });
    }

    // Settings modal close
    card.querySelector("#settings-close").addEventListener("click", () => this._closeSettings(card));
    card.querySelector("#settings-modal").addEventListener("click", (e) => {
      if (e.target === card.querySelector("#settings-modal")) this._closeSettings(card);
    });

    // Search (only if search tab is present)
    const searchInput = card.querySelector("#search-input");
    searchInput?.addEventListener("input", (e) => {
      clearTimeout(this._searchTimeout);
      this._searchQuery = e.target.value;
      if (this._searchQuery.trim().length < 2) {
        this._renderSearchResults(card, null);
        return;
      }
      this._searchTimeout = setTimeout(() => this._doSearch(card), 700);
    });

    // Nav action buttons (tap / hold / double-tap → HA actions)
    card.querySelectorAll("[data-tab-btn]").forEach(btn => {
      let holdTimer = null;
      let didHold = false;

      const getBtnCfg = () => {
        const id = btn.dataset.tabBtn;
        return this._resolvedTabs.find(t => t.id === id);
      };

      btn.addEventListener("pointerdown", () => {
        didHold = false;
        const cfg = getBtnCfg();
        if (!cfg?.hold_action) return;
        holdTimer = setTimeout(() => {
          didHold = true;
          this._handleNavAction(cfg, "hold_action");
        }, 500);
      });
      btn.addEventListener("pointerup",     () => clearTimeout(holdTimer));
      btn.addEventListener("pointercancel", () => clearTimeout(holdTimer));

      btn.addEventListener("click", () => {
        if (didHold) { didHold = false; return; }
        const cfg = getBtnCfg();
        if (cfg) this._handleNavAction(cfg, "tap_action");
      });

      btn.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const cfg = getBtnCfg();
        if (cfg?.double_tap_action) this._handleNavAction(cfg, "double_tap_action");
      });
    });

    this._mountCustomElements(card);
  }

  _mountCustomElements(card) {
    card.querySelectorAll("[data-ce-slot]").forEach(slot => {
      if (slot._ceMounted) return;
      const id = slot.dataset.ceSlot;
      const tab = this._resolvedTabs.find(t => t.id === id);
      if (!tab?.element) return;
      // Strip Lovelace "custom:" prefix — the actual DOM tag name never has it
      const tagName = tab.element.replace(/^custom:/, "");
      const el = document.createElement(tagName);
      if (typeof el.setConfig === "function") {
        try { el.setConfig(tab.element_config || {}); } catch(e) {
          console.warn(`[mml] custom_element "${tagName}" setConfig error:`, e);
        }
      }
      if (this._hass) el.hass = this._hass;
      slot.appendChild(el);
      slot._ceMounted = true;
    });
  }

  /* ── Nav button action handler ── */
  _handleNavAction(btnCfg, actionKey) {
    const action = btnCfg[actionKey];
    if (!action || action.action === "none") return;

    switch (action.action) {
      case "call-service":
      case "perform-action": {
        // HA 2024.8+ uses "perform_action"; older uses "service"
        const svcStr = action.perform_action || action.service || "";
        const [domain, service] = svcStr.split(".", 2);
        if (domain && service) {
          this._hass.callService(
            domain, service,
            action.service_data || action.data || {},
            action.target || {}
          );
        }
        break;
      }
      case "toggle": {
        const entityId = action.entity_id || btnCfg.entity;
        if (entityId) {
          const st = this._hass.states[entityId];
          const dom = entityId.split(".")[0];
          const svc = st?.state === "on" ? "turn_off" : "turn_on";
          this._hass.callService(dom, svc, {}, { entity_id: entityId });
        }
        break;
      }
      case "more-info": {
        const entityId = action.entity_id || btnCfg.entity;
        if (entityId) {
          this.dispatchEvent(new CustomEvent("hass-more-info", {
            detail: { entityId },
            bubbles: true,
            composed: true,
          }));
        }
        break;
      }
      case "navigate": {
        const path = action.navigation_path || "/";
        history.pushState(null, "", path);
        this.dispatchEvent(new CustomEvent("location-changed", {
          detail: { replace: false },
          bubbles: true,
          composed: true,
        }));
        break;
      }
      case "url": {
        const url = action.url_path || action.url || "";
        if (url) window.open(url, action.new_tab !== false ? "_blank" : "_self");
        break;
      }
      case "assist": {
        this.dispatchEvent(new CustomEvent("show-dialog", {
          detail: { dialogTag: "ha-voice-command-dialog", dialogImport: () => {} },
          bubbles: true,
          composed: true,
        }));
        break;
      }
      case "mml_navigate_tab": {
        const tabTypeOrId = action.tab;
        if (!tabTypeOrId) break;
        const card = this.shadowRoot?.querySelector(".card-root");
        if (!card) break;
        const tabDef = this._resolvedTabs.find(t => t.id === tabTypeOrId) ||
                       this._resolvedTabs.find(t => t.type === tabTypeOrId);
        if (!tabDef) break;
        if (tabDef.type === "settings") {
          this._openSettings(card);
        } else {
          this._setActiveTab(tabDef.id, card);
          if (tabDef.type === "library" && !this._libLoadedTabs.has(tabDef.id)) this._loadLibrary();
          if (tabDef.type === "playlist" && !this._plLoadedTabs.has(tabDef.id)) this._loadPlaylistTab(tabDef);
          if (tabDef.type === "discovery" && !this._discoveryLoadedTabs.has(tabDef.id)) this._loadDiscovery(tabDef.id);
        }
        break;
      }
      case "mml_navigate_section": {
        const section = action.section;
        if (!section) break;
        const card = this.shadowRoot?.querySelector(".card-root");
        if (!card) break;
        const libTab = this._resolvedTabs.find(t => t.type === "library" && t.sections?.includes(section)) ||
                       this._resolvedTabs.find(t => t.type === "library");
        if (!libTab) break;
        const alreadyLoaded = this._libLoadedTabs.has(libTab.id);
        this._setActiveTab(libTab.id, card);
        if (!alreadyLoaded) this._loadLibrary();
        setTimeout(() => {
          const panel = card.querySelector(`[data-panel="${libTab.id}"]`);
          const secEl = panel?.querySelector(`#lib-sec-${section}`);
          if (secEl) secEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }, alreadyLoaded ? 50 : 600);
        break;
      }
      case "mml_control": {
        const cmd = action.command;
        const player = this._activePlayer;
        if (!cmd || !player) break;
        switch (cmd) {
          case "play_pause": {
            const state = this._hass?.states[player]?.state;
            this._hass?.callService("media_player", state === "playing" ? "media_pause" : "media_play", {}, { entity_id: player });
            break;
          }
          case "next":
            this._hass?.callService("media_player", "media_next_track", {}, { entity_id: player });
            break;
          case "prev":
            this._hass?.callService("media_player", "media_previous_track", {}, { entity_id: player });
            break;
          case "shuffle": {
            const shuffleOn = this._hass?.states[player]?.attributes?.shuffle;
            this._hass?.callService("media_player", "shuffle_set", { shuffle: !shuffleOn }, { entity_id: player });
            break;
          }
          case "repeat": {
            const cur = this._hass?.states[player]?.attributes?.repeat || "off";
            const next = cur === "off" ? "all" : cur === "all" ? "one" : "off";
            this._hass?.callService("media_player", "repeat_set", { repeat: next }, { entity_id: player });
            break;
          }
          case "mute": {
            const isMuted = this._hass?.states[player]?.attributes?.is_volume_muted;
            this._hass?.callService("media_player", "volume_mute", { is_volume_muted: !isMuted }, { entity_id: player });
            break;
          }
        }
        break;
      }
      default:
        break;
    }
  }

  /* ── Tab switching ── */
  _setActiveTab(tab, card) {
    this._tab = tab;
    card.querySelectorAll(".nav-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    card.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.dataset.panel === tab));
  }

  /* ── Update (called on every hass update) ── */
  _update() {
    const card = this.shadowRoot.querySelector(".card-root");
    if (!card) return;
    this._updatePlayerContent(card);
    this._updateNavButtons(card);
    if (this._outputPanelOpen && !this._outDragging && this._outputPanelSignature() !== this._outPanelSig) {
      this._renderOutputPanel(card);
    }
    const activeTabDef = this._resolvedTabs.find(t => t.id === this._tab);
    if (activeTabDef?.type === "library" && !this._libLoadedTabs.has(this._tab)) this._loadLibrary();
    if (activeTabDef?.type === "playlist" && !this._plLoadedTabs.has(this._tab)) this._loadPlaylistTab(activeTabDef);
    if (activeTabDef?.type === "discovery" && !this._discoveryLoadedTabs.has(this._tab)) this._loadDiscovery(this._tab);
  }

  _updateNavButtons(card) {
    for (const tab of this._resolvedTabs) {
      if (tab.type === "button" && tab.entity) {
        const st = this._hass?.states[tab.entity];
        const isActive = st ? ["on", "playing", "active", "home"].includes(st.state) : false;
        const el = card.querySelector(`[data-tab-btn="${tab.id}"]`);
        if (el) el.classList.toggle("active", isActive);
      }
    }
    // Propagate hass updates to mounted custom elements
    card.querySelectorAll("[data-ce-slot] > *").forEach(el => {
      if (this._hass) el.hass = this._hass;
    });
  }

  _resolveImageUrl(url) {
    if (!url) return "";
    if (!url.startsWith("http")) {
      const hasHassUrl = typeof this._hass?.hassUrl === "function";
      return hasHassUrl ? this._hass.hassUrl(url) : url;
    }
    const isMixedContent = location.protocol === "https:" && url.startsWith("http://");
    if (isMixedContent) {
      return `/my_music_library/image_proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  }

  _updatePlayerContent(card) {
    const state = this._getActiveState();
    const attr = state?.attributes || {};
    const isPlaying = state?.state === "playing";

    // Album art
    const artWrapper = card.querySelector("#art-wrapper");
    if (artWrapper) {
      if (attr.entity_picture) {
        const ep = attr.entity_picture;
        const src = this._resolveImageUrl(ep);
        console.debug("[MML] Cover art: entity_picture=%s → src=%s", ep, src);
        const existing = artWrapper.querySelector("img.art");
        if (!existing || existing.src !== src) {
          artWrapper.innerHTML = "";
          const img = document.createElement("img");
          img.className = "art";
          img.alt = "Album art";
          img.src = src;
          img.onload = () => console.debug("[MML] Cover art loaded OK: %s", img.src);
          img.onerror = () => {
            console.warn("[MML] Cover art FAILED: %s", img.src);
            artWrapper.innerHTML = `<div class="art-placeholder">${ICONS.music}</div>`;
          };
          artWrapper.appendChild(img);
        }
      } else {
        artWrapper.innerHTML = `<div class="art-placeholder">${ICONS.music}</div>`;
      }
    }

    // Track info
    const titleEl = card.querySelector("#track-title");
    const artistEl = card.querySelector("#track-artist");
    if (titleEl) titleEl.textContent = attr.media_title || (state ? this._t("player.nothing_playing") : "—");
    if (artistEl) {
      artistEl.textContent = [attr.media_artist, attr.media_album_name].filter(Boolean).join(" · ") || this._t("player.select_player");
    }
    const gotoArtistBtn = card.querySelector("#btn-goto-artist");
    if (gotoArtistBtn) {
      // the artist page lives in the search panel: no search tab, no button
      const canOpen = attr.media_artist && attr.media_content_id && card.querySelector("#artist-page");
      gotoArtistBtn.style.display = canOpen ? "" : "none";
    }

    // Mini player bar (playlist tabs) — text is the only "art" substitute, per design
    card.querySelectorAll(".mini-player-title").forEach(el => {
      el.textContent = attr.media_title || (state ? this._t("player.nothing_playing") : "—");
    });
    card.querySelectorAll(".mini-player-artist").forEach(el => {
      el.textContent = [attr.media_artist, attr.media_album_name].filter(Boolean).join(" · ") || "";
    });

    // Play/pause button (main + any mini player bar)
    card.querySelectorAll("#btn-playpause, .mini-ctrl-playpause").forEach(btn => {
      btn.innerHTML = isPlaying ? ICONS.pause : ICONS.play;
    });

    // Shuffle
    const shuffleBtn = card.querySelector("#btn-shuffle");
    if (shuffleBtn) shuffleBtn.classList.toggle("active", !!attr.shuffle);

    // Repeat
    const repeatBtn = card.querySelector("#btn-repeat");
    if (repeatBtn) {
      const repeat = attr.repeat || "off";
      repeatBtn.innerHTML = repeat === "one" ? ICONS.repeatOne : ICONS.repeat;
      repeatBtn.classList.toggle("active", repeat !== "off");
    }

    // Volume — skip update while user is dragging to prevent snap-back (main + any mini bar)
    if (attr.volume_level !== undefined && !this._volumeDragging) {
      card.querySelectorAll("#volume-slider, .mini-volume-slider").forEach(sl => {
        sl.value = Math.round(attr.volume_level * 100);
      });
    }

    // Mute (main + any mini bar)
    card.querySelectorAll("#btn-mute, .mini-ctrl-mute").forEach(btn => {
      btn.innerHTML = attr.is_volume_muted ? ICONS.volumeMute : ICONS.volumeHigh;
      btn.classList.toggle("active", !!attr.is_volume_muted);
    });

    // Progress
    this._updateProgress(card, state);

    // Device row (name + icon reflect group state)
    this._updateDeviceRow(card);


    // Refresh MA queue when the current track changes
    const currentUri = attr.media_content_id || null;
    if (currentUri !== this._lastKnownUri) {
      this._lastKnownUri = currentUri;
      this._refreshQueueSoon(800);
    }
  }

  _updateProgress(card, state) {
    const attr = state?.attributes || {};
    const dur = attr.media_duration || 0;
    const isPlaying = state?.state === "playing";

    // The seek override only bridges the gap until HA reports the new position: drop it
    // on another track or player, or once a position report newer than the seek arrives.
    if (this._localPosition !== null) {
      const posUpdated = attr.media_position_updated_at;
      if (this._localPositionKey !== `${this._activePlayer}|${attr.media_content_id}`
          || (posUpdated && new Date(posUpdated).getTime() / 1000 > this._localPositionTime + 1)) {
        this._localPosition = null;
      }
    }

    let pos;
    if (isPlaying && this._localPosition !== null) {
      const elapsed = Date.now() / 1000 - this._localPositionTime;
      pos = this._localPosition + elapsed;
    } else if (isPlaying) {
      const statePos = attr.media_position || 0;
      const posUpdated = attr.media_position_updated_at;
      if (posUpdated) {
        const elapsed = (Date.now() - new Date(posUpdated).getTime()) / 1000;
        pos = statePos + elapsed;
      } else {
        pos = statePos;
      }
    } else {
      pos = attr.media_position || 0;
      this._localPosition = null;
    }

    // never below 0: a device clock a bit behind HA's puts media_position_updated_at in the future
    pos = Math.max(0, Math.min(pos || 0, dur));
    const pct = dur > 0 ? (pos / dur) * 100 : 0;

    if (!this._seekDragging) {
      card.querySelectorAll("#progress-fill, .mini-progress-fill").forEach(fill => {
        fill.style.width = `${pct.toFixed(1)}%`;
      });
      card.querySelectorAll("#pos-time, .mini-pos-time").forEach(el => { el.textContent = fmt(pos); });
    }
    card.querySelectorAll("#dur-time, .mini-dur-time").forEach(el => { el.textContent = fmt(dur); });
  }

  /* ── Progress ticker ── */
  _startProgressTick() {
    this._stopProgressTick();
    this._progressInterval = setInterval(() => {
      const card = this.shadowRoot?.querySelector(".card-root");
      if (!card) return;
      const state = this._getActiveState();
      if (state?.state === "playing") this._updateProgress(card, state);
    }, 1000);
  }

  _stopProgressTick() {
    if (this._progressInterval) { clearInterval(this._progressInterval); this._progressInterval = null; }
  }

  /* ── Service calls ── */
  _callService(service, data = {}) {
    if (!this._hass || !this._activePlayer) return;
    this._hass.callService("media_player", service, {
      entity_id: this._activePlayer,
      ...data,
    });
  }

  _togglePlayPause() {
    const state = this._getActiveState();
    if (!state) return;
    this._callService(state.state === "playing" ? "media_pause" : "media_play");
  }

  _toggleShuffle() {
    const state = this._getActiveState();
    if (!state) return;
    this._callService("shuffle_set", { shuffle: !state.attributes.shuffle });
  }

  _cycleRepeat() {
    const state = this._getActiveState();
    if (!state) return;
    const modes = ["off", "all", "one"];
    const cur = state.attributes.repeat || "off";
    const next = modes[(modes.indexOf(cur) + 1) % modes.length];
    this._callService("repeat_set", { repeat: next });
  }

  _toggleMute() {
    this._callService("volume_mute", { is_volume_muted: !this._getActiveState()?.attributes?.is_volume_muted });
  }

  /* ── Volume slider — shared by the main player and any mini player bar ── */
  _bindVolumeSlider(slider) {
    if (!slider) return;
    slider.addEventListener("pointerdown", () => { this._volumeDragging = true; });
    const endVolDrag = (e) => {
      if (!this._volumeDragging) return;
      this._volumeDragging = false;
      this._callService("volume_set", { volume_level: parseInt(e.target.value) / 100 });
    };
    slider.addEventListener("pointerup", endVolDrag);
    slider.addEventListener("pointercancel", () => { this._volumeDragging = false; });
  }

  /* ── Seek bar — shared by the main player and any mini player bar ── */
  _bindSeekBar(progressBar, progressFill, posTimeEl) {
    if (!progressBar || !progressFill) return;
    const getSeekPct = (e) => {
      const rect = progressBar.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    };
    progressBar.addEventListener("pointerdown", (e) => {
      const state = this._getActiveState();
      if (!state?.attributes?.media_duration) return;
      this._seekDragging = true;
      progressBar.setPointerCapture(e.pointerId);
      progressFill.style.transition = "none";
      const pct = getSeekPct(e);
      progressFill.style.width = `${(pct * 100).toFixed(1)}%`;
      if (posTimeEl) posTimeEl.textContent = fmt(pct * state.attributes.media_duration);
    });
    progressBar.addEventListener("pointermove", (e) => {
      if (!this._seekDragging) return;
      const state = this._getActiveState();
      if (!state?.attributes?.media_duration) return;
      const pct = getSeekPct(e);
      progressFill.style.width = `${(pct * 100).toFixed(1)}%`;
      if (posTimeEl) posTimeEl.textContent = fmt(pct * state.attributes.media_duration);
    });
    const endSeekDrag = (e) => {
      if (!this._seekDragging) return;
      this._seekDragging = false;
      progressFill.style.transition = "";
      const state = this._getActiveState();
      if (!state?.attributes?.media_duration) return;
      const pct = getSeekPct(e);
      const pos = pct * state.attributes.media_duration;
      this._callService("media_seek", { seek_position: Math.round(pos) });
      this._localPosition = pos;
      this._localPositionTime = Date.now() / 1000;
      this._localPositionKey = `${this._activePlayer}|${state.attributes.media_content_id}`;
    };
    progressBar.addEventListener("pointerup", endSeekDrag);
    progressBar.addEventListener("pointercancel", () => {
      this._seekDragging = false;
      progressFill.style.transition = "";
    });
  }

  /* ── Device row ── */
  /* ══ Audio outputs: output row + output panel (switch / group / control) ══
     Facts only Music Assistant knows (group leader, members, who can group with whom,
     powered, HA area) come from GET /my_music_library/outputs, reloaded when the group
     layout of our players changes in hass.states; live state (playing, volume, title)
     comes from hass.states. Every action goes through POST /my_music_library/outputs. */

  _outputInfo(eid) { return this._outputs?.get(eid) || null; }

  async _loadOutputs() {
    if (!this._hass) return;
    const seq = ++this._outputsSeq;
    try {
      const data = await this._callIntegration("GET", "outputs");
      if (seq !== this._outputsSeq) return;
      this._outputs = new Map((data?.outputs || []).map(o => [o.entity_id, o]));
      this._presets = data?.presets || [];
    } catch (err) {
      this._debugLog("outputs load failed:", err);
      return;
    }
    const card = this.shadowRoot?.querySelector(".card-root");
    if (card) {
      this._updateDeviceRow(card);
      this._renderOutputPanel(card);
    }
  }

  /* Group layout of our players as seen in hass.states: when it changes (MA regrouped,
     a player went offline or off), the MA-side facts are reloaded. */
  _outputsSignature() {
    return Object.entries(this._hass?.states || {})
      .filter(([, s]) => s.attributes?.mass_player_id)
      .map(([id, s]) => `${id}:${s.state === "unavailable" ? "u" : s.state === "off" ? "o" : "1"}:${(s.attributes.group_members || []).join(",")}`)
      .join("|");
  }

  _scheduleOutputsReload() {
    const sig = this._outputsSignature();
    if (sig === this._outputsSig) return;
    this._outputsSig = sig;
    clearTimeout(this._outputsReloadTimer);
    this._outputsReloadTimer = setTimeout(() => this._loadOutputs(), this._outputs ? 400 : 0);
  }

  _groupLeaderOf(eid) {
    return this._outputInfo(eid)?.leader || eid;
  }

  _groupMembersOf(leader) {
    const info = this._outputInfo(leader);
    const members = info ? info.members : (this._hass?.states[leader]?.attributes?.group_members || []);
    return members.filter(m => m !== leader);
  }

  _canGroup(a, b) {
    return !!(this._outputInfo(a)?.groupable?.includes(b) || this._outputInfo(b)?.groupable?.includes(a));
  }

  _outputFullName(eid) {
    return this._hass?.states[eid]?.attributes?.friendly_name || this._outputInfo(eid)?.name || eid;
  }

  _outputArea(eid) {
    const info = this._outputInfo(eid);
    if (info) return info.area || null;
    const ent = this._hass?.entities?.[eid];
    const areaId = ent?.area_id || this._hass?.devices?.[ent?.device_id]?.area_id;
    return (areaId && this._hass?.areas?.[areaId]?.name) || null;
  }

  /* Short display name: card alias → HA area (when it is the only output there) → cleaned name. */
  _outputName(eid) {
    const alias = this._config.devices?.[eid]?.name;
    if (alias) return alias;
    const area = this._outputArea(eid);
    if (area) {
      const sameArea = Object.keys(this._hass?.states || {})
        .filter(id => id.startsWith("media_player.") && this._isOfferedOutput(id, { includeOffline: true }))
        .filter(id => this._outputArea(id) === area);
      if (sameArea.length === 1) return area;
    }
    return this._cleanOutputName(this._outputFullName(eid));
  }

  /* "squeeze-salle-d-eau" → "Salle d'eau", "browser_mod_80df8189_b0b53f25" → "Browser 80df". */
  _cleanOutputName(name) {
    let n = String(name || "").trim();
    const bm = n.match(/^browser_mod_([0-9a-f]{4})/i);
    if (bm) return `${this._t("outputs.browser")} ${bm[1]}`;
    n = n.replace(/^(squeezelite|squeeze|snapcast|sonos|airplay|chromecast)[-_ ]+/i, "");
    if (/[-_]/.test(n) && !/\s/.test(n)) {
      n = n.replace(/[-_]+/g, " ").replace(/\b([dlj]) (?=[aeiouyhàâéèêëîïôöûü])/gi, "$1'");
    }
    return n ? n.charAt(0).toUpperCase() + n.slice(1) : String(name || "");
  }

  _outputIcon(eid) {
    const custom = this._config.devices?.[eid]?.icon;
    if (custom) return custom;
    const info = this._outputInfo(eid);
    const name = this._outputFullName(eid);
    if (info) {
      if (["group", "sync_group", "stereo_pair"].includes(info.type)) return "mdi:speaker-multiple";
      const prov = (info.provider || "").split("--")[0];
      if (prov === "sendspin" || /^web\b/i.test(name)) return "mdi:web";
      if (prov === "chromecast") return "mdi:cast-audio";
      if (prov === "airplay") return "mdi:apple-airplay";
      if (/\b(tv|webos|bravia|television)\b/i.test(`${name} ${info.model || ""}`)) return "mdi:television";
      return info.icon || "mdi:speaker";
    }
    const attr = this._hass?.states[eid]?.attributes || {};
    if (/browser/i.test(eid)) return "mdi:web";
    if (attr.device_class === "tv" || /\b(tv|fire_tv)\b/i.test(eid)) return "mdi:television";
    return attr.icon || "mdi:speaker";
  }

  /* An output the panel may show: our MA players, plus other HA media players when
     show_other_players is set — minus those hidden by the card or the integration options. */
  _isOfferedOutput(eid, { includeOffline = false, includeOthers = false } = {}) {
    const st = this._hass?.states[eid];
    if (!st || this._isExcluded(eid) || this._config.devices?.[eid]?.hidden) return false;
    if (!st.attributes?.mass_player_id && !(includeOthers && this._config.show_other_players)) return false;
    return includeOffline || st.state !== "unavailable";
  }

  _panelOutputIds(opts = {}) {
    return Object.keys(this._hass?.states || {})
      .filter(id => id.startsWith("media_player.") && this._isOfferedOutput(id, opts))
      .sort((a, b) => this._outputName(a).localeCompare(this._outputName(b)));
  }

  _stateLabel(eid) {
    const st = this._hass?.states[eid];
    const info = this._outputInfo(eid);
    if (!st || st.state === "unavailable" || info?.available === false) return this._t("outputs.unavailable");
    if (st.state === "off" || info?.powered === false) return this._t("outputs.off");
    if (st.state === "playing") return this._t("outputs.playing");
    if (st.state === "paused") return this._t("outputs.paused");
    return this._t("outputs.idle");
  }

  _tf(key, vars = {}) {
    return String(this._t(key)).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  }

  _setActivePlayerTo(eid) {
    if (!eid || eid === this._activePlayer) return;
    this._activePlayer = eid;
    this._savePlayer(eid);
    this._loadMAQueue();
    const card = this.shadowRoot?.querySelector(".card-root");
    if (card) this._updatePlayerContent(card);
  }

  /* ── Output row (player tab + mini player bar) ── */
  _updateDeviceRow(card) {
    let text = this._t("player.no_player");
    let full = "";
    let icon = "mdi:speaker";
    if (this._activePlayer) {
      const leader = this._groupLeaderOf(this._activePlayer);
      const ids = [leader, ...this._groupMembersOf(leader)];
      text = ids.length > 3
        ? `${this._outputName(leader)} +${ids.length - 1}`
        : ids.map(id => this._outputName(id)).join(" + ");
      full = ids.map(id => this._outputFullName(id)).join(" + ");
      icon = ids.length > 1 ? "mdi:speaker-multiple" : this._outputIcon(this._activePlayer);
    }
    card.querySelectorAll("#device-name, .mini-device-name").forEach(el => {
      el.textContent = text;
      el.title = full;
    });
    card.querySelectorAll("#device-icon-wrap, .mini-device-icon-wrap").forEach(el => {
      if (el.dataset.icon === icon) return;
      el.dataset.icon = icon;
      el.innerHTML = `<ha-icon icon="${this._esc(icon)}"></ha-icon>`;
    });
  }

  /* ── Output panel ── */
  _openOutputPanel(card, mode) {
    if (!card.querySelector("#out-panel")) return;
    if (card.querySelector('.tab-panel[data-panel="player"]') && this._tab !== "player") this._setActiveTab("player", card);
    this._outputPanelOpen = true;
    this._outputMode = mode || this._outputMode || "switch";
    this._switchSel = new Set();
    this._presetEditing = false;
    card.querySelector("#out-panel").hidden = false;
    this._renderOutputPanel(card);
    this._loadOutputs();
  }

  _closeOutputPanel(card) {
    this._outputPanelOpen = false;
    const panel = card.querySelector("#out-panel");
    if (panel) {
      panel.hidden = true;
      panel.innerHTML = "";
    }
  }

  /* What the open panel shows; a change re-renders it (see _update). */
  _outputPanelSignature() {
    const states = this._hass?.states || {};
    return this._panelOutputIds({ includeOffline: true, includeOthers: true }).map(id => {
      const a = states[id]?.attributes || {};
      return [id, states[id]?.state, a.volume_level, a.is_volume_muted, a.media_title, a.entity_picture, (a.group_members || []).join(",")].join("~");
    }).join("|") + `#${this._activePlayer}`;
  }

  _renderOutputPanel(card) {
    const panel = card?.querySelector("#out-panel");
    if (!panel || !this._outputPanelOpen) return;
    const mode = this._outputMode;
    const scroll = panel.querySelector(".out-body")?.scrollTop || 0;
    const body = mode === "group" ? this._renderOutGroup() : mode === "control" ? this._renderOutControl() : this._renderOutSwitch();
    panel.innerHTML = `
      <div class="out-head">
        <div class="out-modes" role="tablist">
          ${["switch", "group", "control"].map(m => `<button type="button" role="tab" class="out-mode${m === mode ? " active" : ""}" data-mode="${m}">${this._t(`outputs.mode_${m}`)}</button>`).join("")}
        </div>
        <button type="button" class="out-close" title="${this._t("outputs.close")}">${ICONS.close}</button>
      </div>
      <div class="out-hint">${this._t(`outputs.hint_${mode}`)}</div>
      <div class="out-body">${body}</div>
      ${this._renderOutFooter(mode)}
      <div class="out-info-pop" hidden></div>`;
    panel.querySelector(".out-body").scrollTop = scroll;
    this._outPanelSig = this._outputPanelSignature();
    if (!panel._mmlBound) {
      panel._mmlBound = true;
      this._bindOutputPanel(card, panel);
    }
    requestAnimationFrame(() => this._markTruncatedNames(panel));
  }

  /* The "i" button shows on tiles whose name is cut, or differs from the full name. */
  _markTruncatedNames(panel) {
    panel.querySelectorAll(".out-tile").forEach(tile => {
      const nameEl = tile.querySelector(".out-tile-name");
      const btn = tile.querySelector(".out-info");
      if (!nameEl || !btn) return;
      const cut = nameEl.scrollHeight > nameEl.clientHeight + 1 || nameEl.scrollWidth > nameEl.clientWidth + 1;
      if (cut || nameEl.textContent !== nameEl.dataset.full) btn.hidden = false;
    });
  }

  _renderOutTile(eid, { selected = false, disabled = false, reason = "", sub = "", action = "", extra = "" } = {}) {
    const st = this._hass?.states[eid];
    const info = this._outputInfo(eid);
    const offline = !st || st.state === "unavailable" || info?.available === false;
    const off = !offline && (st.state === "off" || info?.powered === false);
    const playing = st?.state === "playing";
    const name = this._outputName(eid);
    const full = this._outputFullName(eid);
    const isLeader = (info?.members || []).length > 0;
    const cls = ["out-tile", selected && "sel", (disabled || offline) && "disabled", playing && "playing", off && "off"].filter(Boolean).join(" ");
    return `
      <div class="${cls}" data-eid="${this._esc(eid)}" data-action="${action}" title="${this._esc(reason || full)}"${disabled || offline ? ' aria-disabled="true"' : ""}>
        <div class="out-tile-icon">
          <ha-icon icon="${this._esc(this._outputIcon(eid))}"></ha-icon>
          ${playing ? `<span class="out-eq"><i></i><i></i><i></i></span>` : ""}
          ${isLeader ? `<span class="out-crown" title="${this._t("outputs.leader")}">${ICONS.crown}</span>` : ""}
        </div>
        <div class="out-tile-name" data-full="${this._esc(full)}">${this._esc(name)}</div>
        <div class="out-tile-sub">${this._esc(reason || sub || this._stateLabel(eid))}</div>
        ${selected ? `<span class="out-check">${ICONS.check}</span>` : ""}
        <button type="button" class="out-info" data-info="${this._esc(eid)}" title="${this._t("outputs.details")}" hidden>${ICONS.info}</button>
        ${off && info?.can_power ? `<button type="button" class="out-power" data-power="${this._esc(eid)}" title="${this._t("outputs.power_on")}">${ICONS.power}</button>` : ""}
        ${extra}
      </div>`;
  }

  _renderPresetChips(mode) {
    if (!this._presets?.length) return "";
    return `
      <div class="out-section-title">${this._t("outputs.presets")}</div>
      <div class="out-presets">
        ${this._presets.map(p => `
          <span class="out-chip" data-preset="${this._esc(p.id)}" title="${this._esc([p.leader, ...p.members].map(id => this._outputName(id)).join(" + "))}">
            ${ICONS.star}<span>${this._esc(p.name)}</span>
            ${mode === "group" ? `<button type="button" class="out-chip-del" data-del-preset="${this._esc(p.id)}" title="${this._t("outputs.delete_preset")}">${ICONS.close}</button>` : ""}
          </span>`).join("")}
      </div>`;
  }

  _renderOfflineToggle() {
    const offline = this._panelOutputIds({ includeOffline: true }).filter(id => this._hass.states[id]?.state === "unavailable");
    if (!offline.length) return "";
    return `<button type="button" class="out-link" data-toggle-offline>${this._showOffline ? this._t("outputs.hide_offline") : this._tf("outputs.show_offline", { n: offline.length })}</button>`;
  }

  _renderOutSwitch() {
    const src = this._activePlayer;
    if (!src) return `<div class="empty-state"><p>${this._t("outputs.no_outputs")}</p></div>`;
    const leader = this._groupLeaderOf(src);
    const group = [leader, ...this._groupMembersOf(leader)];
    const attr = this._hass?.states[leader]?.attributes || {};
    const nowPlaying = attr.media_title
      ? `${attr.media_title}${attr.media_artist ? ` — ${attr.media_artist}` : ""}`
      : this._t("outputs.nothing");
    const anchor = [...this._switchSel][0];
    const tiles = this._panelOutputIds({ includeOffline: this._showOffline }).map(eid => {
      const blocked = anchor && eid !== anchor && !this._canGroup(anchor, eid);
      return this._renderOutTile(eid, {
        selected: this._switchSel.has(eid),
        disabled: blocked,
        reason: blocked ? this._tf("outputs.cannot_group", { name: this._outputName(anchor) }) : "",
        sub: group.includes(eid) ? this._t("outputs.current") : "",
        action: "switch-toggle",
      });
    }).join("");
    return `
      <div class="out-section-title">${this._t("outputs.source")}</div>
      <div class="out-source">
        <div class="out-source-icons">${group.map(id => `<ha-icon icon="${this._esc(this._outputIcon(id))}"></ha-icon>`).join("")}</div>
        <div class="out-source-text">
          <div class="out-source-names">${this._esc(group.map(id => this._outputName(id)).join(" + "))}</div>
          <div class="out-source-np">${this._esc(nowPlaying)}</div>
        </div>
      </div>
      ${this._renderPresetChips("switch")}
      <div class="out-section-title">${this._t("outputs.to")}</div>
      <div class="out-grid">${tiles}</div>
      ${this._renderOfflineToggle()}`;
  }

  _renderOutGroup() {
    if (!this._activePlayer) return `<div class="empty-state"><p>${this._t("outputs.no_outputs")}</p></div>`;
    const leader = this._groupLeaderOf(this._activePlayer);
    const members = this._groupMembersOf(leader);
    const tiles = this._panelOutputIds({ includeOffline: this._showOffline }).filter(id => id !== leader).map(eid => {
      const inGroup = members.includes(eid);
      const canJoin = inGroup || this._canGroup(leader, eid);
      const otherLeader = this._outputInfo(eid)?.leader;
      return this._renderOutTile(eid, {
        selected: inGroup,
        disabled: !canJoin,
        reason: canJoin ? "" : this._tf("outputs.cannot_group", { name: this._outputName(leader) }),
        sub: inGroup ? this._t("outputs.in_group")
          : otherLeader && otherLeader !== leader ? this._tf("outputs.member_of", { name: this._outputName(otherLeader) }) : "",
        action: "group-toggle",
      });
    }).join("");
    return `
      <div class="out-section-title">${this._tf("outputs.group_of", { name: this._esc(this._outputName(leader)) })}</div>
      <div class="out-grid">${tiles || `<div class="out-empty">${this._t("outputs.no_other_outputs")}</div>`}</div>
      ${this._renderOfflineToggle()}
      ${this._renderPresetChips("group")}
      ${this._renderOutVolumes(leader, members)}`;
  }

  _renderOutVolumes(leader, members) {
    const ids = [leader, ...members];
    const pct = (eid) => Math.round((this._hass?.states[eid]?.attributes?.volume_level ?? 0) * 100);
    const groupVol = Math.round(ids.reduce((sum, id) => sum + pct(id), 0) / ids.length);
    const row = (eid, label, isGroup = false) => {
      const muted = !isGroup && this._hass?.states[eid]?.attributes?.is_volume_muted;
      const value = isGroup ? groupVol : pct(eid);
      return `
        <div class="out-vol-row${isGroup ? " group" : ""}">
          <span class="out-vol-name" title="${this._esc(isGroup ? label : this._outputFullName(eid))}">${this._esc(label)}</span>
          ${isGroup ? `<span class="out-vol-icon">${ICONS.group}</span>` : `<button type="button" class="out-mute${muted ? " on" : ""}" data-mute="${this._esc(eid)}" title="${this._t("btns.mute")}">${muted ? ICONS.volumeMute : ICONS.volumeHigh}</button>`}
          <input type="range" min="0" max="100" value="${value}" ${isGroup ? `data-group-vol="${this._esc(eid)}"` : `data-vol="${this._esc(eid)}"`}>
          <span class="out-vol-pct">${value}%</span>
        </div>`;
    };
    return `
      <div class="out-section-title">${this._t("outputs.volumes")}</div>
      <div class="out-volumes">
        ${members.length ? row(leader, this._t("outputs.group_volume"), true) : ""}
        ${ids.map(id => row(id, this._outputName(id))).join("")}
      </div>`;
  }

  _renderOutControl() {
    const ids = this._panelOutputIds({ includeOffline: this._showOffline });
    const leaders = ids.filter(id => !this._outputInfo(id)?.leader);
    const isActive = (id) => ["playing", "paused"].includes(this._hass?.states[id]?.state);
    const sessions = leaders.filter(isActive);
    const others = leaders.filter(id => !isActive(id));
    const activeLeader = this._activePlayer ? this._groupLeaderOf(this._activePlayer) : null;
    const pinned = this._loadPref("mml_default_player");
    const pinBtn = (eid) => `<button type="button" class="out-pin${pinned === eid ? " on" : ""}" data-pin="${this._esc(eid)}" title="${this._t(pinned === eid ? "outputs.unpin" : "outputs.pin")}">${ICONS.pin}</button>`;
    const sessionRow = (eid) => {
      const a = this._hass.states[eid].attributes || {};
      const group = [eid, ...this._groupMembersOf(eid)];
      const art = a.entity_picture
        ? `<img src="${this._esc(this._resolveImageUrl(a.entity_picture))}" alt="" loading="lazy">`
        : `<ha-icon icon="${this._esc(this._outputIcon(eid))}"></ha-icon>`;
      const np = a.media_title ? `${a.media_title}${a.media_artist ? ` — ${a.media_artist}` : ""}` : this._stateLabel(eid);
      return `
        <div class="out-session${eid === activeLeader ? " active" : ""}" data-eid="${this._esc(eid)}" data-action="control">
          <div class="out-session-art">${art}</div>
          <div class="out-session-text">
            <div class="out-session-names">${this._esc(group.map(id => this._outputName(id)).join(" + "))}</div>
            <div class="out-session-np">${this._hass.states[eid].state === "playing" ? ICONS.play : ICONS.pause}<span>${this._esc(np)}</span></div>
          </div>
          ${pinBtn(eid)}
        </div>`;
    };
    const othersHa = this._config.show_other_players
      ? this._panelOutputIds({ includeOthers: true }).filter(id => !this._hass.states[id].attributes?.mass_player_id)
      : [];
    return `
      <div class="out-section-title">${this._t("outputs.sessions")}</div>
      ${sessions.length ? `<div class="out-sessions">${sessions.map(sessionRow).join("")}</div>` : `<div class="out-empty">${this._t("outputs.no_sessions")}</div>`}
      ${others.length ? `
        <div class="out-section-title">${this._t("outputs.other_outputs")}</div>
        <div class="out-grid">${others.map(eid => this._renderOutTile(eid, { selected: eid === activeLeader, action: "control", extra: pinBtn(eid) })).join("")}</div>` : ""}
      ${this._renderOfflineToggle()}
      ${othersHa.length ? `
        <div class="out-section-title">${this._t("outputs.other_players")}</div>
        <div class="out-grid">${othersHa.map(eid => this._renderOutTile(eid, { selected: eid === this._activePlayer, action: "control" })).join("")}</div>` : ""}`;
  }

  _renderOutFooter(mode) {
    if (mode === "switch") {
      const sel = [...this._switchSel];
      const leader = this._activePlayer ? this._groupLeaderOf(this._activePlayer) : null;
      const current = leader ? [leader, ...this._groupMembersOf(leader)] : [];
      const unchanged = sel.length === current.length && sel.every(id => current.includes(id)) && sel.includes(leader);
      const label = !sel.length ? this._t("outputs.select_hint")
        : sel.length === 1 ? this._tf("outputs.switch_to_one", { name: this._outputName(sel[0]) })
          : this._tf("outputs.switch_to_many", { n: sel.length });
      return `<div class="out-foot"><button type="button" class="out-primary" data-do-switch ${!sel.length || unchanged ? "disabled" : ""}>${this._esc(label)}</button></div>`;
    }
    if (mode === "group") {
      const leader = this._activePlayer ? this._groupLeaderOf(this._activePlayer) : null;
      if (!leader) return "";
      const members = this._groupMembersOf(leader);
      if (this._presetEditing) {
        return `
          <div class="out-foot">
            <input type="text" class="out-preset-input" maxlength="40" placeholder="${this._t("outputs.preset_name")}">
            <button type="button" class="out-primary" data-save-preset>${this._t("outputs.save")}</button>
            <button type="button" class="out-secondary" data-cancel-preset>${this._t("outputs.cancel")}</button>
          </div>`;
      }
      return `
        <div class="out-foot">
          <button type="button" class="out-secondary" data-edit-preset ${members.length ? "" : "disabled"}>${ICONS.star} ${this._t("outputs.save_preset")}</button>
          <button type="button" class="out-secondary danger" data-dissolve ${members.length ? "" : "disabled"}>${this._t("outputs.dissolve")}</button>
        </div>`;
    }
    return "";
  }

  _bindOutputPanel(card, panel) {
    const pop = () => panel.querySelector(".out-info-pop");
    panel.addEventListener("pointerdown", (e) => {
      if (e.target.matches('input[type="range"]')) this._outDragging = true;
    });
    panel.addEventListener("input", (e) => {
      const pct = e.target.closest(".out-vol-row")?.querySelector(".out-vol-pct");
      if (pct && e.target.matches('input[type="range"]')) pct.textContent = `${e.target.value}%`;
    });
    panel.addEventListener("change", (e) => {
      const t = e.target;
      if (!t.matches('input[type="range"]')) return;
      this._outDragging = false;
      if (t.dataset.vol) {
        this._hass.callService("media_player", "volume_set", { entity_id: t.dataset.vol, volume_level: Number(t.value) / 100 });
      } else if (t.dataset.groupVol) {
        this._outputAction({ action: "group_volume", leader: t.dataset.groupVol, volume: Number(t.value) }, { reload: false });
      }
    });
    panel.addEventListener("click", (e) => {
      const t = e.target;
      const popEl = pop();
      if (popEl && !popEl.hidden && !t.closest(".out-info-pop") && !t.closest(".out-info")) popEl.hidden = true;
      const btn = (sel) => t.closest(sel);
      let el;
      if ((el = btn(".out-mode"))) {
        this._outputMode = el.dataset.mode;
        this._switchSel = new Set();
        this._presetEditing = false;
        this._renderOutputPanel(card);
      } else if (btn(".out-close")) {
        this._closeOutputPanel(card);
      } else if ((el = btn(".out-info"))) {
        e.stopPropagation();
        this._showOutputInfo(panel, el);
      } else if ((el = btn(".out-power"))) {
        e.stopPropagation();
        this._outputAction({ action: "power", player: el.dataset.power, powered: true });
      } else if ((el = btn(".out-pin"))) {
        e.stopPropagation();
        const eid = el.dataset.pin;
        if (this._loadPref("mml_default_player") === eid) this._removePref("mml_default_player");
        else this._savePref("mml_default_player", eid);
        this._renderOutputPanel(card);
      } else if ((el = btn(".out-mute"))) {
        const eid = el.dataset.mute;
        this._hass.callService("media_player", "volume_mute", { entity_id: eid, is_volume_muted: !this._hass.states[eid]?.attributes?.is_volume_muted });
      } else if ((el = btn(".out-chip-del"))) {
        e.stopPropagation();
        const preset = this._presets.find(p => p.id === el.dataset.delPreset);
        if (preset && confirm(this._tf("outputs.delete_preset_confirm", { name: preset.name }))) {
          this._outputAction({ action: "delete_preset", id: preset.id });
        }
      } else if ((el = btn(".out-chip"))) {
        this._applyPreset(card, this._presets.find(p => p.id === el.dataset.preset));
      } else if (btn("[data-toggle-offline]")) {
        this._showOffline = !this._showOffline;
        this._renderOutputPanel(card);
      } else if (btn("[data-do-switch]")) {
        this._doSwitch(card);
      } else if (btn("[data-edit-preset]")) {
        this._presetEditing = true;
        this._renderOutputPanel(card);
        panel.querySelector(".out-preset-input")?.focus();
      } else if (btn("[data-cancel-preset]")) {
        this._presetEditing = false;
        this._renderOutputPanel(card);
      } else if (btn("[data-save-preset]")) {
        this._saveCurrentGroupAsPreset(card, panel.querySelector(".out-preset-input")?.value || "");
      } else if (btn("[data-dissolve]")) {
        const leader = this._groupLeaderOf(this._activePlayer);
        this._outputAction({ action: "set_members", leader, remove: this._groupMembersOf(leader) });
      } else if ((el = btn(".out-tile, .out-session"))) {
        if (el.getAttribute("aria-disabled") === "true") return;
        this._onOutputTileClick(card, el.dataset.action, el.dataset.eid);
      }
    });
    panel.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.matches(".out-preset-input")) this._saveCurrentGroupAsPreset(card, e.target.value);
      if (e.key === "Escape") this._closeOutputPanel(card);
    });
  }

  _onOutputTileClick(card, action, eid) {
    if (action === "switch-toggle") {
      if (this._switchSel.has(eid)) this._switchSel.delete(eid);
      else this._switchSel.add(eid);
      this._renderOutputPanel(card);
    } else if (action === "group-toggle") {
      const leader = this._groupLeaderOf(this._activePlayer);
      const inGroup = this._groupMembersOf(leader).includes(eid);
      this._outputAction({ action: "set_members", leader, [inGroup ? "remove" : "add"]: [eid] });
    } else if (action === "control") {
      this._setActivePlayerTo(eid);
      this._closeOutputPanel(card);
    }
  }

  async _doSwitch(card) {
    const targets = [...this._switchSel];
    if (!targets.length || !this._activePlayer) return;
    const source = this._groupLeaderOf(this._activePlayer);
    const ok = await this._outputAction({ action: "transfer", source, targets });
    if (!ok) return;
    const names = targets.map(id => this._outputName(id)).join(" + ");
    this._showToast(this._tf("outputs.switched", { name: names }));
    // Control follows the music: the new group's leader (the source when it stays in).
    this._setActivePlayerTo(targets.includes(source) ? source : targets[0]);
    this._closeOutputPanel(card);
  }

  _applyPreset(card, preset) {
    if (!preset) return;
    const wanted = [preset.leader, ...preset.members].filter(id => this._isOfferedOutput(id));
    if (this._outputMode === "switch") {
      this._switchSel = new Set(wanted);
      this._renderOutputPanel(card);
    } else if (this._outputMode === "group") {
      const leader = this._groupLeaderOf(this._activePlayer);
      const members = this._groupMembersOf(leader);
      const add = wanted.filter(id => id !== leader && !members.includes(id) && this._canGroup(leader, id));
      const remove = members.filter(id => !wanted.includes(id));
      if (add.length || remove.length) this._outputAction({ action: "set_members", leader, add, remove });
    }
  }

  async _saveCurrentGroupAsPreset(card, name) {
    name = name.trim();
    if (!name) return;
    const leader = this._groupLeaderOf(this._activePlayer);
    const ok = await this._outputAction({ action: "save_preset", name, leader, members: this._groupMembersOf(leader) });
    if (ok) {
      this._presetEditing = false;
      this._showToast(this._tf("outputs.preset_saved", { name }));
    }
  }

  _showOutputInfo(panel, btn) {
    const eid = btn.dataset.info;
    const info = this._outputInfo(eid);
    const pop = panel.querySelector(".out-info-pop");
    if (!pop) return;
    const rows = [
      [this._t("outputs.info_entity"), eid],
      [this._t("outputs.info_area"), this._outputArea(eid)],
      [this._t("outputs.info_model"), [info?.manufacturer, info?.model].filter(Boolean).join(" ")],
      [this._t("outputs.info_provider"), info?.provider],
      [this._t("outputs.info_state"), this._stateLabel(eid)],
    ].filter(([, v]) => v);
    pop.innerHTML = `
      <div class="out-info-title">${this._esc(this._outputFullName(eid))}</div>
      ${rows.map(([k, v]) => `<div class="out-info-row"><span>${this._esc(k)}</span><span>${this._esc(v)}</span></div>`).join("")}`;
    pop.hidden = false;
    const r = btn.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const width = Math.min(260, pr.width - 16);
    pop.style.width = `${width}px`;
    pop.style.left = `${Math.max(8, Math.min(r.right - pr.left - width, pr.width - width - 8))}px`;
    const below = r.bottom - pr.top + 6;
    pop.style.top = `${below + pop.offsetHeight > pr.height ? Math.max(8, r.top - pr.top - pop.offsetHeight - 6) : below}px`;
  }

  async _outputAction(body, { reload = true } = {}) {
    try {
      await this._callIntegration("POST", "outputs", body);
      return true;
    } catch (err) {
      let msg = err?.message || String(err);
      try { msg = JSON.parse(msg.replace(/^\d+:\s*/, "")).message || msg; } catch (_) { /* plain text */ }
      this._showToast(this._tf("outputs.action_failed", { msg }));
      return false;
    } finally {
      if (reload) this._loadOutputs();
    }
  }

  /* ── Settings ── */
  _openSettings(card) {
    const modal = card.querySelector("#settings-modal");
    const content = card.querySelector("#settings-content");
    content.innerHTML = this._buildSettingsContent();
    this._attachSettingsListeners(content, card);
    modal.classList.add("open");
  }

  _closeSettings(card) {
    card.querySelector("#settings-modal").classList.remove("open");
  }

  _buildSettingsContent() {
    const debugBanner = this._debugMode ? `
      <div class="settings-debug-banner">
        <span class="settings-debug-dot"></span>
        <div>
          <strong>${this._t("settings.debug_active")}</strong>
          <p class="settings-hint" style="margin:4px 0 0">${this._t("settings.debug_hint")}</p>
        </div>
      </div>` : "";

    if (this._maProviders.length === 0) {
      return `${debugBanner}<p style="color:var(--text2);font-size:13px;padding:8px 0;opacity:.7">${this._t("settings.providers_empty")}</p>`;
    }
    const rows = this._maProviders.map(p => {
      const key = p.instance_id || p.domain;
      const enabled = this._enabledProviders === null || this._enabledProviders.has(key);
      return `
        <div class="provider-item">
          <span class="provider-name">${this._esc(p.name || p.domain)}</span>
          <label class="toggle-switch">
            <input type="checkbox" data-provider="${this._esc(key)}"${enabled ? " checked" : ""}>
            <span class="toggle-track"></span>
          </label>
        </div>`;
    }).join("");
    return `
      ${debugBanner}
      <div class="settings-section-title">${this._t("settings.providers_title")}</div>
      <p class="settings-hint">${this._t("settings.providers_hint")}</p>
      ${rows}`;
  }

  _attachSettingsListeners(content, card) {
    content.querySelectorAll("input[data-provider]").forEach(input => {
      input.addEventListener("change", () => {
        const key = input.dataset.provider;
        if (this._enabledProviders === null) {
          this._enabledProviders = new Set(this._maProviders.map(p => p.instance_id || p.domain));
        }
        if (input.checked) {
          this._enabledProviders.add(key);
        } else {
          this._enabledProviders.delete(key);
        }
        if (this._enabledProviders.size >= this._maProviders.length) {
          this._enabledProviders = null;
        }
        this._savePref("mml_providers", this._enabledProviders ? JSON.stringify([...this._enabledProviders]) : "");
        const activeTabDef = this._resolvedTabs?.find(t => t.id === this._tab);
        if (activeTabDef?.type === "discovery") {
          this._discoveryLoadedTabs.delete(this._tab);
          this._loadDiscovery(this._tab);
        } else {
          this._reloadLibrary();
        }
      });
    });
  }

  _savePlayer(entityId) {
    try { localStorage.setItem("mml_active_player", entityId); } catch (_) {}
  }

  _loadSavedPlayer() {
    try { return localStorage.getItem("mml_active_player"); } catch (_) { return null; }
  }

  _savePref(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  _loadPref(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  _removePref(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }

  _applyQueueVisibility(card) {
    const qs = card.querySelector("#queue-section");
    const btn = card.querySelector("#btn-queue-toggle");
    const backdrop = card.querySelector("#queue-backdrop");
    if (this._isMobile) {
      if (qs) qs.classList.toggle("mml-queue-open", this._queueVisible);
      if (backdrop) backdrop.classList.toggle("open", this._queueVisible);
    } else {
      if (qs) qs.style.display = this._queueVisible ? "" : "none";
    }
    if (btn) btn.classList.toggle("active", this._queueVisible);
  }

  /* ── Search ── */
  async _doSearch(card) {
    if (!this._hass) return;

    const id = ++this._searchId;
    const query = this._searchQuery;
    this._debugLog("Search start:", query, "id:", id);

    this._searchLoading = true;
    const resultsEl = card.querySelector("#search-results");
    resultsEl.innerHTML = `<div class="loader"><div class="spinner"></div> ${this._t("search.searching")}</div>`;

    let results = null;

    {
      const strategies = ["HA proxy", "HA proxy (library)"];
      const candidates = [
        this._searchViaHaProxy(query),
        this._searchViaHaProxy(query, { libraryOnly: true }),
      ];
      this._debugLog("Search strategies:", strategies.join(", "));

      const settled = await Promise.allSettled(candidates);
      const buckets = settled.map((s, i) => {
        if (s.status === "fulfilled" && s.value) {
          this._debugLog(`Search strategy ${strategies[i]}: has results`);
          return s.value;
        }
        this._debugLog(`Search strategy ${strategies[i]}: ${s.status === "rejected" ? "rejected" : "null"}`);
        return null;
      });

      for (const b of buckets) {
        if (!b) continue;
        results = results ? this._mergeSearchResults(results, b) : b;
      }
    }

    if (!results) {
      this._debugLog("Search: all strategies failed");
      results = {
        tracks: [], artists: [], albums: [], playlists: [],
        error: this._t("search.unavailable"),
      };
    }

    if (id !== this._searchId) return;

    this._debugLog("Search results:", { tracks: results.tracks?.length, artists: results.artists?.length, albums: results.albums?.length, playlists: results.playlists?.length });
    this._searchResults = results;
    this._searchLoading = false;
    this._renderSearchResults(card, this._searchResults);
  }

  /* Search via HA proxy endpoint /my_music_library/search
     The HA backend calls MA server-side → no CORS, works from HTTPS. */
  async _searchViaHaProxy(query, { libraryOnly = false } = {}) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const extra = libraryOnly ? "&library_only=true" : "";
      const data = await this._callIntegration(
        "GET",
        `search?query=${encodedQuery}&limit=100${extra}`
      );
      if (!data) return null;
      const results = this._parseMaWsSearchResults(data);
      return results;
    } catch (e) {
      return null;
    }
  }

  _makeThumbUrl(rawPath) {
    if (!rawPath) return null;
    if (rawPath.startsWith("/my_music_library/thumb")) return rawPath;
    return `/my_music_library/thumb?path=${encodeURIComponent(rawPath)}`;
  }

  /* Parse the result of music_assistant/search WebSocket command.
     MA returns either a flat {tracks,artists,albums,playlists} or
     a nested {results: {tracks,...}}. */
  _parseMaWsSearchResults(data) {
    const out = { tracks: [], artists: [], albums: [], playlists: [] };
    const root = data?.results || data || {};
    const map = { tracks: "track", artists: "artist", albums: "album", playlists: "playlist" };
    for (const [key, type] of Object.entries(map)) {
      const items = root[key] || [];
      for (const item of items) {
        const rawThumb = item.thumbnail || item.metadata?.images?.[0]?.path || item.image?.path || (typeof item.image === "string" ? item.image : null) || null;
        out[key].push({
          id: item.uri || item.item_id || "",
          type,
          title: item.name || item.title || "",
          subtitle: item.artists?.[0]?.name || item.artist?.name || item.owner_name || "",
          thumbnail: this._makeThumbUrl(rawThumb),
          can_play: true,
        });
      }
    }
    // Return null if all buckets empty (probably wrong format, try next strategy)
    const total = Object.values(out).reduce((s, a) => s + a.length, 0);
    return total > 0 ? out : null;
  }

  _mergeSearchResults(a, b) {
    const merged = { tracks: [], artists: [], albums: [], playlists: [] };
    for (const key of Object.keys(merged)) {
      const items = [...(a[key] || [])];
      const seen = new Set(items.map(i => `${(i.id || "").toLowerCase()}|${(i.title || "").toLowerCase()}`));
      for (const item of b[key] || []) {
        const k = `${(item.id || "").toLowerCase()}|${(item.title || "").toLowerCase()}`;
        if (!seen.has(k)) { seen.add(k); items.push(item); }
      }
      merged[key] = items;
    }
    return merged;
  }

  _renderSearchResults(card, results) {
    const el = card.querySelector("#search-results");
    if (!results) {
      el.innerHTML = `<div class="empty-state">${ICONS.search}<p>${this._t("search.type_hint")}</p></div>`;
      return;
    }
    if (results.error) {
      el.innerHTML = `<div class="empty-state">${ICONS.search}
        <p>${this._t("search.unavailable")}</p>
        <p style="font-size:12px;margin-top:6px;opacity:.7">${this._t("search.player_label")}: <b>${this._activePlayer || "—"}</b></p>
        <p style="font-size:11px;margin-top:4px;opacity:.5;word-break:break-word">${this._esc(results.error)}</p>
        <p style="font-size:11px;margin-top:8px;opacity:.5">${this._t("search.console_hint")}</p>
      </div>`;
      return;
    }

    const searchTab = this._resolvedTabs.find(t => t.type === "search");
    const useColumns = searchTab?.search_layout === "columns";

    const INITIAL_CARDS = 15;
    const INITIAL_LIST = 20;
    const LAZY_BATCH = 30;

    const sections = [
      { key: "artists",   label: this._t("search.artists"),   icon: "artist",   card: true },
      { key: "albums",    label: this._t("search.albums"),    icon: "album",    card: true },
      { key: "tracks",    label: this._t("search.tracks"),    icon: "music",    card: false },
      { key: "playlists", label: this._t("search.playlists"), icon: "playlist", card: true },
    ];

    const populated = sections.filter(s => (results[s.key] || []).length > 0);
    if (populated.length === 0) {
      el.innerHTML = `<div class="empty-state">${ICONS.search}<p>${this._t("search.no_results")} « ${this._searchQuery} »</p></div>`;
      return;
    }

    el.innerHTML = "";

    if (useColumns) {
      const wrapper = document.createElement("div");
      wrapper.className = "search-columns";
      for (const { key, label, icon: iconName } of populated) {
        const items = results[key] || [];
        const col = document.createElement("div");
        col.className = "search-column";
        col.innerHTML = `<div class="search-section-title">${label}</div>`
          + items.map(i => this._renderResultItem(i, iconName)).join("");
        wrapper.appendChild(col);
      }
      el.appendChild(wrapper);
      this._attachItemActions(el);
    } else {
      const lazyState = [];
      for (const { key, label, icon: iconName, card: isCard } of populated) {
        const allItems = results[key] || [];
        const initial = isCard ? INITIAL_CARDS : INITIAL_LIST;
        const shown = allItems.slice(0, initial);
        const remaining = allItems.slice(initial);
        const secEl = document.createElement("div");
        secEl.className = "search-section";
        if (isCard) {
          secEl.innerHTML = `<div class="search-section-title">${label}</div>
            <div class="lib-scroll">${shown.map(i => this._renderSearchCard(i, iconName)).join("")}</div>`;
        } else {
          secEl.innerHTML = `<div class="search-section-title">${label}</div>`
            + shown.map(i => this._renderResultItem(i, iconName)).join("");
        }
        el.appendChild(secEl);
        if (remaining.length > 0) {
          lazyState.push({ el: secEl, items: remaining, iconName, isCard, loaded: 0 });
        }
      }
      this._attachItemActions(el);

      if (lazyState.length > 0) {
        const scrollContainer = el.closest(".tab-panel") || el.parentElement;
        const onScroll = () => {
          let allDone = true;
          for (const st of lazyState) {
            if (st.loaded >= st.items.length) continue;
            const rect = st.el.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();
            if (rect.bottom < containerRect.bottom + 200) {
              const batch = st.items.slice(st.loaded, st.loaded + LAZY_BATCH);
              st.loaded += batch.length;
              if (st.isCard) {
                const scroll = st.el.querySelector(".lib-scroll");
                if (scroll) scroll.insertAdjacentHTML("beforeend", batch.map(i => this._renderSearchCard(i, st.iconName)).join(""));
              } else {
                st.el.insertAdjacentHTML("beforeend", batch.map(i => this._renderResultItem(i, st.iconName)).join(""));
              }
              this._attachItemActions(st.el);
            }
            if (st.loaded < st.items.length) allDone = false;
          }
          if (allDone) scrollContainer.removeEventListener("scroll", onScroll);
        };
        scrollContainer.addEventListener("scroll", onScroll, { passive: true });
      }
    }
  }

  _renderResultItem(item, iconName) {
    const thumb = item.thumbnail
      ? `<img class="result-thumb" src="${this._resolveImageUrl(item.thumbnail)}" alt="" loading="lazy">`
      : `<div class="result-thumb-placeholder">${ICONS[iconName] || ICONS.music}</div>`;
    const queueType = item.type === "track" || iconName === "music" ? "track" : item.type;
    const canQueue = ["track", "music", "album", "playlist", "artist"].includes(queueType);
    return `
      <div class="result-item">
        ${thumb}
        <div class="result-info">
          <div class="result-title">${this._esc(item.title)}</div>
          ${item.subtitle ? `<div class="result-sub">${this._esc(item.subtitle)}</div>` : ""}
        </div>
        ${canQueue ? `<button class="add-queue-btn" data-queue-id="${this._esc(item.id)}" data-queue-type="${this._esc(queueType)}" title="${this._t("queue.add_to_end")}">${ICONS.plus}</button>` : ""}
        ${item.can_play ? `<button class="result-play" data-action="play" data-id="${this._esc(item.id)}" data-type="${this._esc(item.type)}" title="${this._t("btns.play")}">${ICONS.play}</button>` : ""}
      </div>`;
  }

  /* ── Library ── */

  _getLibTabState(tabId) {
    const id = tabId || this._tab;
    if (!this._libTabState[id]) {
      this._libTabState[id] = {
        source: this._loadPref(`mml_lib_source_${id}`) || this._loadPref("mml_lib_source") || "all",
        browse: false,
        browseStack: [],
      };
    }
    return this._libTabState[id];
  }

  get _libSourceFilter() { return this._getLibTabState()?.source || "all"; }
  set _libSourceFilter(v) { this._getLibTabState().source = v; }
  get _libBrowseMode() { return this._getLibTabState()?.browse || false; }
  set _libBrowseMode(v) { this._getLibTabState().browse = v; }
  get _browseStack() { return this._getLibTabState()?.browseStack || []; }
  set _browseStack(v) { this._getLibTabState().browseStack = v; }

  static _LOCAL_PROVIDERS = ["filesystem_local", "filesystem_smb", "filesystem_nfs", "plex"];

  _isLocalProvider(domain) {
    return MyMusicLibraryCard._LOCAL_PROVIDERS.some(p => domain.startsWith(p));
  }

  /* Recommendation folders (used by both the library tab's opt-in "discover"
     sections and the standalone Discovery tab) can carry a provider — respect
     the same enabled-providers filter as everything else. */
  _isProviderFolder(f) {
    const p = f.provider_instance || f.provider_domain || "";
    return p && p !== "library" && p !== "builtin";
  }

  _matchFolderProvider(key) {
    if (!key || key === "library" || key === "builtin") return true;
    if (this._enabledProviders.has(key)) return true;
    return [...this._enabledProviders].some(ep => ep.startsWith(key + "_") || key.startsWith(ep.split("--")[0] + "--") || ep === key);
  }

  _isFolderEnabled(f) {
    if (!this._isProviderFolder(f)) return true;
    if (this._enabledProviders === null) return true;
    const inst = f.provider_instance || f.provider_domain || "";
    return this._matchFolderProvider(inst);
  }

  /* Resolve a per-item icon for mixed-type collections (recommendation folders
     can contain artists, albums, playlists, radios and tracks side by side). */
  _itemIcon(item) {
    const t = (item.media_content_type || "").toLowerCase();
    if (t.includes("artist")) return "artist";
    if (t.includes("album")) return "album";
    if (t.includes("playlist")) return "playlist";
    if (t.includes("radio")) return "radio";
    if (t === "track") return "music";
    return "music";
  }

  _filterLibItems(items) {
    let result = items;

    const _itemUri = (item) => item.media_content_id || item.uri || "";

    if (this._libSourceFilter !== "all") {
      result = result.filter(item => {
        const provs = item.providers || [];
        if (provs.length === 0) {
          const uri = _itemUri(item);
          const scheme = uri.includes("://") ? uri.split("://")[0] : "";
          if (this._libSourceFilter === "local") return this._isLocalProvider(scheme);
          return scheme && !this._isLocalProvider(scheme);
        }
        if (this._libSourceFilter === "local") return provs.some(p => this._isLocalProvider(p));
        return provs.some(p => !this._isLocalProvider(p));
      });
    }

    if (this._enabledProviders !== null && this._enabledProviders.size > 0) {
      const _matchesAnyProvider = (key) => {
        if (this._enabledProviders.has(key)) return true;
        return [...this._enabledProviders].some(ep => ep.startsWith(key + "_") || ep === key);
      };
      const before = result.length;
      result = result.filter(item => {
        const keys = (item.provider_instances?.length ? item.provider_instances : item.providers) || [];
        const filtered = keys.filter(k => k !== "builtin" && k !== "library");
        if (filtered.length === 0) {
          const scheme = _itemUri(item).split("://")[0];
          if (!scheme || scheme === "builtin" || scheme === "library") return true;
          return _matchesAnyProvider(scheme);
        }
        return filtered.some(k => this._enabledProviders.has(k) || _matchesAnyProvider(k));
      });
      this._debugLog("Provider filter:", before, "→", result.length,
        "| enabled:", [...this._enabledProviders]);
    }

    result.sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" }));
    return result;
  }

  /* Returns list of enabled provider instance_ids when filtering is active, null otherwise. */
  _activeProviderFilter() {
    if (this._enabledProviders === null || this._enabledProviders.size === 0) return null;
    if (this._enabledProviders.size >= this._maProviders.length) return null;
    return [...this._enabledProviders];
  }

  /* Fetch library items for a section, querying per-provider when filter is active.
     Returns deduplicated items array. */
  async _fetchLibraryFiltered(type, limit, offset, favorite, providers) {
    if (!providers || providers.length === 0) {
      const r = await this._callIntegration("GET",
        `library?type=${type}&limit=${limit}&offset=${offset}&favorite=${favorite}`);
      return r?.items || [];
    }
    if (providers.length === 1) {
      const r = await this._callIntegration("GET",
        `library?type=${type}&limit=${limit}&offset=${offset}&favorite=${favorite}&provider=${encodeURIComponent(providers[0])}`);
      return r?.items || [];
    }
    const results = await Promise.all(providers.map(p =>
      this._callIntegration("GET",
        `library?type=${type}&limit=200&offset=0&favorite=${favorite}&provider=${encodeURIComponent(p)}`)
    ));
    const seen = new Set();
    const merged = [];
    for (const r of results) {
      for (const item of (r?.items || [])) {
        const key = item.media_content_id || item.title;
        if (!seen.has(key)) { seen.add(key); merged.push(item); }
      }
    }
    return merged;
  }

  _resolveLibLayout() {
    const libTab = this._resolvedTabs.find(t => t.id === this._tab && t.type === "library")
      || this._resolvedTabs.find(t => t.type === "library");
    const configLayout = libTab?.layout || "lanes";
    const sectionCount = (libTab?.sections || []).length;
    if (configLayout === "grid" && sectionCount > 1) return "lanes";
    if (configLayout !== "auto") return configLayout;
    if (sectionCount <= 1) return "grid";
    const isDesktop = window.matchMedia("(min-width: 640px) and (hover: hover)").matches;
    if (sectionCount <= 2) return isDesktop ? "columns" : "lanes";
    return "lanes";
  }

  _reloadLibrary() {
    this._libLoadedTabs.clear();
    const card = this.shadowRoot.querySelector(".card-root");
    if (card) {
      const panel = card.querySelector(`.tab-panel[data-panel="${this._tab}"]`);
      if (panel) {
        panel.querySelectorAll(".lib-filter-btn").forEach(b =>
          b.classList.toggle("active", b.dataset.source === this._libSourceFilter));
        const toggle = panel.querySelector(".browse-mode-toggle");
        if (toggle) {
          toggle.style.display = this._libSourceFilter === "local" ? "" : "none";
          toggle.querySelectorAll(".browse-mode-btn").forEach(b =>
            b.classList.toggle("active", (b.dataset.browse === "true") === this._libBrowseMode));
        }
      }
    }
    this._loadLibrary();
  }

  async _loadLibrary() {
    if (!this._hass) return;

    const card = this.shadowRoot.querySelector(".card-root");
    const activePanel = card?.querySelector(`.tab-panel[data-panel="${this._tab}"]`);
    const libEl = (activePanel || card)?.querySelector("#lib-content-inner");
    if (!libEl) return;

    this._libLoadedTabs.add(this._tab);
    this._debugLog("Library load start, browseMode:", this._libBrowseMode, "sourceFilter:", this._libSourceFilter);

    if (this._libBrowseMode) {
      const currentUri = this._browseStack.length ? this._browseStack[this._browseStack.length - 1].uri : null;
      return this._loadBrowse(currentUri, libEl);
    }
    this._libLoadId = (this._libLoadId || 0) + 1;
    const loadId = this._libLoadId;
    // The library only ever shows what you've favorited/saved in MA — browsing
    // the full catalogue is what Search (and the library's own Browse mode) is for.
    const favorite = true;
    const sourceFilter = this._libSourceFilter;
    const activeProviders = this._activeProviderFilter();

    const SECTION_META = {
      artists:          { icon: "artist" },
      albums:           { icon: "album" },
      playlists:        { icon: "playlist" },
      tracks:           { icon: "music" },
      radios:           { icon: "radio" },
      recently_played:  { icon: "history" },
      recently_added:   { icon: "newBox" },
      recommended:      { icon: "sparkle" },
      flows:            { icon: "wave" },
    };
    const DISCOVER_SECTIONS = ["recently_played", "recently_added", "recommended", "flows"];
    const DISCOVER_FOLDER_MAP = {
      recently_played: ["recently_played"],
      recently_added: ["recently_added_tracks", "recently_added_albums"],
      flows: null,
      recommended: null,
    };
    const libTab = this._resolvedTabs.find(t => t.id === this._tab && t.type === "library")
      || this._resolvedTabs.find(t => t.type === "library");
    const sectionKeys = libTab?.sections || ["artists", "albums", "playlists", "tracks"];
    const SECTIONS = sectionKeys.map(key => ({
      type: key,
      label: this._t(`lib.${key}`),
      icon: SECTION_META[key]?.icon || "music",
      favorite,
    }));
    const PAGE = 25;
    const MAX_PAGES = 8;

    const layout = this._resolveLibLayout();
    this._activeLibLayout = layout;

    libEl.innerHTML = `<div class="loader" id="lib-loader"><div class="spinner"></div> ${this._t("lib.loading")}</div>`;
    libEl.classList.toggle("lib-layout-columns", layout === "columns");
    this._libSections = {};

    const allDiscover = sectionKeys.every(k => DISCOVER_SECTIONS.includes(k));
    const filterBar = (activePanel || card)?.querySelector(".lib-filters");
    if (filterBar) {
      filterBar.style.display = allDiscover ? "none" : "";
    }

    // Helper: build section HTML (layout-aware)
    const isDiscoverSection = (type) => DISCOVER_SECTIONS.includes(type);
    const sectionHtml = (type, label, iconName, items) => {
      const isTrackList = iconName === "music";
      const itemsHtml = isTrackList
        ? items.map(i => this._renderLibListItem(i)).join("")
        : isDiscoverSection(type)
          ? items.map(i => this._renderLibCard(i, this._itemIcon(i))).join("")
          : items.map(i => this._renderLibCard(i, iconName)).join("");
      const sentinel = isTrackList
        ? `<div class="lib-sentinel-v" id="lib-sentinel-${type}"></div>`
        : `<div class="lib-sentinel" id="lib-sentinel-${type}"></div>`;

      let containerClass, containerId;
      if (isTrackList) {
        containerId = `lib-list-${type}`;
        containerClass = "";
      } else if (layout === "grid" || layout === "columns") {
        containerId = `lib-grid-${type}`;
        containerClass = "lib-grid";
      } else {
        containerId = `lib-scroll-${type}`;
        containerClass = "lib-scroll";
      }

      const inner = `<div class="${containerClass}" id="${containerId}">${itemsHtml}${sentinel}</div>`;

      const body = (layout === "lanes" && !isTrackList)
        ? `<div class="lib-lane-wrap">
             <button class="lib-lane-arrow left" data-lane="${type}" data-dir="left">${ICONS.chevronLeft}</button>
             ${inner}
             <button class="lib-lane-arrow right" data-lane="${type}" data-dir="right">${ICONS.chevronRight}</button>
           </div>`
        : inner;

      return `
        <div class="lib-section" id="lib-sec-${type}">
          <div class="lib-section-header">
            <span class="lib-section-title">${label}</span>
          </div>
          ${body}
        </div>`;
    };

    // Helper: append a section into its pre-created placeholder
    const appendSection = (type, label, iconName, items) => {
      if (loadId !== this._libLoadId) return; // stale load
      const loader = libEl.querySelector("#lib-loader");
      if (loader) loader.remove();

      const placeholder = libEl.querySelector(`#lib-slot-${type}`);
      if (!placeholder) return;
      placeholder.innerHTML = sectionHtml(type, label, iconName, items);

      const sec = placeholder.querySelector(`#lib-sec-${type}`);
      if (sec) this._attachItemActions(sec);
      if (layout === "lanes") this._attachLaneArrows(sec);
    };

    // Lazy-load recommendations: fetched once on first discover section, shared by all
    let _recPromise = null;
    const _getRecommendations = () => {
      if (_recPromise) return _recPromise;
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000));
      const fetcher = this._callIntegration("GET", "recommendations").then(d => d?.folders || []);
      _recPromise = Promise.race([fetcher, timeout]).catch(err => {
        this._debugLog("Recommendations fetch failed:", err);
        return [];
      });
      return _recPromise;
    };

    const _extractDiscoverItems = async (sectionType) => {
      const recFolders = await _getRecommendations();
      if (!recFolders || recFolders.length === 0) return [];
      const folders = recFolders.filter(f => this._isFolderEnabled(f));
      const mapping = DISCOVER_FOLDER_MAP[sectionType];
      if (Array.isArray(mapping)) {
        return folders
          .filter(f => mapping.includes(f.folder_id))
          .flatMap(f => f.items || []);
      }
      if (sectionType === "flows") {
        return folders
          .filter(f => {
            const id = (f.folder_id || "").toLowerCase();
            const name = (f.name || "").toLowerCase();
            return id.includes("flow") || name.includes("flow");
          })
          .flatMap(f => f.items || []);
      }
      const claimedIds = new Set();
      for (const [key, val] of Object.entries(DISCOVER_FOLDER_MAP)) {
        if (key === "recommended") continue;
        if (Array.isArray(val)) val.forEach(id => claimedIds.add(id));
      }
      return folders
        .filter(f => {
          if (claimedIds.has(f.folder_id)) return false;
          const id = (f.folder_id || "").toLowerCase();
          const name = (f.name || "").toLowerCase();
          if (id.includes("flow") || name.includes("flow")) return false;
          if (["random_artists", "random_albums", "recent_favorite_tracks", "favorite_playlists", "favorite_radio", "in_progress"].includes(f.folder_id)) return false;
          return true;
        })
        .flatMap(f => f.items || []);
    };

    // Fetch one section: first page in parallel, then lazy-paginate if source filter needs more
    const multiProvider = activeProviders && activeProviders.length > 1;
    const fetchSection = async (s) => {
      // Discover sections fetch recommendations lazily (with timeout, non-blocking for other sections)
      if (DISCOVER_SECTIONS.includes(s.type)) {
        try {
          const raw = await _extractDiscoverItems(s.type);
          if (loadId !== this._libLoadId) return;
          const items = this._filterLibItems(raw);
          if (items.length > 0) {
            this._libSections[s.type] = { offset: items.length, loading: false, exhausted: true, favorite: false, iconName: s.icon };
            appendSection(s.type, s.label, s.icon, items);
          } else {
            this._libSections[s.type] = { offset: 0, loading: false, exhausted: true, favorite: false, iconName: s.icon };
          }
        } catch (err) {
          this._debugLog("Discover section failed:", s.type, err);
          this._libSections[s.type] = { offset: 0, loading: false, exhausted: true, favorite: false, iconName: s.icon };
        }
        return;
      }
      let offset = 0;
      let exhausted = false;
      let pages = 0;
      let rendered = false;

      while (pages < MAX_PAGES && !exhausted) {
        if (loadId !== this._libLoadId) return; // stale load
        pages++;
        const raw = await this._fetchLibraryFiltered(s.type, PAGE, offset, s.favorite, activeProviders);
        offset += raw.length;
        if (raw.length < PAGE || multiProvider) exhausted = true;

        const filtered = this._filterLibItems(raw);

        const hasClientFilter = sourceFilter !== "all";

        if (filtered.length > 0 && !rendered) {
          this._libSections[s.type] = { offset, loading: false, exhausted, favorite: s.favorite, iconName: s.icon };
          appendSection(s.type, s.label, s.icon, filtered);
          rendered = true;
          if (!hasClientFilter || exhausted) break;
          continue;
        }

        if (filtered.length > 0 && rendered) {
          this._libSections[s.type].offset = offset;
          this._libSections[s.type].exhausted = exhausted;
          const isTrackList = s.icon === "music";
          const sentinel = libEl.querySelector(`#lib-sentinel-${s.type}`);
          const container = isTrackList
            ? libEl.querySelector(`#lib-list-${s.type}`)
            : (libEl.querySelector(`#lib-scroll-${s.type}`) || libEl.querySelector(`#lib-grid-${s.type}`));
          if (container && sentinel) {
            const tmp = document.createElement("div");
            tmp.innerHTML = filtered.map(i => isTrackList ? this._renderLibListItem(i) : this._renderLibCard(i, s.icon)).join("");
            while (tmp.firstChild) container.insertBefore(tmp.firstChild, sentinel);
            this._attachItemActions(container);
          }
          break;
        }

        if (!hasClientFilter || exhausted) break;
      }

      if (!this._libSections[s.type]) {
        this._libSections[s.type] = { offset, loading: false, exhausted: true, favorite: s.favorite, iconName: s.icon };
      }
    };

    // Pre-create ordered placeholders so parallel fetches render in config order
    if (layout === "columns") {
      const colsHtml = SECTIONS.map(s =>
        `<div class="lib-column" id="lib-slot-${s.type}"></div>`
      ).join("");
      const colsWrap = document.createElement("div");
      colsWrap.className = "lib-columns-wrap";
      colsWrap.innerHTML = colsHtml;
      libEl.appendChild(colsWrap);
    } else {
      for (const s of SECTIONS) {
        const slot = document.createElement("div");
        slot.id = `lib-slot-${s.type}`;
        libEl.appendChild(slot);
      }
    }

    // Launch all sections in parallel — each renders itself as soon as ready
    await Promise.allSettled(SECTIONS.map(s => fetchSection(s)));

    if (loadId !== this._libLoadId) return;

    // Clean up loader if still present (all sections empty)
    const loader = libEl.querySelector("#lib-loader");
    if (loader) loader.remove();

    if (!libEl.querySelector(".lib-section")) {
      libEl.innerHTML = `<div class="empty-state">${ICONS.library}
        <p>${this._t("lib.empty")}</p>
        <p style="font-size:11px;opacity:.6;margin-top:4px">${this._t("lib.empty_hint")}</p>
      </div>`;
    }

    this._attachLibInfiniteScroll(libEl);
    this._attachLibDirectionLock(libEl);
  }

  _attachLibDirectionLock(libEl) {
    if (!libEl || libEl._dirLockBound) return;
    libEl._dirLockBound = true;
    const THRESHOLD = 8;
    let startX = 0, startY = 0, locked = null;

    libEl.addEventListener("touchstart", (e) => {
      startX = e.touches[0].pageX;
      startY = e.touches[0].pageY;
      locked = null;
    }, { passive: true });

    libEl.addEventListener("touchmove", (e) => {
      if (locked) return;
      const dx = Math.abs(e.touches[0].pageX - startX);
      const dy = Math.abs(e.touches[0].pageY - startY);
      if (dx < THRESHOLD && dy < THRESHOLD) return;
      locked = dy >= dx ? "v" : "h";
      if (locked === "v") {
        libEl.querySelectorAll(".lib-scroll").forEach(el => el.classList.add("scroll-locked"));
      }
    }, { passive: true });

    libEl.addEventListener("touchend", () => {
      if (locked === "v") {
        libEl.querySelectorAll(".lib-scroll").forEach(el => el.classList.remove("scroll-locked"));
      }
      locked = null;
    }, { passive: true });
  }

  _attachLibInfiniteScroll(libEl) {
    const layout = this._activeLibLayout || "lanes";
    for (const [type, state] of Object.entries(this._libSections)) {
      if (state.iconName === "music") continue;
      if (layout === "lanes") {
        const scrollEl = libEl.querySelector(`#lib-scroll-${type}`);
        if (!scrollEl) continue;
        scrollEl.addEventListener("scroll", () => {
          const remaining = scrollEl.scrollWidth - scrollEl.scrollLeft - scrollEl.clientWidth;
          if (remaining < 300 && !state.loading && !state.exhausted) {
            this._loadMoreLibSection(type, libEl);
          }
        }, { passive: true });
      }
      if (layout === "grid" || layout === "columns") {
        const scrollParent = layout === "columns"
          ? libEl.querySelector(`#lib-slot-${type}`)
          : libEl;
        if (!scrollParent) continue;
        scrollParent.addEventListener("scroll", () => {
          const remaining = scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight;
          if (remaining < 300 && !state.loading && !state.exhausted) {
            this._loadMoreLibSection(type, libEl);
          }
        }, { passive: true });
      }
    }

    const tracksState = this._libSections["tracks"];
    if (tracksState) {
      const tracksScrollParent = (layout === "columns")
        ? (libEl.querySelector("#lib-slot-tracks") || libEl)
        : libEl;
      tracksScrollParent.addEventListener("scroll", () => {
        const remaining = tracksScrollParent.scrollHeight - tracksScrollParent.scrollTop - tracksScrollParent.clientHeight;
        if (remaining < 300 && !tracksState.loading && !tracksState.exhausted) {
          this._loadMoreLibSection("tracks", libEl);
        }
      }, { passive: true });
    }
  }

  /* ── Discovery tab: one section per raw recommendation folder from MA,
     using the server's own name/content as-is (no client-side re-categorization). ── */
  async _loadDiscovery(tabId) {
    if (!this._hass) return;
    const id = tabId || this._tab;
    this._discoveryLoadedTabs.add(id);

    const card = this.shadowRoot.querySelector(".card-root");
    const panel = card?.querySelector(`.tab-panel[data-panel="${id}"]`);
    const libEl = (panel || card)?.querySelector("#lib-content-inner");
    if (!libEl) return;

    this._discoveryLoadId = (this._discoveryLoadId || 0) + 1;
    const loadId = this._discoveryLoadId;

    libEl.innerHTML = `<div class="loader"><div class="spinner"></div> ${this._t("lib.loading")}</div>`;

    let folders = [];
    try {
      const data = await this._callIntegration("GET", "recommendations");
      if (loadId !== this._discoveryLoadId) return;
      folders = (data?.folders || []).filter(f => this._isFolderEnabled(f));
    } catch (err) {
      this._debugLog("Discovery fetch failed:", err);
      if (loadId !== this._discoveryLoadId) return;
      libEl.innerHTML = `<div class="empty-state">${ICONS.sparkle}<p>${this._t("discovery.load_error")}</p></div>`;
      return;
    }

    const sectionsHtml = folders.map(f => {
      const items = this._filterLibItems(f.items || []);
      if (!items.length) return "";
      const fid = this._esc(f.folder_id || f.name || "");
      const cardsHtml = items.map(i => this._renderLibCard(i, this._itemIcon(i))).join("");
      return `
        <div class="lib-section" id="lib-sec-disc-${fid}">
          <div class="lib-section-header"><span class="lib-section-title">${this._esc(f.name || "")}</span></div>
          <div class="lib-lane-wrap">
            <button class="lib-lane-arrow left" data-dir="left">${ICONS.chevronLeft}</button>
            <div class="lib-scroll">${cardsHtml}</div>
            <button class="lib-lane-arrow right" data-dir="right">${ICONS.chevronRight}</button>
          </div>
        </div>`;
    }).filter(Boolean).join("");

    if (loadId !== this._discoveryLoadId) return;
    libEl.innerHTML = sectionsHtml || `<div class="empty-state">${ICONS.sparkle}<p>${this._t("discovery.empty")}</p></div>`;
    this._attachItemActions(libEl);
    libEl.querySelectorAll(".lib-section").forEach(sec => this._attachLaneArrows(sec));
  }

  _attachLaneArrows(sectionEl) {
    if (!sectionEl) return;
    const wrap = sectionEl.querySelector(".lib-lane-wrap");
    if (!wrap) return;
    const scrollEl = wrap.querySelector(".lib-scroll");
    if (!scrollEl) return;
    const leftBtn = wrap.querySelector(".lib-lane-arrow.left");
    const rightBtn = wrap.querySelector(".lib-lane-arrow.right");

    const updateArrows = () => {
      const atStart = scrollEl.scrollLeft <= 4;
      const atEnd = scrollEl.scrollLeft + scrollEl.clientWidth >= scrollEl.scrollWidth - 4;
      leftBtn.classList.toggle("visible", !atStart);
      rightBtn.classList.toggle("visible", !atEnd);
    };

    scrollEl.addEventListener("scroll", updateArrows, { passive: true });
    requestAnimationFrame(updateArrows);

    const scrollBy = (dir) => {
      const amount = scrollEl.clientWidth * 0.75;
      scrollEl.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    };
    leftBtn.addEventListener("click", (e) => { e.stopPropagation(); scrollBy("left"); });
    rightBtn.addEventListener("click", (e) => { e.stopPropagation(); scrollBy("right"); });
  }

  async _loadMoreLibSection(type, libEl) {
    const state = this._libSections[type];
    if (!state || state.loading || state.exhausted) return;
    state.loading = true;

    const { favorite, iconName } = state;
    const isTrackList = iconName === "music";
    const PAGE = 25;
    const MAX_PAGES = 8;
    const sourceFilter = this._libSourceFilter;
    const activeProviders = this._activeProviderFilter();

    const appendItems = (items) => {
      const sentinel = libEl.querySelector(`#lib-sentinel-${type}`);
      const container = isTrackList
        ? libEl.querySelector(`#lib-list-${type}`)
        : (libEl.querySelector(`#lib-scroll-${type}`) || libEl.querySelector(`#lib-grid-${type}`));
      if (!container || !sentinel) return;
      const tmp = document.createElement("div");
      tmp.innerHTML = items.map(i => isTrackList ? this._renderLibListItem(i) : this._renderLibCard(i, iconName)).join("");
      while (tmp.firstChild) container.insertBefore(tmp.firstChild, sentinel);
      this._attachItemActions(container);
    };

    try {
      let pages = 0;
      while (pages < MAX_PAGES && !state.exhausted) {
        pages++;
        const multiProvider = activeProviders && activeProviders.length > 1;
        const rawItems = await this._fetchLibraryFiltered(type, PAGE, state.offset, favorite, activeProviders);

        if (rawItems.length < PAGE || multiProvider) state.exhausted = true;
        state.offset += rawItems.length;

        const filtered = this._filterLibItems(rawItems);
        if (filtered.length > 0) {
          appendItems(filtered);
          break;
        }
        const hasClientFilter = sourceFilter !== "all";
        if (!hasClientFilter || state.exhausted) break;
      }
    } catch (err) {
      state.exhausted = true;
    } finally {
      state.loading = false;
    }
  }

  _renderSearchCard(item, iconName) {
    const round = iconName === "artist";
    const artClass = `search-card-art${round ? " round" : ""}`;
    const placeholderClass = `search-card-art-placeholder${round ? " round" : ""}`;
    const art = item.thumbnail
      ? `<img class="${artClass}" src="${this._resolveImageUrl(item.thumbnail)}" alt="" loading="lazy">`
      : `<div class="${placeholderClass}">${ICONS[iconName] || ICONS.music}</div>`;
    const type = item.type || iconName;
    const action = type === "artist" ? "browse" : (type === "track" ? "play" : "play-queue");
    const extra = type === "artist" ? `data-title="${this._esc(item.title)}" data-thumb="${this._esc(this._resolveImageUrl(item.thumbnail) || "")}"` : "";
    const canQueue = ["album", "playlist", "track", "artist"].includes(type);
    return `
      <div class="search-card" data-action="${action}" data-id="${this._esc(item.id)}" data-type="${type}" ${extra}>
        ${art}
        <div class="search-card-name">${this._esc(item.title)}</div>
        ${item.subtitle ? `<div class="search-card-sub">${this._esc(item.subtitle)}</div>` : ""}
        ${canQueue ? `<button class="add-queue-btn" data-queue-id="${this._esc(item.id)}" data-queue-type="${this._esc(type)}" title="${this._t("queue.add_to_end")}">${ICONS.plus}</button>` : ""}
      </div>`;
  }

  _attachItemActions(container, opts = {}) {
    const switchToPlayer = opts.switchToPlayer !== false;
    container.querySelectorAll("[data-action]").forEach(el => {
      el.addEventListener("click", (e) => {
        if (e.target.closest(".add-queue-btn")) return;
        e.stopPropagation();
        const { action, id, type, title, thumb } = el.dataset;
        if (action === "browse") {
          this._openArtistPage(id, title || id, thumb || "");
        } else if (action === "play-queue") {
          this._playAndSwitchToPlayer(id, type);
        } else {
          this._playItem(id, type);
          if (switchToPlayer) {
            const card = this.shadowRoot.querySelector(".card-root");
            if (card) this._setActiveTab("player", card);
          }
        }
      });
    });
    container.querySelectorAll(".add-queue-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        const { queueId, queueType } = btn.dataset;
        this._showQueueDropdown(btn, queueId, queueType);
      });
    });
  }

  /* Player tab "artist" button: resolve the playing track's main artist, then open its page.
     Back from that page returns to the player tab. */
  async _openCurrentArtistPage(btn) {
    const uri = this._hass?.states[this._activePlayer]?.attributes?.media_content_id;
    if (!uri || btn.disabled) return;
    btn.disabled = true;
    try {
      const r = await this._callIntegration("GET", `subitems?action=track_artist&uri=${encodeURIComponent(uri)}`);
      const artist = r?.items?.[0];
      if (!artist?.media_content_id) {
        this._showToast(this._t("player.artist_not_found"));
        return;
      }
      this._openArtistPage(artist.media_content_id, artist.title, artist.thumbnail || "", { backTab: "player" });
    } catch (err) {
      this._debugLog("track_artist failed:", err);
      this._showToast(this._t("player.artist_not_found"));
    } finally {
      btn.disabled = false;
    }
  }

  _openArtistPage(id, title, thumbnail, opts = {}) {
    const card = this.shadowRoot.querySelector(".card-root");
    if (!card) return;
    const searchMain = card.querySelector("#search-main");
    const artistPanel = card.querySelector("#artist-page");
    if (!searchMain || !artistPanel) return;

    // Switch to search tab if not already there
    this._setActiveTab("search", card);
    searchMain.style.display = "none";
    artistPanel.style.display = "";

    const heroArt = thumbnail
      ? `<img class="artist-hero-art" src="${this._resolveImageUrl(thumbnail)}" alt="" loading="lazy">`
      : `<div class="artist-hero-art-placeholder">${ICONS.artist}</div>`;

    // undefined = still loading, null = load failed, Array = loaded (see _renderArtistAllAlbumsSection)
    this._artistAllAlbums = undefined;
    this._artistAllAlbumsSort = { field: "name", dir: "asc" };

    artistPanel.innerHTML = `
      <div class="artist-page-header">
        <button class="back-btn" id="artist-back">${this._t("nav.back")}</button>
        ${heroArt}
        <div class="artist-page-name">${this._esc(title)}</div>
        <button class="add-queue-btn" id="artist-queue-btn" data-queue-id="${this._esc(id)}" data-queue-type="artist" title="${this._t("queue.add_to_end")}">${ICONS.plus}</button>
      </div>
      <div class="artist-page-sections">
        <div class="search-section" id="artist-favorites-section">
          <div class="search-section-title">${this._t("artist.favorites")}</div>
          <div class="artist-favorites-body">
            <div class="loader"><div class="spinner"></div> ${this._t("lib.loading_short")}</div>
          </div>
        </div>
        <div class="search-section" id="artist-all-albums-section">
          <div class="search-section-title-row">
            <div class="search-section-title">${this._t("artist.all_albums")}</div>
            <div class="artist-sort-toggles">
              <button type="button" class="artist-sort-btn" data-sort-field="name">${this._t("artist.sort_name")}</button>
              <button type="button" class="artist-sort-btn" data-sort-field="date">${this._t("artist.sort_date")}</button>
            </div>
          </div>
          <div class="artist-all-albums-body">
            <div class="loader"><div class="spinner"></div> ${this._t("lib.loading_short")}</div>
          </div>
        </div>
      </div>
    `;

    artistPanel.querySelector("#artist-back").addEventListener("click", () => {
      artistPanel.style.display = "none";
      searchMain.style.display = "";
      if (opts.backTab) this._setActiveTab(opts.backTab, card);
    });
    artistPanel.querySelector("#artist-queue-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this._showQueueDropdown(e.currentTarget, id, "artist");
    });
    artistPanel.querySelectorAll(".artist-sort-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const field = btn.dataset.sortField;
        if (this._artistAllAlbumsSort.field === field) {
          this._artistAllAlbumsSort.dir = this._artistAllAlbumsSort.dir === "asc" ? "desc" : "asc";
        } else {
          this._artistAllAlbumsSort = { field, dir: field === "date" ? "desc" : "asc" };
        }
        this._renderArtistAllAlbumsSection(artistPanel);
      });
    });

    this._callIntegration("GET", `subitems?action=artist_albums&uri=${encodeURIComponent(id)}&limit=100`)
      .then(r => this._renderArtistFavoritesSection(artistPanel, r?.items || []))
      .catch(() => this._renderArtistFavoritesSection(artistPanel, null));

    this._callIntegration("GET", `subitems?action=artist_albums_all&uri=${encodeURIComponent(id)}&limit=300`)
      .then(r => {
        this._artistAllAlbums = r?.items || [];
        this._renderArtistAllAlbumsSection(artistPanel);
      })
      .catch(() => {
        this._artistAllAlbums = null;
        this._renderArtistAllAlbumsSection(artistPanel);
      });
  }

  /* ── Artist page: "Favoris" section (library/favorite albums, grouped by type) ── */
  _renderArtistFavoritesSection(artistPanel, items) {
    const body = artistPanel.querySelector(".artist-favorites-body");
    if (!body) return;
    if (items === null) {
      body.innerHTML = `<div class="empty-state">${ICONS.library}<p>${this._t("lib.load_error")}</p></div>`;
      return;
    }
    const html = this._renderAlbumTypeGroups(items);
    body.innerHTML = html || `<div class="empty-state">${ICONS.library}<p>${this._t("lib.no_albums")}</p></div>`;
    this._attachItemActions(body);
  }

  /* One sub-section per album type (Albums, EPs, Singles, Live, Compilations), in that
     order, each keeping the order of `items`. Types MA leaves unknown fall under Albums. */
  _renderAlbumTypeGroups(items) {
    const order = ["album", "ep", "single", "live", "compilation"];
    const groups = {};
    for (const item of items) {
      const t = (item.album_type || "album").toLowerCase();
      (groups[order.includes(t) ? t : "album"] ??= []).push(item);
    }
    return order.filter(t => groups[t]).map(t => `
      <div class="search-subsection">
        <div class="search-section-subtitle">${this._t(`lib.album_types.${t}`)}</div>
        <div class="lib-scroll">
          ${groups[t].map(i => this._renderSearchCard({ id: i.media_content_id, type: "album", title: i.title, subtitle: i.media_artist, thumbnail: i.thumbnail }, "album")).join("")}
        </div>
      </div>`).join("");
  }

  /* ── Artist page: "Tous les albums" section (full catalog, sortable) ── */
  _renderArtistAllAlbumsSection(artistPanel) {
    const section = artistPanel.querySelector("#artist-all-albums-section");
    const body = artistPanel.querySelector(".artist-all-albums-body");
    if (!body) return;

    const items = this._artistAllAlbums;
    if (items === undefined) return; // still loading — keep spinner as-is
    if (items === null) {
      body.innerHTML = `<div class="empty-state">${ICONS.library}<p>${this._t("artist.load_error")}</p></div>`;
    } else if (!items.length) {
      body.innerHTML = `<div class="empty-state">${ICONS.library}<p>${this._t("artist.no_albums")}</p></div>`;
    } else {
      const { field, dir } = this._artistAllAlbumsSort;
      const sorted = [...items].sort((a, b) => {
        const cmp = field === "date"
          ? (a.year ?? -Infinity) - (b.year ?? -Infinity)
          : (a.title || "").localeCompare(b.title || "");
        return dir === "desc" ? -cmp : cmp;
      });
      body.innerHTML = this._renderAlbumTypeGroups(sorted);
      this._attachItemActions(body);
    }

    section?.querySelectorAll(".artist-sort-btn").forEach(btn => {
      const isActive = btn.dataset.sortField === this._artistAllAlbumsSort.field;
      btn.classList.toggle("active", isActive);
      if (isActive) btn.dataset.dir = this._artistAllAlbumsSort.dir;
      else delete btn.dataset.dir;
    });
  }

  async _playAndSwitchToPlayer(id, type) {
    if (!this._hass || !this._activePlayer) return;
    const card = this.shadowRoot.querySelector(".card-root");
    if (!card) return;
    this._setActiveTab("player", card);

    this._debugLog("PlayQueue:", id, "type:", type, "on:", this._activePlayer);
    try {
      await this._callServiceSilent("my_music_library", "play_media", {
        entity_id: this._activePlayer,
        media_id: id,
        enqueue: "replace",
      });
    } catch (err) {
      this._debugLog("play_media error:", err);
      this._showToast(this._isMediaNotFoundError(err)
        ? this._t("errors.media_not_found")
        : `${this._t("errors.play_failed")}: ${this._extractErrorMessage(err)}`);
    }
    this._refreshQueueSoon(1500);
  }

  _updateQueueDisplay(card) {
    const section = card.querySelector("#queue-section");
    if (!section) return;
    const list = section.querySelector("#queue-list");
    if (!this._maQueueItems.length) {
      list.innerHTML = `<div class="queue-empty">${this._t("queue.empty")}</div>`;
      return;
    }
    list.innerHTML = this._maQueueItems.map((t, i) => `
      <div class="queue-item" data-queue-idx="${i}" data-queue-item-id="${this._esc(t.queue_item_id)}">
        <div class="queue-num">${i + 1}</div>
        <div class="queue-info">
          <div class="queue-title">${this._esc(t.title)}</div>
          ${t.media_artist ? `<div class="queue-sub">${this._esc(t.media_artist)}</div>` : ""}
        </div>
        ${t.duration ? `<div class="queue-dur">${fmt(t.duration)}</div>` : ""}
        <button class="queue-remove" data-queue-item-id="${this._esc(t.queue_item_id)}" title="${this._t("queue.remove")}">${ICONS.remove}</button>
      </div>
    `).join("");
    list.querySelectorAll(".queue-item").forEach(item => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".queue-remove")) return;
        this._jumpToQueueIndex(parseInt(item.dataset.queueIdx, 10));
      });
    });
    list.querySelectorAll(".queue-remove").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._removeFromQueue(btn.dataset.queueItemId);
      });
    });
  }

  async _removeFromQueue(queueItemId) {
    if (!queueItemId || !this._activePlayer) return;
    try {
      await this._callIntegration("POST", "ma_queue", {
        player: this._activePlayer,
        action: "delete_item",
        item_id: queueItemId,
      });
      this._refreshQueueSoon(500);
    } catch (err) {
      this._debugLog("removeFromQueue failed:", err);
    }
  }

  async _addItemToQueue(id, type, mode) {
    if (!this._hass || !this._activePlayer) return;
    const enqueue = mode === "next" ? "next" : "add";
    try {
      await this._callServiceSilent("my_music_library", "play_media", {
        entity_id: this._activePlayer,
        media_id: id,
        enqueue,
      });
      this._showToast(this._t(mode === "next" ? "queue.added_next" : "queue.added_end"));
      this._refreshQueueSoon(1000);
    } catch (err) {
      this._debugLog("addItemToQueue failed:", err);
    }
  }

  _showQueueDropdown(btnEl, id, type) {
    this._closeQueueDropdown();
    const dd = document.createElement("div");
    dd.className = "queue-dropdown";
    dd.id = "mml-queue-dropdown";
    dd.innerHTML = `
      <div class="queue-dropdown-item" data-mode="next">${this._t("queue.play_next")}</div>
      <div class="queue-dropdown-item" data-mode="end">${this._t("queue.add_to_end")}</div>
      <div class="queue-dropdown-item queue-dropdown-mix" data-mode="radio">${ICONS.shuffle} ${this._t("queue.start_mix")}</div>
    `;
    dd.querySelectorAll(".queue-dropdown-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        if (item.dataset.mode === "radio") {
          this._startRadioMode(id, type);
        } else {
          this._addItemToQueue(id, type, item.dataset.mode);
        }
        this._closeQueueDropdown();
      });
    });
    const root = this.shadowRoot;
    root.appendChild(dd);
    const rect = btnEl.getBoundingClientRect();
    const hostRect = this.getBoundingClientRect();
    dd.style.top = `${rect.bottom - hostRect.top}px`;
    dd.style.left = `${Math.max(0, rect.right - hostRect.left - 200)}px`;
    const autoClose = (e) => {
      const path = e.composedPath();
      if (!path.includes(dd) && !path.includes(btnEl)) {
        this._closeQueueDropdown();
      }
    };
    setTimeout(() => {
      document.addEventListener("click", autoClose, true);
      root.addEventListener("click", autoClose, true);
    }, 0);
    this._queueDropdownCleanup = () => {
      document.removeEventListener("click", autoClose, true);
      root.removeEventListener("click", autoClose, true);
    };
  }

  _closeQueueDropdown() {
    const existing = this.shadowRoot?.querySelector("#mml-queue-dropdown");
    if (existing) existing.remove();
    if (this._queueDropdownCleanup) { this._queueDropdownCleanup(); this._queueDropdownCleanup = null; }
  }

  /* Music Assistant builds the whole mix (similar-track lookups at the providers) before
     answering, which takes several seconds: give feedback right away instead of after. */
  async _startRadioMode(id, type) {
    if (!this._hass || !this._activePlayer) return;
    const card = this.shadowRoot.querySelector(".card-root");
    if (card) this._setActiveTab("player", card);
    this._showToast(this._t("queue.mix_preparing"), 30000);
    try {
      await this._callServiceSilent("my_music_library", "play_media", {
        entity_id: this._activePlayer,
        media_id: id,
        enqueue: "replace",
        radio_mode: true,
      });
      this._showToast(this._t("queue.mix_started"));
      this._refreshQueueSoon(1500);
    } catch (err) {
      this._debugLog("startRadioMode failed:", err);
      this._showToast(`${this._t("errors.play_failed")}: ${this._extractErrorMessage(err)}`);
    }
  }

  async _jumpToQueueIndex(index) {
    if (!this._hass || !this._activePlayer) return;
    if (index < 0 || index >= this._maQueueItems.length) return;
    try {
      await this._callIntegration("POST", "queue_jump", {
        player: this._activePlayer,
        index,
      });
    } catch (err) {
      this._debugLog("queue jump failed:", err);
    }
  }

  /* ── Browse mode ── */

  _buildBrowseNav() {
    // Breadcrumb always rendered — present in all states (success, empty, error)
    const crumbs = [{ uri: null, label: this._t("lib.browse_root") }, ...this._browseStack];
    const crumbHtml = crumbs.map((c, i) => {
      const isLast = i === crumbs.length - 1;
      const sep = i > 0 ? `<span class="browse-sep">›</span>` : "";
      return `${sep}<button class="browse-crumb ${isLast ? "current" : ""}" data-crumb-idx="${i}">${this._esc(c.label)}</button>`;
    }).join("");
    return `<div class="browse-breadcrumb" id="browse-crumbs">${crumbHtml}</div>`;
  }

  _attachBrowseNav(libEl) {
    libEl.querySelector("#browse-crumbs")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".browse-crumb");
      if (!btn || btn.classList.contains("current")) return;
      const idx = parseInt(btn.dataset.crumbIdx, 10);
      // idx 0 = root → empty stack; idx N → keep first N-1 entries
      this._browseStack = idx === 0 ? [] : this._browseStack.slice(0, idx);
      this._libLoadedTabs.delete(this._tab);
      this._loadLibrary();
    });
  }

  async _loadBrowse(uri, libEl) {
    if (!libEl) {
      const card = this.shadowRoot.querySelector(".card-root");
      const activePanel = card?.querySelector(`.tab-panel[data-panel="${this._tab}"]`);
      libEl = (activePanel || card)?.querySelector("#lib-content-inner");
    }
    if (!libEl) return;

    libEl.innerHTML = `
      ${this._buildBrowseNav()}
      <div class="loader"><div class="spinner"></div> ${this._t("lib.loading_short")}</div>`;
    this._attachBrowseNav(libEl);

    try {
      const path = uri ? `browse?uri=${encodeURIComponent(uri)}` : "browse";
      const data = await this._callIntegration("GET", path);
      const items = data?.items || [];

      libEl.innerHTML = `
        ${this._buildBrowseNav()}
        <div id="browse-list">
          ${items.length
            ? items.map(item => this._renderBrowseItem(item)).join("")
            : `<div class="empty-state">${ICONS.folder}<p>${this._t("lib.browse_empty")}</p></div>`
          }
        </div>`;

      this._attachBrowseNav(libEl);

      // Browse item actions
      libEl.querySelector("#browse-list")?.addEventListener("click", (e) => {
        const playBtn = e.target.closest(".browse-play-btn");
        const row = e.target.closest(".browse-item");
        if (!row) return;
        const { uri: itemUri, type, folder, title } = row.dataset;

        if (playBtn) {
          e.stopPropagation();
          this._playItem(itemUri, type || "music");
          const card = this.shadowRoot.querySelector(".card-root");
          if (card) this._setActiveTab("player", card);
          return;
        }

        if (row.dataset.back === "true") {
          // MA virtual back item — navigate up one level
          if (this._browseStack.length > 0) this._browseStack.pop();
          this._libLoadedTabs.delete(this._tab);
          this._loadLibrary();
        } else if (folder === "true") {
          this._browseStack.push({ uri: itemUri, label: title });
          this._libLoadedTabs.delete(this._tab);
          this._loadLibrary();
        } else {
          this._playItem(itemUri, type || "music");
          const card = this.shadowRoot.querySelector(".card-root");
          if (card) this._setActiveTab("player", card);
        }
      });

    } catch (err) {
      libEl.innerHTML = `
        ${this._buildBrowseNav()}
        <div class="empty-state">${ICONS.library}<p>${this._t("lib.browse_error")}</p></div>`;
      this._attachBrowseNav(libEl);
    }
  }

  _renderBrowseItem(item) {
    if (item.is_back) {
      // MA virtual back item — render as a simple "go up" row, no play button
      return `
        <div class="browse-item" data-back="true" data-uri="" data-folder="false" data-title="">
          <div class="browse-item-icon folder">${ICONS.folderOpen}</div>
          <div class="browse-item-info">
            <div class="browse-item-name">…</div>
          </div>
          <div class="browse-item-actions">
            <div class="browse-chevron" style="transform:rotate(180deg)">${ICONS.chevronRight}</div>
          </div>
        </div>`;
    }

    const isFolder = item.is_folder;
    const iconHtml = item.thumbnail
      ? `<div class="browse-item-icon"><img src="${this._esc(this._resolveImageUrl(item.thumbnail))}" alt="" loading="lazy"></div>`
      : `<div class="browse-item-icon ${isFolder ? "folder" : ""}">${isFolder ? ICONS.folderOpen : ICONS.music}</div>`;

    const subtitle = item.subtitle
      ? `<div class="browse-item-sub">${this._esc(item.subtitle)}</div>` : "";

    const chevron = isFolder
      ? `<div class="browse-chevron">${ICONS.chevronRight}</div>` : "";

    return `
      <div class="browse-item"
        data-uri="${this._esc(item.uri)}"
        data-type="${this._esc(item.media_content_type || "music")}"
        data-folder="${isFolder}"
        data-back="false"
        data-title="${this._esc(item.title)}">
        ${iconHtml}
        <div class="browse-item-info">
          <div class="browse-item-name">${this._esc(item.title)}</div>
          ${subtitle}
        </div>
        <div class="browse-item-actions">
          <button class="browse-play-btn" title="${this._t("lib.browse_play")}">${ICONS.play}</button>
          ${chevron}
        </div>
      </div>`;
  }

  _renderLibCard(item, iconName) {
    const thumb = item.thumbnail
      ? `<img class="lib-card-art" src="${this._resolveImageUrl(item.thumbnail)}" alt="" loading="lazy">`
      : `<div class="lib-card-art-placeholder">${ICONS[iconName] || ICONS.music}</div>`;
    const action = iconName === "artist" ? "browse" : (iconName === "music" ? "play" : "play-queue");
    const extra = iconName === "artist" ? `data-title="${this._esc(item.title)}" data-thumb="${this._esc(this._resolveImageUrl(item.thumbnail) || "")}"` : "";
    const type = iconName === "artist" ? "artist" : (item.media_content_type || iconName);
    const id = item.media_content_id || item.uri || "";
    const artist = item.media_artist || item.subtitle || "";
    const canQueue = ["album", "playlist", "track", "artist"].includes(type);
    return `
      <div class="lib-card" data-action="${action}" data-id="${this._esc(id)}" data-type="${this._esc(type)}" ${extra}>
        ${thumb}
        <div class="lib-card-name">${this._esc(item.title)}</div>
        ${artist ? `<div class="lib-card-sub">${this._esc(artist)}</div>` : ""}
        ${canQueue ? `<button class="add-queue-btn" data-queue-id="${this._esc(id)}" data-queue-type="${this._esc(type)}" title="${this._t("queue.add_to_end")}">${ICONS.plus}</button>` : ""}
      </div>`;
  }

  _renderLibListItem(item) {
    const thumb = item.thumbnail
      ? `<img class="lib-list-thumb" src="${this._resolveImageUrl(item.thumbnail)}" alt="" loading="lazy">`
      : "";
    return `
      <div class="lib-list-item" data-action="play" data-id="${this._esc(item.media_content_id)}" data-type="${this._esc(item.media_content_type)}">
        ${thumb}
        <div class="lib-list-info">
          <div class="lib-list-title">${this._esc(item.title)}</div>
          ${item.media_artist ? `<div class="lib-list-sub">${this._esc(item.media_artist)}</div>` : ""}
        </div>
        <button class="add-queue-btn" data-queue-id="${this._esc(item.media_content_id)}" data-queue-type="track" title="${this._t("queue.add_to_end")}">${ICONS.plus}</button>
        <button class="result-play" data-action="play" data-id="${this._esc(item.media_content_id)}" data-type="${this._esc(item.media_content_type)}" title="${this._t("btns.play")}">${ICONS.play}</button>
      </div>`;
  }

  /* ── Playlist tab: load a single playlist's tracks ── */
  async _loadPlaylistTab(tabDef) {
    if (!this._hass || !tabDef?.playlist_uri) return;
    const card = this.shadowRoot?.querySelector(".card-root");
    const panel = card?.querySelector(`.tab-panel[data-panel="${tabDef.id}"]`);
    const listEl = panel?.querySelector(".playlist-track-list");
    if (!listEl) return;

    this._plLoadedTabs.add(tabDef.id);
    listEl.innerHTML = `<div class="loader"><div class="spinner"></div> ${this._t("lib.loading_short")}</div>`;

    try {
      const data = await this._callIntegration("GET",
        `subitems?action=playlist_tracks&uri=${encodeURIComponent(tabDef.playlist_uri)}&limit=200`);
      const items = data?.items || [];
      this._plTracks = this._plTracks || {};
      this._plTracks[tabDef.id] = items;
      listEl.innerHTML = this._renderPlaylistTrackList(tabDef, items);
      this._attachItemActions(listEl, { switchToPlayer: false });
    } catch (err) {
      this._debugLog("Playlist tracks load failed:", err);
      listEl.innerHTML = `<div class="empty-state">${ICONS.playlist}<p>${this._t("playlist.load_error")}</p></div>`;
    }
  }

  /* ── Play an item ── */
  async _playItem(contentId, contentType) {
    if (!this._hass || !this._activePlayer) return;
    this._debugLog("Play:", contentId, "type:", contentType, "on:", this._activePlayer);
    try {
      await this._callServiceSilent("my_music_library", "play_media", {
        entity_id: this._activePlayer,
        media_id: contentId,
        enqueue: "replace",
      });
    } catch (err) {
      this._debugLog("play_media error:", err);
      this._showToast(this._isMediaNotFoundError(err)
        ? this._t("errors.media_not_found")
        : `${this._t("errors.play_failed")}: ${this._extractErrorMessage(err)}`);
    }
    this._refreshQueueSoon(1500);
  }

  _callServiceSilent(domain, service, data) {
    return this._hass.connection.sendMessagePromise({
      type: "call_service",
      domain,
      service,
      service_data: data,
    });
  }

  /* ── Toast ── */
  _showToast(msg, duration = 4000) {
    const el = this.shadowRoot?.querySelector("#mml-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("visible");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove("visible"), duration);
  }

  _isMediaNotFoundError(err) {
    const msg = err?.message || String(err);
    return msg.includes("no data") || msg.includes("DataException");
  }

  /* HA WS service-call rejections are usually {code, message} objects, not
     JS Error instances — pull out whatever readable text is available so a
     failed play_media isn't just a silent no-op. */
  _extractErrorMessage(err) {
    return err?.message || err?.code || (typeof err === "string" ? err : "") || "unknown error";
  }

  /* ── Utilities ── */
  _esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}

/* ─── Card Editor (WYSIWYG) ──────────────────────────────── */

const EDITOR_STYLES = `
  :host { display: block; font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif); }
  .editor { padding: 16px; }
  .editor-section { margin-bottom: 20px; }
  .editor-section-title {
    font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    color: var(--secondary-text-color, #727272); margin-bottom: 8px;
  }
  .editor-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .ed-out-hint { font-size: 12px; color: var(--secondary-text-color, #727272); margin-bottom: 8px; }
  .ed-out-row { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) auto; gap: 6px; align-items: center; margin-bottom: 6px; }
  .ed-out-ent { font-size: 13px; color: var(--primary-text-color, #212121); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ed-out-row input[type="text"] {
    padding: 6px 8px; border: 1px solid var(--divider-color, #e0e0e0); border-radius: 4px; font-size: 13px;
    background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); min-width: 0;
  }
  .ed-out-hide-label { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--secondary-text-color, #727272); white-space: nowrap; }
  .editor-row label { min-width: 120px; font-size: 14px; color: var(--primary-text-color, #212121); flex-shrink: 0; }
  .editor-row input, .editor-row select {
    flex: 1; padding: 8px; border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 4px; font-size: 14px; background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121); min-width: 0;
  }
  .editor-row input[type="checkbox"] { flex: none; width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary-color, #03a9f4); }
  .editor-row input:focus, .editor-row select:focus {
    outline: none; border-color: var(--primary-color, #03a9f4);
  }
  .tab-list { border: 1px solid var(--divider-color, #e0e0e0); border-radius: 8px; overflow: hidden; }
  .tab-item {
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    background: var(--card-background-color, #fff);
  }
  .tab-item:last-child { border-bottom: none; }
  .tab-item-header {
    display: flex; align-items: center; gap: 6px; padding: 8px 12px; cursor: pointer;
    user-select: none; -webkit-tap-highlight-color: transparent;
  }
  .tab-item-header:hover { background: var(--secondary-background-color, #f5f5f5); }
  .tab-item-type {
    font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    padding: 2px 6px; border-radius: 3px;
    background: var(--primary-color, #03a9f4); color: #fff;
  }
  .tab-item-type.button { background: var(--accent-color, #ff9800); }
  .tab-item-label { flex: 1; font-size: 14px; font-weight: 500; color: var(--primary-text-color, #212121); }
  .tab-item-actions { display: flex; gap: 2px; }
  .tab-item-actions button {
    background: none; border: none; cursor: pointer; padding: 4px;
    color: var(--secondary-text-color, #727272); border-radius: 4px;
    font-size: 16px; line-height: 1; min-width: 28px; min-height: 28px;
    display: flex; align-items: center; justify-content: center;
  }
  .tab-item-actions button:hover { background: var(--secondary-background-color, #f5f5f5); color: var(--primary-text-color, #212121); }
  .tab-item-actions button.delete:hover { color: var(--error-color, #db4437); }
  .tab-item-actions button:disabled { opacity: 0.3; pointer-events: none; }
  .tab-item-body { padding: 8px 12px 12px; border-top: 1px solid var(--divider-color, #e0e0e0); }
  .tab-item-body .editor-row { margin-bottom: 6px; }
  .tab-item-body .editor-row label { min-width: 100px; font-size: 13px; }
  .tab-item-body .editor-row input, .tab-item-body .editor-row select { font-size: 13px; padding: 6px; }
  .section-list { margin-top: 4px; }
  .section-item {
    display: flex; align-items: center; gap: 6px; padding: 4px 0;
  }
  .section-item label { flex: 1; font-size: 13px; cursor: pointer; user-select: none; }
  .section-item input[type="checkbox"] { margin: 0; cursor: pointer; accent-color: var(--primary-color, #03a9f4); }
  .section-item button {
    background: none; border: none; cursor: pointer; padding: 2px;
    color: var(--secondary-text-color, #727272); font-size: 14px; line-height: 1;
    min-width: 24px; min-height: 24px; display: flex; align-items: center; justify-content: center;
    border-radius: 4px;
  }
  .section-item button:hover { background: var(--secondary-background-color, #f5f5f5); }
  .section-item button:disabled { opacity: 0.3; pointer-events: none; }
  .add-tab-row { padding: 8px 12px; }
  .add-tab-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    width: 100%; padding: 8px; border: 2px dashed var(--divider-color, #e0e0e0);
    border-radius: 6px; background: none; cursor: pointer;
    color: var(--primary-color, #03a9f4); font-size: 14px; font-weight: 500;
  }
  .add-tab-btn:hover { border-color: var(--primary-color, #03a9f4); background: rgba(3,169,244,0.04); }
  .add-tab-menu {
    display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 12px;
    border-top: 1px solid var(--divider-color, #e0e0e0);
  }
  .add-tab-menu button {
    padding: 6px 12px; border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 4px; background: var(--card-background-color, #fff); cursor: pointer;
    font-size: 13px; color: var(--primary-text-color, #212121);
  }
  .add-tab-menu button:hover { border-color: var(--primary-color, #03a9f4); background: rgba(3,169,244,0.04); }
  .expand-chevron { transition: transform 0.2s; font-size: 12px; }
  .expand-chevron.open { transform: rotate(90deg); }
  .tab-item-type.custom_element { background: #9c27b0; }
  .editor-row textarea {
    flex: 1; padding: 8px; border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 4px; font-size: 12px; font-family: monospace;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121); min-width: 0; resize: vertical;
  }
  .editor-row textarea:focus { outline: none; border-color: var(--primary-color, #03a9f4); }
`;

class MyMusicLibraryCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._expandedTab = -1;
    this._showAddMenu = false;
    this._playlistOptions = null;
    this._playlistOptionsLoading = false;
  }

  _t(key) {
    const raw = this._hass?.locale?.language || this._hass?.language || "en";
    const lang = raw.toLowerCase().split("-")[0];
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    const val = key.split(".").reduce((o, k) => o?.[k], dict);
    if (val !== undefined) return val;
    return key.split(".").reduce((o, k) => o?.[k], TRANSLATIONS.en) ?? key;
  }

  setConfig(config) {
    this._config = { ...config };
    if (this.shadowRoot) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    // The Outputs section lists the players from hass: render again once they are known
    // (setConfig often comes first) or when the list changes — not on every state update.
    const outputsKey = this._outputsKey();
    if (this.shadowRoot && (!this.shadowRoot.querySelector(".editor") || outputsKey !== this._renderedOutputsKey)) this._render();
  }

  _outputsKey() {
    const states = this._hass?.states || {};
    return Object.keys(states).filter(id => id.startsWith("media_player.") && states[id].attributes?.mass_player_id).sort().join(",");
  }

  _fireChanged() {
    const config = { ...this._config };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  _getResolvedTabs() {
    if (this._config.tabs && Array.isArray(this._config.tabs)) return [...this._config.tabs];
    const tabs = [];
    if (this._config.nav_buttons_left) {
      for (const b of this._config.nav_buttons_left) tabs.push({ type: "button", ...b });
    }
    tabs.push({ type: "player" });
    tabs.push({ type: "search" });
    tabs.push({ type: "library" });
    if (this._config.nav_buttons_right) {
      for (const b of this._config.nav_buttons_right) tabs.push({ type: "button", ...b });
    }
    tabs.push({ type: "settings" });
    return tabs;
  }

  _updateTabs(tabs) {
    this._config = { ...this._config, tabs };
    delete this._config.nav_buttons_left;
    delete this._config.nav_buttons_right;
    this._fireChanged();
    this._render();
  }

  _tabTypeLabel(type) {
    return this._t(`editor.type_${type}`) || type;
  }

  _tabDisplayLabel(tab) {
    if (tab.label) return tab.label;
    if (tab.name) return tab.name;
    if (tab.type === "custom_element") return tab.element || this._t("editor.type_custom_element");
    if (tab.type === "button") return tab.icon || "Button";
    if (tab.type === "playlist" && tab.playlist_label) return tab.playlist_label;
    return this._t(`tabs.${tab.type}`) || tab.type;
  }

  _render() {
    const root = this.shadowRoot;
    root.innerHTML = "";
    const style = document.createElement("style");
    style.textContent = EDITOR_STYLES;
    root.appendChild(style);

    const wrap = document.createElement("div");
    wrap.className = "editor";

    const tabs = this._getResolvedTabs();
    const panelTypes = tabs.filter(t => t.type !== "button").map(t => t.type);
    const defaultTabOptions = panelTypes.length ? panelTypes : ["player", "search", "library"];

    wrap.innerHTML = `
      ${this._renderBasicFields(defaultTabOptions)}
      <div class="editor-section">
        <div class="editor-section-title">${this._t("editor.tabs_title")}</div>
        <div class="tab-list">
          ${tabs.map((tab, i) => this._renderTabItem(tab, i, tabs.length)).join("")}
        </div>
        ${this._showAddMenu ? `
          <div class="add-tab-menu">
            ${["player","search","library","discovery","playlist","settings","button","custom_element"].map(type => `
              <button data-add-type="${type}">${this._tabTypeLabel(type)}</button>
            `).join("")}
          </div>` : `
          <div class="add-tab-row">
            <button class="add-tab-btn" id="add-tab-btn">+ ${this._t("editor.add_tab")}</button>
          </div>`}
      </div>
    `;
    root.appendChild(wrap);
    this._attachEditorListeners(wrap, tabs);
  }

  /* Per-output overrides: devices: { <entity_id>: { name, icon, hidden } } (empty values dropped). */
  _renderOutputsFields() {
    this._renderedOutputsKey = this._outputsKey();
    const states = this._hass?.states || {};
    const ids = Object.keys(states)
      .filter(id => id.startsWith("media_player.") && (states[id].attributes?.mass_player_id || this._config.show_other_players))
      .filter(id => states[id].state !== "unavailable" || this._config.devices?.[id])
      .sort((a, b) => (states[a].attributes?.friendly_name || a).localeCompare(states[b].attributes?.friendly_name || b));
    if (!ids.length) return "";
    const devices = this._config.devices || {};
    return `
      <div class="editor-section">
        <div class="editor-section-title">${this._t("editor.outputs_title")}</div>
        <div class="ed-out-hint">${this._t("editor.outputs_hint")}</div>
        ${ids.map(id => {
          const d = devices[id] || {};
          return `
            <div class="ed-out-row" data-eid="${this._esc(id)}">
              <div class="ed-out-ent" title="${this._esc(id)}">${this._esc(states[id].attributes?.friendly_name || id)}</div>
              <input class="ed-out-name" type="text" placeholder="${this._t("editor.outputs_alias")}" value="${this._esc(d.name || "")}">
              <input class="ed-out-icon" type="text" placeholder="mdi:speaker" value="${this._esc(d.icon || "")}">
              <label class="ed-out-hide-label"><input class="ed-out-hide" type="checkbox" ${d.hidden ? "checked" : ""}> ${this._t("editor.outputs_hide")}</label>
            </div>`;
        }).join("")}
      </div>`;
  }

  _setDeviceOverride(eid, { name, icon, hidden }) {
    const devices = { ...(this._config.devices || {}) };
    const entry = {};
    if (name) entry.name = name;
    if (icon) entry.icon = icon;
    if (hidden) entry.hidden = true;
    if (Object.keys(entry).length) devices[eid] = entry;
    else delete devices[eid];
    this._config = { ...this._config };
    if (Object.keys(devices).length) this._config.devices = devices;
    else delete this._config.devices;
    this._fireChanged();
  }

  _renderBasicFields(defaultTabOptions) {
    const cfg = this._config;
    const navPos = cfg.nav_bar?.position || "top";
    const navAlign = cfg.nav_bar?.align || "start";
    return `
      <div class="editor-section">
        <div class="editor-row">
          <label>${this._t("editor.default_tab")}</label>
          <select id="ed-default-tab">
            ${defaultTabOptions.map(t => `<option value="${t}" ${cfg.default_tab === t ? "selected" : ""}>${this._t(`tabs.${t}`) || t}</option>`).join("")}
          </select>
        </div>
        <div class="editor-row">
          <label>${this._t("editor.entity")}</label>
          <input id="ed-entity" type="text" value="${cfg.entity || ""}" placeholder="${this._t("editor.entity_hint")}">
        </div>
        <div class="editor-row">
          <label>${this._t("editor.height")}</label>
          <input id="ed-height" type="text" value="${cfg.height || ""}" placeholder="${this._t("editor.height_hint")}">
        </div>
        <div class="editor-row">
          <label>${this._t("editor.show_device_select")}</label>
          <input id="ed-show-device" type="checkbox" ${cfg.show_device_select !== false ? "checked" : ""}>
        </div>
        <div class="editor-row">
          <label>${this._t("editor.show_other_players")}</label>
          <input id="ed-show-other-players" type="checkbox" ${cfg.show_other_players ? "checked" : ""}>
        </div>
      </div>
      ${this._renderOutputsFields()}
      <div class="editor-section">
        <div class="editor-section-title">${this._t("editor.nav_bar_section")}</div>
        <div class="editor-row">
          <label>${this._t("editor.nav_bar_position")}</label>
          <select id="ed-nav-pos">
            ${["top","bottom","left","right"].map(p =>
              `<option value="${p}" ${navPos === p ? "selected" : ""}>${this._t(`editor.nav_bar_pos_${p}`)}</option>`
            ).join("")}
          </select>
        </div>
        <div class="editor-row">
          <label>${this._t("editor.nav_bar_align")}</label>
          <select id="ed-nav-align">
            ${["start","center","end","space-between"].map(a =>
              `<option value="${a}" ${navAlign === a ? "selected" : ""}>${this._t(`editor.nav_bar_align_${a.replace("-","_")}`)}</option>`
            ).join("")}
          </select>
        </div>
      </div>`;
  }

  _renderTabItem(tab, index, total) {
    const isExpanded = this._expandedTab === index;
    const typeClass = tab.type === "button" ? " button" : tab.type === "custom_element" ? " custom_element" : "";
    return `
      <div class="tab-item" data-tab-idx="${index}">
        <div class="tab-item-header" data-toggle-idx="${index}">
          <span class="expand-chevron ${isExpanded ? "open" : ""}">▶</span>
          <span class="tab-item-type${typeClass}">${this._tabTypeLabel(tab.type)}</span>
          <span class="tab-item-label">${this._esc(this._tabDisplayLabel(tab))}</span>
          <div class="tab-item-actions">
            <button data-move="up" data-idx="${index}" ${index === 0 ? "disabled" : ""} title="${this._t("editor.move_up")}">▲</button>
            <button data-move="down" data-idx="${index}" ${index === total - 1 ? "disabled" : ""} title="${this._t("editor.move_down")}">▼</button>
            <button class="delete" data-delete="${index}" title="${this._t("editor.delete")}">✕</button>
          </div>
        </div>
        ${isExpanded ? this._renderTabBody(tab, index) : ""}
      </div>`;
  }

  _renderActionSelect(tab, index) {
    const actionType = tab.tap_action?.action || "none";
    const allActions = ["none","toggle","more-info","navigate","url","call-service","assist",
                        "mml_navigate_tab","mml_navigate_section","mml_control"];
    let actionFields = "";
    if (actionType === "navigate") {
      actionFields = `<div class="editor-row"><label>${this._t("editor.btn_nav_path")}</label><input data-btn-field="navigation_path" data-idx="${index}" type="text" value="${this._esc(tab.tap_action?.navigation_path || "")}"></div>`;
    } else if (actionType === "url") {
      actionFields = `<div class="editor-row"><label>${this._t("editor.btn_url")}</label><input data-btn-field="url_path" data-idx="${index}" type="text" value="${this._esc(tab.tap_action?.url_path || "")}"></div>`;
    } else if (actionType === "call-service" || actionType === "perform-action") {
      actionFields = `<div class="editor-row"><label>${this._t("editor.btn_service")}</label><input data-btn-field="perform_action" data-idx="${index}" type="text" value="${this._esc(tab.tap_action?.perform_action || tab.tap_action?.service || "")}"></div>`;
    } else if (actionType === "mml_navigate_tab") {
      // Use each tab's resolved *id* (not just its type) as the option value: when
      // several tabs share a type (e.g. two "library" tabs with different sections),
      // targeting by type alone is ambiguous — it always resolves to the first one.
      // _buildResolvedTabs computes the same ids the card itself uses at runtime.
      const resolvedTabs = _buildResolvedTabs(this._config);
      const panelTabs = resolvedTabs.filter(t => t.type && !["button","custom_element"].includes(t.type));
      const typeCounts = {};
      for (const t of panelTabs) typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
      const optionLabel = (t) => {
        const base = t.label || this._t(`tabs.${t.type}`) || t.type;
        return (!t.label && typeCounts[t.type] > 1) ? `${base} (${t.id})` : base;
      };
      // Backward compat: older bindings may store a bare type (e.g. "library") from
      // before ids were used here — if nothing matches by id, fall back to matching
      // the first tab of that type, same as the runtime resolver does.
      const storedValue = tab.tap_action?.tab;
      const matchesById = panelTabs.some(t => t.id === storedValue);
      let firstTypeMatchUsed = false;
      actionFields = `<div class="editor-row"><label>${this._t("editor.btn_mml_tab")}</label><select data-btn-field="tab" data-idx="${index}">${panelTabs.map(t => {
        let isSelected = t.id === storedValue;
        if (!matchesById && !firstTypeMatchUsed && t.type === storedValue) {
          isSelected = true;
          firstTypeMatchUsed = true;
        }
        return `<option value="${t.id}" ${isSelected ? "selected" : ""}>${this._esc(optionLabel(t))}</option>`;
      }).join("")}</select></div>`;
    } else if (actionType === "mml_navigate_section") {
      const sections = ["artists","albums","playlists","tracks","radios","recently_played","recently_added","recommended","flows"];
      actionFields = `<div class="editor-row"><label>${this._t("editor.btn_mml_section")}</label><select data-btn-field="section" data-idx="${index}">${sections.map(s => `<option value="${s}" ${tab.tap_action?.section === s ? "selected" : ""}>${this._t(`lib.${s}`) || s}</option>`).join("")}</select></div>`;
    } else if (actionType === "mml_control") {
      const cmds = ["play_pause","next","prev","shuffle","repeat","mute"];
      actionFields = `<div class="editor-row"><label>${this._t("editor.btn_mml_command")}</label><select data-btn-field="command" data-idx="${index}">${cmds.map(c => `<option value="${c}" ${tab.tap_action?.command === c ? "selected" : ""}>${this._t(`editor.mml_cmd_${c}`) || c}</option>`).join("")}</select></div>`;
    }
    return `
      <div class="editor-row">
        <label>${this._t("editor.btn_action_type")}</label>
        <select data-btn-action-type data-idx="${index}">
          ${allActions.map(a => `<option value="${a}" ${actionType === a ? "selected" : ""}>${this._t(`editor.action_${a.replace(/-/g,"_")}`) || a}</option>`).join("")}
        </select>
      </div>
      ${actionFields}`;
  }

  _renderCustomElementBody(tab, index) {
    return `
      <div class="tab-item-body">
        <div class="editor-row">
          <label>${this._t("editor.btn_element_name")}</label>
          <input data-field="element" data-idx="${index}" type="text" value="${this._esc(tab.element || "")}" placeholder="button-card">
        </div>
        <div class="editor-row" style="align-items:flex-start">
          <label style="padding-top:6px">${this._t("editor.btn_element_config")}</label>
          <textarea data-ce-config data-idx="${index}" rows="4">${this._esc(_yamlDump(tab.element_config || {}))}</textarea>
        </div>
        ${this._renderShowInNavField(tab, index)}
        ${this._renderActionSelect(tab, index)}
        ${this._renderAdvancedBlock(tab, index)}
      </div>`;
  }

  /* Keys already covered by a dedicated control for a given tab type — the
     advanced block only shows/edits whatever is left over, so nothing is
     ever edited in two places at once. */
  static _HANDLED_KEYS = {
    player: ["type", "label", "icon", "show_in_nav"],
    search: ["type", "label", "icon", "show_in_nav", "search_layout"],
    library: ["type", "label", "icon", "show_in_nav", "sections", "layout"],
    discovery: ["type", "label", "icon", "show_in_nav"],
    playlist: ["type", "label", "icon", "show_in_nav", "playlist_uri", "playlist_label", "playlist_thumbnail"],
    settings: ["type", "label", "icon", "show_in_nav"],
    button: ["type", "icon", "name", "entity", "show_in_nav", "width", "height"],
    custom_element: ["type", "element", "element_config", "name", "show_in_nav", "width", "height"],
  };

  _renderShowInNavField(tab, index) {
    const checked = tab.show_in_nav !== false;
    return `
      <div class="editor-row">
        <label>${this._t("editor.tab_show_in_nav")}</label>
        <label class="toggle-switch">
          <input type="checkbox" data-field-checkbox="show_in_nav" data-idx="${index}"${checked ? " checked" : ""}>
          <span class="toggle-track"></span>
        </label>
      </div>`;
  }

  /* Generic escape hatch: whatever isn't managed by a dedicated control above
     (e.g. tap_action's `data`/`target`, or any other property) is shown here
     as raw YAML — one text block instead of a form control per property. */
  _renderAdvancedBlock(tab, index) {
    const handled = MyMusicLibraryCardEditor._HANDLED_KEYS[tab.type] || ["type"];
    const extra = {};
    for (const [k, v] of Object.entries(tab)) {
      if (!handled.includes(k)) extra[k] = v;
    }
    const hasExtra = Object.keys(extra).length > 0;
    return `
      <div class="editor-row" style="align-items:flex-start">
        <label style="padding-top:6px">${this._t("editor.advanced_config")}</label>
        <textarea data-advanced-config data-idx="${index}" rows="3" placeholder="${this._t("editor.advanced_config_hint")}">${hasExtra ? this._esc(_yamlDump(extra)) : ""}</textarea>
      </div>`;
  }

  _renderTabBody(tab, index) {
    if (tab.type === "button") return this._renderButtonBody(tab, index);
    if (tab.type === "custom_element") return this._renderCustomElementBody(tab, index);
    let body = `
      <div class="tab-item-body">
        <div class="editor-row">
          <label>${this._t("editor.tab_label")}</label>
          <input data-field="label" data-idx="${index}" type="text" value="${this._esc(tab.label || "")}" placeholder="${this._t("editor.tab_label_hint")}">
        </div>
        <div class="editor-row">
          <label>${this._t("editor.tab_icon")}</label>
          <input data-field="icon" data-idx="${index}" type="text" value="${this._esc(tab.icon || "")}" placeholder="${this._t("editor.tab_icon_hint")}">
        </div>
        ${this._renderShowInNavField(tab, index)}`;
    if (tab.type === "library") body += this._renderSectionsEditor(tab, index);
    if (tab.type === "search") body += this._renderSearchLayoutEditor(tab, index);
    if (tab.type === "playlist") body += this._renderPlaylistEditor(tab, index);
    body += this._renderAdvancedBlock(tab, index);
    body += `</div>`;
    return body;
  }

  _renderSectionsEditor(tab, index) {
    const ALL_SECTIONS = ["artists", "albums", "playlists", "tracks", "radios", "recently_played", "recently_added", "recommended", "flows"];
    const current = tab.sections || ["artists", "albums", "playlists", "tracks"];
    const ordered = [...current, ...ALL_SECTIONS.filter(s => !current.includes(s))];
    const currentLayout = tab.layout || "lanes";
    const enabledCount = current.length;
    const gridDisabled = enabledCount > 1;
    const gridHint = gridDisabled ? this._t("editor.layout_grid_disabled") : "";

    return `
      <div style="margin-top:8px">
        <div class="editor-row">
          <label>${this._t("editor.layout_label")}</label>
          <select data-layout-select data-tab-idx="${index}">
            ${["lanes", "grid", "columns", "auto"].map(l => {
              const dis = (l === "grid" && gridDisabled) ? " disabled" : "";
              const label = this._t(`settings.layout_${l}`) + (l === "grid" && gridDisabled ? ` (⚠)` : "");
              return `<option value="${l}" ${currentLayout === l ? "selected" : ""}${dis} title="${l === "grid" && gridDisabled ? this._esc(gridHint) : ""}">${label}</option>`;
            }).join("")}
          </select>
        </div>
        ${gridDisabled && currentLayout === "grid" ? `<p style="font-size:11px;color:var(--error-color,#db4437);margin:0 0 4px">${this._esc(gridHint)}</p>` : ""}
        <div style="font-size:13px;font-weight:600;margin-bottom:4px">${this._t("editor.sections_title")}</div>
        <div class="section-list">
          ${ordered.map((sec, si) => {
            const enabled = current.includes(sec);
            const posInCurrent = current.indexOf(sec);
            return `
              <div class="section-item">
                <input type="checkbox" data-sec-toggle="${sec}" data-tab-idx="${index}" ${enabled ? "checked" : ""}>
                <label data-sec-toggle="${sec}" data-tab-idx="${index}">${this._t(`lib.${sec}`) || sec}</label>
                <button data-sec-move="up" data-sec="${sec}" data-tab-idx="${index}" ${!enabled || posInCurrent === 0 ? "disabled" : ""}>▲</button>
                <button data-sec-move="down" data-sec="${sec}" data-tab-idx="${index}" ${!enabled || posInCurrent >= current.length - 1 ? "disabled" : ""}>▼</button>
              </div>`;
          }).join("")}
        </div>
      </div>`;
  }

  _renderSearchLayoutEditor(tab, index) {
    const current = tab.search_layout || "rows";
    return `
      <div style="margin-top:8px">
        <div class="editor-row">
          <label>${this._t("editor.search_layout")}</label>
          <select data-search-layout-select data-tab-idx="${index}">
            ${["rows", "columns"].map(l =>
              `<option value="${l}" ${current === l ? "selected" : ""}>${this._t(`editor.search_layout_${l}`)}</option>`
            ).join("")}
          </select>
        </div>
      </div>`;
  }

  _renderPlaylistEditor(tab, index) {
    this._fetchPlaylistOptions();
    const options = this._playlistOptions || [];
    const loading = this._playlistOptionsLoading && !this._playlistOptions;
    return `
      <div style="margin-top:8px">
        <div class="editor-row">
          <label>${this._t("editor.playlist_select")}</label>
          <select data-playlist-select data-tab-idx="${index}" ${loading ? "disabled" : ""}>
            <option value="">${loading ? this._t("lib.loading_short") : this._t("editor.playlist_select_placeholder")}</option>
            ${options.map(p => `<option value="${this._esc(p.media_content_id)}" ${tab.playlist_uri === p.media_content_id ? "selected" : ""}>${this._esc(p.title)}</option>`).join("")}
          </select>
        </div>
      </div>`;
  }

  /** Lazily fetch the user's Music Assistant playlists once, then re-render.
   *  Some providers (e.g. Deezer) only expose their synced playlists through MA's
   *  "favorite" set — a plain favorite=false catalogue call returns none of them,
   *  confirmed via direct API testing (favorite=false + provider=deezer → empty).
   *  Fetch both favorite=false and favorite=true and merge, so coverage doesn't
   *  depend on how a given provider happens to sync into the MA library. */
  async _fetchPlaylistOptions() {
    if (!this._hass || this._playlistOptions || this._playlistOptionsLoading) return;
    this._playlistOptionsLoading = true;
    const PAGE = 100;
    const MAX_PAGES = 10;
    const items = [];
    const seen = new Set();
    const addItems = (batch) => {
      for (const item of batch) {
        const key = item.media_content_id || item.title;
        if (key && !seen.has(key)) { seen.add(key); items.push(item); }
      }
    };
    const fetchPages = async (favorite) => {
      for (let page = 0; page < MAX_PAGES; page++) {
        const offset = page * PAGE;
        const resp = await this._hass.fetchWithAuth(
          `/my_music_library/library?type=playlists&limit=${PAGE}&offset=${offset}&favorite=${favorite}`);
        const data = resp.ok ? await resp.json() : null;
        const batch = data?.items || [];
        addItems(batch);
        if (batch.length < PAGE) break;
      }
    };
    try {
      await fetchPages(false);
      await fetchPages(true);
    } catch (_) {
      // keep whatever was accumulated before the failure
    }
    this._playlistOptions = items;
    this._playlistOptionsLoading = false;
    this._render();
  }

  _renderButtonBody(tab, index) {
    return `
      <div class="tab-item-body">
        <div class="editor-row">
          <label>${this._t("editor.btn_icon")}</label>
          <input data-field="icon" data-idx="${index}" type="text" value="${this._esc(tab.icon || "")}" placeholder="mdi:home">
        </div>
        <div class="editor-row">
          <label>${this._t("editor.btn_name")}</label>
          <input data-field="name" data-idx="${index}" type="text" value="${this._esc(tab.name || "")}">
        </div>
        <div class="editor-row">
          <label>${this._t("editor.btn_entity")}</label>
          <input data-field="entity" data-idx="${index}" type="text" value="${this._esc(tab.entity || "")}" placeholder="light.living_room">
        </div>
        ${this._renderShowInNavField(tab, index)}
        ${this._renderActionSelect(tab, index)}
        ${this._renderAdvancedBlock(tab, index)}
      </div>`;
  }

  _attachEditorListeners(wrap, tabs) {
    // Basic fields
    wrap.querySelector("#ed-default-tab")?.addEventListener("change", (e) => {
      this._config = { ...this._config, default_tab: e.target.value };
      this._fireChanged();
    });
    wrap.querySelector("#ed-entity")?.addEventListener("change", (e) => {
      const val = e.target.value.trim();
      this._config = { ...this._config };
      if (val) this._config.entity = val; else delete this._config.entity;
      this._fireChanged();
    });
    wrap.querySelector("#ed-height")?.addEventListener("change", (e) => {
      const val = e.target.value.trim();
      this._config = { ...this._config };
      if (val) {
        this._config.height = /^\d+$/.test(val) ? parseInt(val) : val;
      } else {
        delete this._config.height;
      }
      this._fireChanged();
    });
    wrap.querySelector("#ed-show-device")?.addEventListener("change", (e) => {
      this._config = { ...this._config, show_device_select: e.target.checked };
      this._fireChanged();
    });
    wrap.querySelector("#ed-show-other-players")?.addEventListener("change", (e) => {
      this._config = { ...this._config };
      if (e.target.checked) this._config.show_other_players = true;
      else delete this._config.show_other_players;
      this._fireChanged();
      this._render();
    });
    wrap.querySelectorAll(".ed-out-row").forEach(row => {
      const eid = row.dataset.eid;
      row.querySelectorAll("input").forEach(input => input.addEventListener("change", () => {
        this._setDeviceOverride(eid, {
          name: row.querySelector(".ed-out-name").value.trim(),
          icon: row.querySelector(".ed-out-icon").value.trim(),
          hidden: row.querySelector(".ed-out-hide").checked,
        });
      }));
    });

    const _setNavBar = (key, val, defaultVal) => {
      const navBar = { ...(this._config.nav_bar || {}) };
      if (val === defaultVal) delete navBar[key]; else navBar[key] = val;
      this._config = { ...this._config };
      if (Object.keys(navBar).length) this._config.nav_bar = navBar;
      else delete this._config.nav_bar;
      this._fireChanged();
    };
    wrap.querySelector("#ed-nav-pos")?.addEventListener("change", (e) => _setNavBar("position", e.target.value, "top"));
    wrap.querySelector("#ed-nav-align")?.addEventListener("change", (e) => _setNavBar("align", e.target.value, "start"));

    // Toggle expand
    wrap.querySelectorAll("[data-toggle-idx]").forEach(el => {
      el.addEventListener("click", (e) => {
        if (e.target.closest("[data-move]") || e.target.closest("[data-delete]")) return;
        const idx = parseInt(el.dataset.toggleIdx);
        this._expandedTab = this._expandedTab === idx ? -1 : idx;
        this._render();
      });
    });

    // Move up/down
    wrap.querySelectorAll("[data-move]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        const dir = btn.dataset.move === "up" ? -1 : 1;
        const t = [...tabs];
        [t[idx], t[idx + dir]] = [t[idx + dir], t[idx]];
        this._expandedTab = idx + dir;
        this._updateTabs(t);
      });
    });

    // Delete
    wrap.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.delete);
        const t = [...tabs];
        t.splice(idx, 1);
        this._expandedTab = -1;
        this._updateTabs(t);
      });
    });

    // Add tab
    wrap.querySelector("#add-tab-btn")?.addEventListener("click", () => {
      this._showAddMenu = true;
      this._render();
    });
    wrap.querySelectorAll("[data-add-type]").forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.addType;
        const t = [...tabs];
        const newTab = { type };
        if (type === "library") newTab.sections = ["artists", "albums", "playlists", "tracks"];
        if (type === "button") { newTab.icon = "mdi:gesture-tap"; newTab.tap_action = { action: "none" }; }
        if (type === "custom_element") { newTab.element = ""; newTab.element_config = {}; newTab.tap_action = { action: "none" }; }
        t.push(newTab);
        this._showAddMenu = false;
        this._expandedTab = t.length - 1;
        this._updateTabs(t);
      });
    });

    // Tab field edits (label, icon, name, entity)
    wrap.querySelectorAll("[data-field]").forEach(input => {
      input.addEventListener("change", () => {
        const idx = parseInt(input.dataset.idx);
        const field = input.dataset.field;
        const val = input.value.trim();
        const t = [...tabs];
        t[idx] = { ...t[idx] };
        if (val) t[idx][field] = val; else delete t[idx][field];
        this._updateTabs(t);
      });
    });

    // show_in_nav toggle (defaults to true, so it's only stored when false)
    wrap.querySelectorAll("[data-field-checkbox]").forEach(input => {
      input.addEventListener("change", () => {
        const idx = parseInt(input.dataset.idx);
        const field = input.dataset.fieldCheckbox;
        const t = [...tabs];
        t[idx] = { ...t[idx] };
        if (input.checked) delete t[idx][field]; else t[idx][field] = false;
        this._updateTabs(t);
      });
    });

    // Advanced (raw YAML) block: merges/overrides whatever isn't managed by a
    // dedicated control above — the escape hatch for tap_action.data/target,
    // hold_action, double_tap_action, or any other one-off property.
    wrap.querySelectorAll("[data-advanced-config]").forEach(ta => {
      ta.addEventListener("change", () => {
        const idx = parseInt(ta.dataset.idx);
        try {
          const extra = _yamlLoad(ta.value.trim() || "{}");
          const t = [...tabs];
          const handled = MyMusicLibraryCardEditor._HANDLED_KEYS[t[idx].type] || ["type"];
          const kept = {};
          for (const k of handled) if (k in t[idx]) kept[k] = t[idx][k];
          t[idx] = { ...kept, ...extra };
          this._updateTabs(t);
        } catch (_) { /* invalid YAML — ignore, keep previous value */ }
      });
    });

    // Button action type change
    wrap.querySelectorAll("[data-btn-action-type]").forEach(select => {
      select.addEventListener("change", () => {
        const idx = parseInt(select.dataset.idx);
        const action = select.value;
        const t = [...tabs];
        t[idx] = { ...t[idx], tap_action: { action } };
        this._updateTabs(t);
      });
    });

    // Button action field edits (navigation_path, url_path, perform_action)
    wrap.querySelectorAll("[data-btn-field]").forEach(input => {
      input.addEventListener("change", () => {
        const idx = parseInt(input.dataset.idx);
        const field = input.dataset.btnField;
        const val = input.value.trim();
        const t = [...tabs];
        t[idx] = { ...t[idx], tap_action: { ...t[idx].tap_action, [field]: val } };
        this._updateTabs(t);
      });
    });

    // Layout select (library tab)
    wrap.querySelectorAll("[data-layout-select]").forEach(sel => {
      sel.addEventListener("change", () => {
        const tabIdx = parseInt(sel.dataset.tabIdx);
        const t = [...tabs];
        t[tabIdx] = { ...t[tabIdx], layout: sel.value };
        this._updateTabs(t);
      });
    });

    // Search layout select
    wrap.querySelectorAll("[data-search-layout-select]").forEach(sel => {
      sel.addEventListener("change", () => {
        const tabIdx = parseInt(sel.dataset.tabIdx);
        const t = [...tabs];
        t[tabIdx] = { ...t[tabIdx], search_layout: sel.value };
        this._updateTabs(t);
      });
    });

    // Playlist select
    wrap.querySelectorAll("[data-playlist-select]").forEach(sel => {
      sel.addEventListener("change", () => {
        const tabIdx = parseInt(sel.dataset.tabIdx);
        const opt = (this._playlistOptions || []).find(p => p.media_content_id === sel.value);
        const t = [...tabs];
        t[tabIdx] = { ...t[tabIdx],
          playlist_uri: sel.value,
          playlist_label: opt?.title || "",
          playlist_thumbnail: opt?.thumbnail || "",
        };
        this._updateTabs(t);
      });
    });

    // Section toggles
    wrap.querySelectorAll("[data-sec-toggle]").forEach(el => {
      const handler = () => {
        const sec = el.dataset.secToggle;
        const tabIdx = parseInt(el.dataset.tabIdx);
        const t = [...tabs];
        t[tabIdx] = { ...t[tabIdx] };
        const current = [...(t[tabIdx].sections || ["artists","albums","playlists","tracks"])];
        const pos = current.indexOf(sec);
        if (pos >= 0) {
          current.splice(pos, 1);
        } else {
          current.push(sec);
        }
        t[tabIdx].sections = current;
        this._updateTabs(t);
      };
      if (el.tagName === "INPUT") el.addEventListener("change", handler);
      else el.addEventListener("click", handler);
    });

    // Section reorder
    wrap.querySelectorAll("[data-sec-move]").forEach(btn => {
      btn.addEventListener("click", () => {
        const sec = btn.dataset.sec;
        const tabIdx = parseInt(btn.dataset.tabIdx);
        const dir = btn.dataset.secMove === "up" ? -1 : 1;
        const t = [...tabs];
        t[tabIdx] = { ...t[tabIdx] };
        const current = [...(t[tabIdx].sections || ["artists","albums","playlists","tracks"])];
        const pos = current.indexOf(sec);
        if (pos < 0) return;
        [current[pos], current[pos + dir]] = [current[pos + dir], current[pos]];
        t[tabIdx].sections = current;
        this._updateTabs(t);
      });
    });

    // Custom element JSON config textarea
    wrap.querySelectorAll("[data-ce-config]").forEach(ta => {
      ta.addEventListener("change", () => {
        const idx = parseInt(ta.dataset.idx);
        try {
          const cfg = _yamlLoad(ta.value.trim() || "{}");
          const t = [...tabs];
          t[idx] = { ...t[idx], element_config: cfg };
          this._updateTabs(t);
        } catch(_) { /* invalid YAML — ignore, keep previous value */ }
      });
    });
  }

  _esc(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
}

if (!customElements.get("my-music-library-card-editor")) {
  customElements.define("my-music-library-card-editor", MyMusicLibraryCardEditor);
}

if (!customElements.get("my-music-library-card")) {
  customElements.define("my-music-library-card", MyMusicLibraryCard);
}

// Self-announce
window.customCards = window.customCards || [];
window.customCards.push({
  type: "my-music-library-card",
  name: "My Music Library",
  description: "A responsive music player for Home Assistant + Music Assistant",
  preview: false,
  documentationURL: "https://github.com/your-user/my-music-library",
});

console.info(
  `%c MY-MUSIC-LIBRARY-CARD %c v${CARD_VERSION} `,
  "background:#1db954;color:#000;font-weight:700;padding:2px 4px;border-radius:3px 0 0 3px",
  "background:#333;color:#fff;padding:2px 4px;border-radius:0 3px 3px 0"
);
