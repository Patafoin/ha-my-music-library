/**
 * My Music Library Card
 * A responsive music player card for Home Assistant + Music Assistant.
 * No external dependencies — pure vanilla JS Custom Element.
 * @version 1.0.0
 */

const CARD_VERSION = "2.9.0";

/* ─── Icons (inline SVG strings) ─────────────────────────── */
const ICONS = {
  play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
  stop: `<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>`,
  prev: `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>`,
  next: `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2.5-6 6-4.25v8.5L8.5 12zM16 6h2v12h-2z"/></svg>`,
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
  music: `<svg viewBox="0 0 24 24"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>`,
  album: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>`,
  artist: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  playlist: `<svg viewBox="0 0 24 24"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
  group: `<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
};

/* ─── i18n ────────────────────────────────────────────────── */
const TRANSLATIONS = {
  en: {
    tabs: { player: "Player", search: "Search", library: "Library" },
    player: {
      nothing_playing: "Nothing playing",
      select_player: "Select a player",
      no_player: "No player found",
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
      artists: "Artists", albums: "Albums", tracks: "Tracks", playlists: "Playlists",
    },
    lib: {
      loading: "Loading library…",
      loading_short: "Loading…",
      artists: "Artists",
      albums: "Albums",
      playlists: "Playlists",
      tracks: "Tracks",
      filter_all: "All",
      filter_local: "Local",
      filter_streaming: "Streaming",
      filter_favorites: "Favorites",
      empty: "Library is empty or Music Assistant is not connected.",
      empty_hint: "Make sure Music Assistant integration is installed and running.",
      no_albums: "No albums found",
      load_error: "Could not load albums",
      album_types: { album: "Albums", ep: "EPs", single: "Singles", compilation: "Compilations" },
    },
    queue: { up_next: "Up Next" },
    nav: { back: "← Back" },
    group: {
      section_master: "Active",
      section_members: "Group members",
      section_available: "Available",
      attach: "Add to group",
      detach: "Remove from group",
      no_players: "No Music Assistant players found.",
    },
  },
  fr: {
    tabs: { player: "Lecteur", search: "Recherche", library: "Bibliothèque" },
    player: {
      nothing_playing: "Rien en cours de lecture",
      select_player: "Sélectionnez un lecteur",
      no_player: "Aucun lecteur trouvé",
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
      artists: "Artistes", albums: "Albums", tracks: "Titres", playlists: "Playlists",
    },
    lib: {
      loading: "Chargement de la bibliothèque…",
      loading_short: "Chargement…",
      artists: "Artistes",
      albums: "Albums",
      playlists: "Playlists",
      tracks: "Titres",
      filter_all: "Tout",
      filter_local: "Local",
      filter_streaming: "Streaming",
      filter_favorites: "Favoris",
      empty: "La bibliothèque est vide ou Music Assistant n'est pas connecté.",
      empty_hint: "Assurez-vous que l'intégration Music Assistant est installée et en cours d'exécution.",
      no_albums: "Aucun album trouvé",
      load_error: "Impossible de charger les albums",
      album_types: { album: "Albums", ep: "EPs", single: "Singles", compilation: "Compilations" },
    },
    queue: { up_next: "À suivre" },
    nav: { back: "← Retour" },
    group: {
      section_master: "Actif",
      section_members: "Membres du groupe",
      section_available: "Disponible",
      attach: "Ajouter au groupe",
      detach: "Retirer du groupe",
      no_players: "Aucun lecteur Music Assistant trouvé.",
    },
  },
  de: {
    tabs: { player: "Wiedergabe", search: "Suche", library: "Bibliothek" },
    player: {
      nothing_playing: "Nichts wird abgespielt",
      select_player: "Player auswählen",
      no_player: "Kein Player gefunden",
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
      artists: "Künstler", albums: "Alben", tracks: "Titel", playlists: "Playlists",
    },
    lib: {
      loading: "Bibliothek wird geladen…",
      loading_short: "Laden…",
      artists: "Künstler",
      albums: "Alben",
      playlists: "Playlists",
      tracks: "Titel",
      filter_all: "Alle",
      filter_local: "Lokal",
      filter_streaming: "Streaming",
      filter_favorites: "Favoriten",
      empty: "Bibliothek ist leer oder Music Assistant ist nicht verbunden.",
      empty_hint: "Stellen Sie sicher, dass die Music Assistant Integration installiert und aktiv ist.",
      no_albums: "Keine Alben gefunden",
      load_error: "Alben konnten nicht geladen werden",
      album_types: { album: "Alben", ep: "EPs", single: "Singles", compilation: "Kompilationen" },
    },
    queue: { up_next: "Als Nächstes" },
    nav: { back: "← Zurück" },
    group: {
      section_master: "Aktiv",
      section_members: "Gruppenmitglieder",
      section_available: "Verfügbar",
      attach: "Zur Gruppe hinzufügen",
      detach: "Aus der Gruppe entfernen",
      no_players: "Keine Music Assistant Player gefunden.",
    },
  },
};

/* ─── CSS ─────────────────────────────────────────────────── */
const STYLES = `
  :host {
    display: block;
    /* In masonry mode, height: 100% has no effect — the host needs an explicit height.
       --mml-height can be overridden via the card config (height option). */
    height: var(--mml-height, 100%);
    min-height: 300px;
    font-family: var(--paper-font-body1_-_font-family, sans-serif);
    --accent: var(--primary-color, #1db954);
    --bg: var(--ha-card-background, var(--card-background-color, #1e1e2e));
    --bg2: color-mix(in srgb, var(--bg) 80%, white 20%);
    --text: var(--primary-text-color, #fff);
    --text2: var(--secondary-text-color, rgba(255,255,255,0.6));
    --border: rgba(255,255,255,0.08);
    --radius: 12px;
    --control-size: 44px;
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
  .nav {
    display: flex;
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .nav-tab {
    flex: 1;
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
    transition: color .2s, background .2s;
    -webkit-tap-highlight-color: transparent;
  }
  .nav-tab svg { width: 18px; height: 18px; fill: currentColor; flex-shrink: 0; }
  .nav-tab.active {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border-bottom: 2px solid var(--accent);
  }
  .nav-tab:not(.active):hover { color: var(--text); background: rgba(255,255,255,0.04); }

  /* ── NAV TABS WRAPPER (allows extra buttons on sides) ── */
  /* align-items: stretch ensures tab buttons fill the full nav height
     even when nav-extra buttons are taller than the default tab padding */
  .nav-tabs { display: flex; flex: 1; overflow: hidden; align-items: stretch; }
  .nav-tab { align-self: stretch; }

  /* ── NAV EXTRA BUTTONS ── */
  /* stretch: buttons fill the full nav height so the tap target equals the nav height */
  .nav-extra { display: flex; align-items: stretch; gap: 2px; padding: 0 4px; flex-shrink: 0; }
  .nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 6px 8px;
    min-width: 36px;
    min-height: 44px; /* comfortable minimum tap target */
    box-sizing: border-box;
    cursor: pointer;
    border: none;
    border-radius: 8px;
    background: none;
    color: var(--text2);
    transition: color .2s, background .2s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation; /* eliminates 300 ms tap delay on mobile/tablet */
    user-select: none;
  }
  .nav-btn:hover { color: var(--text); background: rgba(255,255,255,0.06); }
  .nav-btn:active { background: rgba(255,255,255,0.12); }
  .nav-btn.active { color: var(--accent); }
  .nav-btn ha-icon { --mdc-icon-size: 20px; display: block; pointer-events: none; }
  .nav-btn-label { font-size: 10px; font-weight: 500; line-height: 1; pointer-events: none; }

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
    overflow-y: auto;
    padding: 20px 16px 16px;
    gap: 16px;
  }

  /* Album art */
  .art-wrapper {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }
  .art {
    width: min(200px, 55vw);
    aspect-ratio: 1;
    border-radius: 10px;
    object-fit: cover;
    background: var(--bg2);
    box-shadow: 0 8px 32px rgba(0,0,0,.4);
  }
  .art-placeholder {
    width: min(200px, 55vw);
    aspect-ratio: 1;
    border-radius: 10px;
    background: var(--bg2);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .art-placeholder svg { width: 64px; height: 64px; fill: var(--text2); opacity: .4; }

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
  .ctrl-btn svg { width: 22px; height: 22px; fill: currentColor; }
  .ctrl-btn:hover { color: var(--text); background: rgba(255,255,255,0.07); }
  .ctrl-btn:active { transform: scale(.9); }
  .ctrl-btn.active { color: var(--accent); }
  .ctrl-btn.primary {
    width: 56px;
    height: 56px;
    background: var(--accent);
    color: #000;
  }
  .ctrl-btn.primary svg { width: 28px; height: 28px; }
  .ctrl-btn.primary:hover { filter: brightness(1.1); }

  /* Volume */
  .volume-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .volume-row .ctrl-btn { width: 36px; height: 36px; flex-shrink: 0; }
  .volume-row .ctrl-btn svg { width: 18px; height: 18px; }
  input[type=range] {
    flex: 1;
    -webkit-appearance: none;
    height: 6px;
    border-radius: 3px;
    background: var(--border);
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
  .device-name { flex: 1; font-size: 13px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .device-chevron { width: 16px; height: 16px; fill: var(--text2); flex-shrink: 0; }


  /* Device modal */
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
  .device-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background .15s;
  }
  .device-item:hover { background: rgba(255,255,255,.06); }
  .device-item.selected { color: var(--accent); }
  .device-item.master { cursor: default; }
  .device-item.master:hover { background: none; }
  .device-item.member { color: var(--accent); opacity: .9; }
  .device-item svg { width: 20px; height: 20px; fill: currentColor; }
  .device-item-name { flex: 1; font-size: 14px; }
  .device-item-state { font-size: 11px; color: var(--text2); }

  /* Device modal sections */
  .device-section + .device-section { border-top: 1px solid var(--border); margin-top: 4px; padding-top: 4px; }
  .device-section-title {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .08em; color: var(--text2); padding: 10px 12px 4px; opacity: .65;
  }
  .device-item-action {
    background: none; border: none; cursor: pointer; color: var(--text2); padding: 4px;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    transition: color .15s, background .15s; flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }
  .device-item-action:hover { color: var(--text); background: rgba(255,255,255,.12); }
  .device-item-action svg { width: 16px; height: 16px; fill: currentColor; }
  .device-item-action.attach { color: var(--accent); }
  .device-item-action.detach:hover { color: #ff6b6b; background: rgba(255,107,107,.15); }

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

  .search-section { margin-bottom: 4px; }
  .search-section-title {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--text2);
    padding: 12px 16px 6px;
  }

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
  .library-panel { flex: 1; overflow-y: auto; padding: 0 0 16px; display: flex; flex-direction: column; }

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
  .lib-filter-fav {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 500;
    background: none;
    color: var(--text2);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: background .15s, color .15s, border-color .15s;
    -webkit-tap-highlight-color: transparent;
  }
  .lib-filter-fav:hover { background: rgba(255,255,255,.06); }
  .lib-filter-fav.active { background: var(--accent); color: #000; border-color: var(--accent); }
  .lib-filter-fav svg { width: 14px; height: 14px; fill: currentColor; }

  .lib-content { flex: 1; overflow-y: auto; }

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

  /* Horizontal scroll grid */
  .lib-scroll {
    display: flex;
    gap: 12px;
    padding: 0 16px 4px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .lib-scroll::-webkit-scrollbar { display: none; }
  .lib-sentinel { flex-shrink: 0; width: 1px; height: 1px; pointer-events: none; }
  .lib-sentinel-v { height: 1px; pointer-events: none; }

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
  .lib-list-info { flex: 1; min-width: 0; }
  .lib-list-title { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lib-list-sub { font-size: 12px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

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
    .player-panel { flex: 2; min-width: 0; padding: 20px 24px; overflow-y: auto; }
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
  .queue-header { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--text2); padding: 10px 16px 4px; }
  .queue-item { display: flex; align-items: center; gap: 10px; padding: 8px 16px; cursor: pointer; transition: background .15s; }
  .queue-item:hover { background: rgba(255,255,255,.04); }
  .queue-num { font-size: 12px; color: var(--text2); width: 18px; text-align: right; flex-shrink: 0; }
  .queue-info { flex: 1; min-width: 0; }
  .queue-title { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .queue-sub { font-size: 11px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
  .queue-dur { font-size: 11px; color: var(--text2); flex-shrink: 0; }
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
    this._libLoaded = false;
    this._libSections = {}; // type → { offset, loading, exhausted, favorite, iconName }
    this._libSourceFilter = this._loadPref("mml_lib_source") || "all";
    this._libFavFilter = this._loadPref("mml_lib_fav") === "true";
    this._deviceModalOpen = false;
    this._searching = false;
    this._searchTimeout = null;
    this._searchId = 0;
    this._players = [];
    this._activePlayer = null;
    this._progressInterval = null;
    this._localPosition = null;
    this._localPositionTime = null;
    this._queue = [];
    this._lastQueueSource = null;  // URI of the album/playlist whose queue is loaded
    this._groupMembers = [];       // entity_ids attached to _activePlayer as group
    this._excludedPlayers = [];    // entity_ids hidden from the device picker (HA options)
    this._rendered = false;
    // MA config fetched from backend via WebSocket
    this._maUrl = null;       // stored but only used as a last-resort hint
    this._maEntryId = null;   // MA config entry ID — used for music_assistant/search WS calls
    this._maConfigLoaded = false;
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

  /* ── Queue persistence (server-side, per player) ── */

  /** Load queue for a given player from the HA backend. Fire-and-forget safe. */
  async _loadQueueFromServer(player) {
    if (!player || !this._hass) { this._queue = []; this._lastQueueSource = null; return; }
    try {
      const data = await this._hass.callApi("GET", `my_music_library/queue?player=${encodeURIComponent(player)}`);
      this._queue = data?.queue || [];
      this._lastQueueSource = data?.source || null;
    } catch (_) {
      this._queue = [];
      this._lastQueueSource = null;
    }
    const card = this.shadowRoot?.querySelector(".card-root");
    if (card) this._updateQueueDisplay(card);
  }

  /** Persist the current queue to the HA backend (fire-and-forget). */
  _saveQueueState() {
    if (!this._activePlayer || !this._hass) return;
    this._hass.callApi("POST", "my_music_library/queue", {
      player: this._activePlayer,
      queue: this._queue,
      source: this._lastQueueSource,
    }).catch(() => {});
  }

  /* ── Group persistence (server-side, per player) ── */

  /** Load group members for a given player from the HA backend. */
  async _loadGroupFromServer(player) {
    if (!player || !this._hass) { this._groupMembers = []; return; }
    try {
      const data = await this._hass.callApi("GET", `my_music_library/groups?player=${encodeURIComponent(player)}`);
      const stored = (data?.members || []).filter(id => this._players.find(p => p.entity_id === id));
      // Reconcile with actual HA state: if HA has no group_members, the group was dissolved externally
      const haState = this._hass.states[player];
      const haMembers = (haState?.attributes?.group_members || []).filter(id => id !== player);
      if (stored.length > 0 && haMembers.length === 0) {
        this._groupMembers = [];
        this._saveGroupToServer();
      } else {
        this._groupMembers = stored;
      }
    } catch (_) {
      this._groupMembers = [];
    }
    const card = this.shadowRoot?.querySelector(".card-root");
    if (card) this._updateDeviceRow(card);
  }

  /** Persist group members to the HA backend (fire-and-forget). */
  _saveGroupToServer() {
    if (!this._activePlayer || !this._hass) return;
    this._hass.callApi("POST", "my_music_library/groups", {
      player: this._activePlayer,
      members: this._groupMembers,
    }).catch(() => {});
  }

  /* ── Lovelace required ── */
  setConfig(config) {
    this._config = { default_tab: "player", ...config };
    this._tab = this._config.default_tab || "player";
    // Apply height config option as a CSS custom property on the host element
    if (config.height) {
      this.style.setProperty("--mml-height", String(config.height));
    }
  }

  // Tell Lovelace masonry how many rows to reserve (1 row ≈ 50px)
  getCardSize() {
    const h = this._config?.height;
    if (h && typeof h === "number") return Math.ceil(h / 50);
    if (h && typeof h === "string" && h.endsWith("px")) return Math.ceil(parseInt(h) / 50);
    return 12; // default ~600px
  }

  static getConfigElement() {
    return document.createElement("my-music-library-card-editor");
  }

  static getStubConfig() {
    return { default_tab: "player", height: 600 };
  }

  set hass(hass) {
    this._hass = hass;

    // Fetch integration config from backend once
    if (!this._maConfigLoaded) {
      this._maConfigLoaded = true;
      this._fetchMaConfig();
    }

    this._players = this._getMaPlayers();

    if (this._players.length === 0) {
      this._activePlayer = null;
    } else {
      if (!this._activePlayer || !this._players.find(p => p.entity_id === this._activePlayer)) {
        // Priority: 1) localStorage  2) card config entity  3) currently playing  4) first player
        const saved = this._loadSavedPlayer();
        const prevActive = this._activePlayer;
        this._activePlayer = (saved && this._players.find(p => p.entity_id === saved) ? saved : null)
          || this._config.entity
          || (this._players.find(p => p.state === "playing") || this._players[0])?.entity_id;
        if (this._activePlayer && this._activePlayer !== prevActive) {
          this._loadQueueFromServer(this._activePlayer);
          this._loadGroupFromServer(this._activePlayer);
        }
      }
    }

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    } else {
      this._update();
    }
  }

  connectedCallback() {
    this._startProgressTick();
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
    // Force config re-fetch on next reconnect so excluded_players stays in sync
    // with any options changes made while the card was away from the DOM.
    this._maConfigLoaded = false;
  }

  /* ── Fetch integration config (ma_entry_id, ma_url) via WebSocket ── */
  async _fetchMaConfig() {
    try {
      const cfg = await this._hass.callWS({ type: "my_music_library/config" });
      if (cfg?.ma_entry_id) {
        this._maEntryId = cfg.ma_entry_id;
        // MA entry_id loaded
      }
      if (cfg?.ma_url) {
        this._maUrl = cfg.ma_url.replace(/\/$/, "");
      }
      if (Array.isArray(cfg?.excluded_players)) {
        this._excludedPlayers = cfg.excluded_players;
        // Refresh player list now that exclusions are known
        this._players = this._getMaPlayers();
        const card = this.shadowRoot?.querySelector(".card-root");
        if (card) this._updatePlayerContent(card);
      }
    } catch (e) {
      // Integration config fetch failed
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
      .filter(([id, state]) => id.startsWith("media_player.") && state.state !== "unavailable" && !this._isExcluded(id))
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

    const card = document.createElement("div");
    card.className = "card-root";
    card.innerHTML = `
      ${this._renderNav()}
      <div class="content">
        ${this._renderPlayerTab()}
        ${this._renderSearchTab()}
        ${this._renderLibraryTab()}
      </div>
      ${this._renderDeviceModal()}
    `;
    root.appendChild(card);

    this._attachListeners(card);
    this._setActiveTab(this._tab, card);
    this._updatePlayerContent(card);
  }

  _renderNav() {
    return `
      <nav class="nav">
        <div class="nav-extra nav-extra-left">${this._renderNavButtons(this._config.nav_buttons_left, "left")}</div>
        <div class="nav-tabs">
          <button class="nav-tab ${this._tab === "player" ? "active" : ""}" data-tab="player">
            ${ICONS.player}<span>${this._t("tabs.player")}</span>
          </button>
          <button class="nav-tab ${this._tab === "search" ? "active" : ""}" data-tab="search">
            ${ICONS.search}<span>${this._t("tabs.search")}</span>
          </button>
          <button class="nav-tab ${this._tab === "library" ? "active" : ""}" data-tab="library">
            ${ICONS.library}<span>${this._t("tabs.library")}</span>
          </button>
        </div>
        <div class="nav-extra nav-extra-right">${this._renderNavButtons(this._config.nav_buttons_right, "right")}</div>
      </nav>`;
  }

  _renderNavButtons(buttons, side) {
    if (!buttons?.length) return "";
    return buttons.map((btn, i) => {
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
                data-nav-side="${side}" data-nav-idx="${i}"
                title="${this._esc(title)}"${sizeStyle}>
          <ha-icon icon="${this._esc(icon)}"></ha-icon>
          ${label ? `<span class="nav-btn-label">${this._esc(label)}</span>` : ""}
        </button>`;
    }).join("");
  }

  _renderPlayerTab() {
    return `
      <div class="tab-panel" data-panel="player">
        <div class="player-tab-body">
          <div class="player-panel">
            <div class="player-left">
              <div class="art-wrapper" id="art-wrapper"></div>
            </div>
            <div class="player-right">
              <div class="track-info">
                <div class="track-title" id="track-title">—</div>
                <div class="track-artist" id="track-artist">${this._t("player.select_player")}</div>
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
                <button class="ctrl-btn" id="btn-prev" title="${this._t("btns.prev")}">${ICONS.prev}</button>
                <button class="ctrl-btn primary" id="btn-playpause" title="${this._t("btns.play_pause")}">${ICONS.play}</button>
                <button class="ctrl-btn" id="btn-next" title="${this._t("btns.next")}">${ICONS.next}</button>
                <button class="ctrl-btn" id="btn-repeat" title="${this._t("btns.repeat")}">${ICONS.repeat}</button>
              </div>
              <div class="volume-row">
                <button class="ctrl-btn" id="btn-mute" title="${this._t("btns.mute")}">${ICONS.volumeHigh}</button>
                <input type="range" id="volume-slider" min="0" max="100" value="50">
              </div>
              <div class="device-row" id="device-row">
                <span id="device-icon-wrap">${ICONS.device}</span>
                <span class="device-name" id="device-name">${this._t("player.no_player")}</span>
                ${ICONS.chevronRight}
              </div>
            </div>
          </div>
          <div class="queue-section" id="queue-section" style="display:none">
            <div class="queue-header">${this._t("queue.up_next")}</div>
            <div id="queue-list"></div>
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

  _renderLibraryTab() {
    const src = this._libSourceFilter;
    const fav = this._libFavFilter;
    return `
      <div class="tab-panel" data-panel="library">
        <div class="library-panel" id="library-content">
          <div class="lib-filters" id="lib-filters">
            <div class="lib-filter-group" id="lib-source-filter">
              <button class="lib-filter-btn ${src === "all" ? "active" : ""}" data-source="all">${this._t("lib.filter_all")}</button>
              <button class="lib-filter-btn ${src === "local" ? "active" : ""}" data-source="local">${this._t("lib.filter_local")}</button>
              <button class="lib-filter-btn ${src === "streaming" ? "active" : ""}" data-source="streaming">${this._t("lib.filter_streaming")}</button>
            </div>
            <button class="lib-filter-fav ${fav ? "active" : ""}" id="lib-fav-filter">
              ${fav ? ICONS.heart : ICONS.heartOutline}<span>${this._t("lib.filter_favorites")}</span>
            </button>
          </div>
          <div class="lib-content" id="lib-content-inner">
            <div class="loader"><div class="spinner"></div> ${this._t("lib.loading")}</div>
          </div>
        </div>
      </div>`;
  }

  _renderDeviceModal() {
    return `
      <div class="modal-overlay" id="device-modal">
        <div class="modal-sheet">
          <div class="modal-title">
            <span>Choose a device</span>
            <button id="modal-close">${ICONS.close}</button>
          </div>
          <div id="device-list"></div>
        </div>
      </div>`;
  }

  /* ── Event Listeners ── */
  _attachListeners(card) {
    // Nav tabs
    card.querySelectorAll(".nav-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        this._setActiveTab(tab, card);
        if (tab === "library" && !this._libLoaded) this._loadLibrary();
      });
    });

    // Library source filter (All / Local / Streaming)
    card.querySelector("#lib-source-filter")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".lib-filter-btn");
      if (!btn || btn.classList.contains("active")) return;
      const source = btn.dataset.source;
      this._libSourceFilter = source;
      this._savePref("mml_lib_source", source);
      card.querySelectorAll("#lib-source-filter .lib-filter-btn").forEach(b => b.classList.toggle("active", b.dataset.source === source));
      this._reloadLibrary();
    });

    // Library favorites filter
    card.querySelector("#lib-fav-filter")?.addEventListener("click", () => {
      this._libFavFilter = !this._libFavFilter;
      this._savePref("mml_lib_fav", String(this._libFavFilter));
      const btn = card.querySelector("#lib-fav-filter");
      btn.classList.toggle("active", this._libFavFilter);
      btn.querySelector("svg").outerHTML = this._libFavFilter ? ICONS.heart : ICONS.heartOutline;
      this._reloadLibrary();
    });

    // Player controls
    card.querySelector("#btn-playpause").addEventListener("click", () => this._togglePlayPause());
    card.querySelector("#btn-prev").addEventListener("click", () => this._callService("media_previous_track"));
    card.querySelector("#btn-next").addEventListener("click", () => this._callService("media_next_track"));
    card.querySelector("#btn-shuffle").addEventListener("click", () => this._toggleShuffle());
    card.querySelector("#btn-repeat").addEventListener("click", () => this._cycleRepeat());
    card.querySelector("#btn-mute").addEventListener("click", () => this._toggleMute());

    // Volume — send command only on release (pointerup), not during drag
    const volSlider = card.querySelector("#volume-slider");
    volSlider.addEventListener("pointerdown", () => { this._volumeDragging = true; });
    const endVolDrag = (e) => {
      if (!this._volumeDragging) return;
      this._volumeDragging = false;
      this._callService("volume_set", { volume_level: parseInt(e.target.value) / 100 });
    };
    volSlider.addEventListener("pointerup", endVolDrag);
    volSlider.addEventListener("pointercancel", () => { this._volumeDragging = false; });

    // Progress bar — seek on release only (covers both tap and drag)
    const progressBar = card.querySelector("#progress-bar");
    const progressFill = card.querySelector("#progress-fill");
    const posTimeEl = card.querySelector("#pos-time");
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
    };
    progressBar.addEventListener("pointerup", endSeekDrag);
    progressBar.addEventListener("pointercancel", () => {
      this._seekDragging = false;
      progressFill.style.transition = "";
    });

    // Device row
    card.querySelector("#device-row").addEventListener("click", () => this._openDeviceModal(card));
    card.querySelector("#modal-close").addEventListener("click", () => this._closeDeviceModal(card));
    card.querySelector("#device-modal").addEventListener("click", (e) => {
      if (e.target === card.querySelector("#device-modal")) this._closeDeviceModal(card);
    });

    // Search
    const searchInput = card.querySelector("#search-input");
    searchInput.addEventListener("input", (e) => {
      clearTimeout(this._searchTimeout);
      this._searchQuery = e.target.value;
      if (this._searchQuery.trim().length < 2) {
        this._renderSearchResults(card, null);
        return;
      }
      this._searchTimeout = setTimeout(() => this._doSearch(card), 700);
    });

    // Nav extra buttons (tap / hold / double-tap → HA actions)
    card.querySelectorAll(".nav-btn").forEach(btn => {
      let holdTimer = null;
      let didHold = false;

      const getBtnCfg = () => {
        const side = btn.dataset.navSide;
        const idx = parseInt(btn.dataset.navIdx, 10);
        const list = side === "left" ? this._config.nav_buttons_left : this._config.nav_buttons_right;
        return list?.[idx];
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
    if (this._tab === "library" && !this._libLoaded) this._loadLibrary();
  }

  _updateNavButtons(card) {
    const sides = [
      { side: "left",  buttons: this._config.nav_buttons_left  || [] },
      { side: "right", buttons: this._config.nav_buttons_right || [] },
    ];
    for (const { side, buttons } of sides) {
      buttons.forEach((btn, i) => {
        if (!btn.entity) return;
        const st = this._hass?.states[btn.entity];
        const isActive = st ? ["on", "playing", "active", "home"].includes(st.state) : false;
        const el = card.querySelector(`.nav-btn[data-nav-side="${side}"][data-nav-idx="${i}"]`);
        if (el) el.classList.toggle("active", isActive);
      });
    }
  }

  _updatePlayerContent(card) {
    const state = this._getActiveState();
    const attr = state?.attributes || {};
    const isPlaying = state?.state === "playing";

    // Album art
    const artWrapper = card.querySelector("#art-wrapper");
    if (artWrapper) {
      if (attr.entity_picture) {
        artWrapper.innerHTML = `<img class="art" src="${this._hass.hassUrl(attr.entity_picture)}" alt="Album art">`;
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

    // Play/pause button
    const ppBtn = card.querySelector("#btn-playpause");
    if (ppBtn) ppBtn.innerHTML = isPlaying ? ICONS.pause : ICONS.play;

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

    // Volume — skip update while user is dragging to prevent snap-back
    const volSlider = card.querySelector("#volume-slider");
    if (volSlider && attr.volume_level !== undefined && !this._volumeDragging) {
      volSlider.value = Math.round(attr.volume_level * 100);
    }

    // Mute
    const muteBtn = card.querySelector("#btn-mute");
    if (muteBtn) {
      muteBtn.innerHTML = attr.is_volume_muted ? ICONS.volumeMute : ICONS.volumeHigh;
      muteBtn.classList.toggle("active", !!attr.is_volume_muted);
    }

    // Progress
    this._updateProgress(card, state);

    // Device row (name + icon reflect group state)
    this._updateDeviceRow(card);

    // Queue update logic:
    // - New album/playlist URI detected → fetch its tracks.
    // - Track URI detected AND track is in current queue → keep queue (normal playback).
    // - Track URI detected AND track NOT in queue → source changed externally, clear stale queue.
    // - Any other URI type (null, stopped, etc.) → just redisplay, never clear.
    const currentUri = attr.media_content_id || null;
    const uriType = this._maUriType(currentUri);
    if ((uriType === "album" || uriType === "playlist") && currentUri !== this._lastQueueSource) {
      this._lastQueueSource = currentUri;
      this._saveQueueState();
      const action = uriType === "album" ? "album_tracks" : "playlist_tracks";
      this._fetchQueueForUri(currentUri, action, card);
    } else if (uriType === "track" && this._queue.length > 0) {
      const inQueue = this._queue.some(t => t.media_content_id === currentUri);
      if (!inQueue) {
        // Playing something outside our cached queue → discard stale queue
        this._queue = [];
        this._lastQueueSource = null;
        this._saveQueueState();
      }
      this._updateQueueDisplay(card);
    } else {
      this._updateQueueDisplay(card);
    }
  }

  /** Extract the item type from a MA URI: "spotify://album/123" → "album" */
  _maUriType(uri) {
    if (!uri || !uri.includes("://")) return null;
    const rest = uri.split("://")[1] || "";
    const parts = rest.split("/").filter(Boolean);
    return parts[0] || null; // "album", "track", "artist", "playlist", …
  }

  async _fetchQueueForUri(uri, action, card) {
    try {
      const data = await this._hass.callApi(
        "GET",
        `my_music_library/subitems?action=${action}&uri=${encodeURIComponent(uri)}&limit=100`
      );
      this._queue = data?.items || [];
      if (action === "album_tracks") {
        this._queue.sort((a, b) => (a.track_number || 0) - (b.track_number || 0));
      }
      this._saveQueueState();
      this._updateQueueDisplay(card);
    } catch (err) {
      // Auto-queue fetch failed
    }
  }

  _updateProgress(card, state) {
    const attr = state?.attributes || {};
    const dur = attr.media_duration || 0;
    const isPlaying = state?.state === "playing";

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

    pos = Math.min(pos || 0, dur);
    const pct = dur > 0 ? (pos / dur) * 100 : 0;

    const fill = card.querySelector("#progress-fill");
    const posTime = card.querySelector("#pos-time");
    const durTime = card.querySelector("#dur-time");

    if (fill && !this._seekDragging) fill.style.width = `${pct.toFixed(1)}%`;
    if (posTime && !this._seekDragging) posTime.textContent = fmt(pos);
    if (durTime) durTime.textContent = fmt(dur);
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

  /* ── Device row ── */
  _updateDeviceRow(card) {
    const state = this._getActiveState();
    const attr = state?.attributes || {};
    const name = attr.friendly_name || this._activePlayer || this._t("player.no_player");
    const count = this._groupMembers.length;

    const nameEl = card.querySelector("#device-name");
    if (nameEl) nameEl.textContent = count > 0 ? `${name} +${count}` : name;

    const iconWrap = card.querySelector("#device-icon-wrap");
    if (iconWrap) iconWrap.innerHTML = count > 0 ? ICONS.group : ICONS.device;
  }

  /* ── Device modal ── */
  _openDeviceModal(card) {
    const modal = card.querySelector("#device-modal");
    const list = card.querySelector("#device-list");
    list.innerHTML = "";

    if (this._players.length === 0) {
      list.innerHTML = `<div class="empty-state"><p>${this._t("group.no_players")}</p></div>`;
      modal.classList.add("open");
      return;
    }

    const addSection = (title, entries) => {
      if (!entries.length) return;
      const section = document.createElement("div");
      section.className = "device-section";
      section.innerHTML = `<div class="device-section-title">${title}</div>`;
      entries.forEach(({ player, role }) => section.appendChild(this._buildDeviceItem(player, role, card)));
      list.appendChild(section);
    };

    const masterPlayer = this._players.find(p => p.entity_id === this._activePlayer);
    const members     = this._players.filter(p => this._groupMembers.includes(p.entity_id));
    const available   = this._players.filter(p => p.entity_id !== this._activePlayer && !this._groupMembers.includes(p.entity_id));

    if (masterPlayer) addSection(this._t("group.section_master"), [{ player: masterPlayer, role: "master" }]);
    addSection(this._t("group.section_members"), members.map(p => ({ player: p, role: "member" })));
    addSection(this._t("group.section_available"), available.map(p => ({ player: p, role: "available" })));

    modal.classList.add("open");
  }

  _buildDeviceItem(player, role, card) {
    const item = document.createElement("div");
    item.className = `device-item${role === "master" ? " selected master" : role === "member" ? " member" : ""}`;

    const iconSvg = role === "member" ? ICONS.group : ICONS.device;
    // Show + only if the player declares MediaPlayerEntityFeature.GROUPING in HA.
    const canGroup = player.canJoin;
    let actionHtml = "";
    if (role === "member") {
      actionHtml = `<button class="device-item-action detach" title="${this._t("group.detach")}">${ICONS.close}</button>`;
    } else if (role === "available" && canGroup) {
      actionHtml = `<button class="device-item-action attach" title="${this._t("group.attach")}">${ICONS.plus}</button>`;
    }

    item.innerHTML = `
      ${iconSvg}
      <span class="device-item-name">${this._esc(player.name)}</span>
      <span class="device-item-state">${this._esc(player.state)}</span>
      ${actionHtml}`;

    if (role === "available") {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".attach")) return;
        const prevActive = this._activePlayer;
        this._activePlayer = player.entity_id;
        this._savePlayer(player.entity_id);
        if (this._activePlayer !== prevActive) {
          this._groupMembers = [];
          this._loadQueueFromServer(this._activePlayer);
          this._loadGroupFromServer(this._activePlayer);
        }
        this._closeDeviceModal(card);
        this._updatePlayerContent(card);
      });
      const attachBtn = item.querySelector(".attach");
      if (attachBtn) {
        attachBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this._attachPlayer(player.entity_id, card);
        });
      }
    } else if (role === "member") {
      const detachBtn = item.querySelector(".detach");
      if (detachBtn) {
        detachBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this._detachPlayer(player.entity_id, card);
        });
      }
    }
    return item;
  }

  _attachPlayer(entityId, card) {
    if (!this._hass || !this._activePlayer || entityId === this._activePlayer) return;
    if (this._groupMembers.includes(entityId)) return;
    const newMembers = [...this._groupMembers, entityId];
    this._hass.callService("media_player", "join", {
      entity_id: this._activePlayer,
      group_members: newMembers,
    });
    this._groupMembers = newMembers;
    this._saveGroupToServer();
    this._openDeviceModal(card);
    this._updateDeviceRow(card);
  }

  _detachPlayer(entityId, card) {
    if (!this._hass) return;
    const remainingMembers = this._groupMembers.filter(id => id !== entityId);
    if (remainingMembers.length > 0) {
      // Reduce the group by re-issuing join with the smaller list.
      // This removes the detached player without calling unjoin on it directly,
      // which is not supported by all media_player platforms.
      this._hass.callService("media_player", "join", {
        entity_id: this._activePlayer,
        group_members: remainingMembers,
      });
    } else {
      // Last member removed → dissolve the group by unjoining the master.
      this._hass.callService("media_player", "unjoin", {
        entity_id: this._activePlayer,
      });
    }
    this._groupMembers = remainingMembers;
    this._saveGroupToServer();
    this._openDeviceModal(card);
    this._updateDeviceRow(card);
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

  _closeDeviceModal(card) {
    card.querySelector("#device-modal").classList.remove("open");
  }

  /* ── Search ── */
  async _doSearch(card) {
    if (!this._hass) return;

    // Cancellation token: ignore results from superseded requests
    const id = ++this._searchId;
    const query = this._searchQuery;

    this._searchLoading = true;
    const resultsEl = card.querySelector("#search-results");
    resultsEl.innerHTML = `<div class="loader"><div class="spinner"></div> ${this._t("search.searching")}</div>`;

    let results = null;

    // Strategies 1+2 in parallel — use first non-null result
    {
      const candidates = [this._searchViaHaProxy(query)];
      if (this._maEntryId) candidates.push(this._searchViaMaWs(query));
      const settled = await Promise.allSettled(candidates);
      for (const r of settled) {
        if (r.status === "fulfilled" && r.value) { results = r.value; break; }
      }
    }

    // Strategy 3 — browse_media on a confirmed MA entity (last resort)
    if (!results) {
      const browseEntity = this._getBrowseEntity();
      if (browseEntity) {
        results = await this._searchViaBrowseMedia(browseEntity, query);
      }
    }

    // Nothing worked
    if (!results) {
      results = {
        tracks: [], artists: [], albums: [], playlists: [],
        error: this._t("search.unavailable"),
      };
    }

    // Discard results if a newer search has been fired in the meantime
    if (id !== this._searchId) return;

    this._searchResults = results;
    this._searchLoading = false;
    this._renderSearchResults(card, this._searchResults);
  }

  /* Search via HA proxy endpoint /api/my_music_library/search
     The HA backend calls MA server-side → no CORS, works from HTTPS. */
  async _searchViaHaProxy(query) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const data = await this._hass.callApi(
        "GET",
        `my_music_library/search?query=${encodedQuery}&limit=25`
      );
      if (!data) return null;
      const results = this._parseMaWsSearchResults(data);
      // Search via HA proxy done
      return results;
    } catch (e) {
      // HA proxy search failed
      return null;
    }
  }

  /* Search via music_assistant/search WebSocket command (registered by MA integration).
     Passes through HA — no CORS, works from HTTPS. */
  async _searchViaMaWs(query) {
    // MA 2.x registers "music_assistant/search" with entry_id + search_query
    // Older versions may use different param names — try both shapes.
    const attempts = [
      { type: "music_assistant/search", entry_id: this._maEntryId, search_query: query, limit: 25 },
      { type: "music_assistant/search", entry_id: this._maEntryId, name: query, limit: 25 },
      { type: "music_assistant/search_media_items", entry_id: this._maEntryId, search_query: query, limit: 25 },
    ];

    for (const msg of attempts) {
      try {
        const result = await this._hass.callWS(msg);
        if (result) {
          // MA WS search succeeded
          return this._parseMaWsSearchResults(result);
        }
      } catch (e) {
        // MA WS search attempt failed
      }
    }
    return null;
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
        out[key].push({
          id: item.uri || item.item_id || "",
          type,
          title: item.name || item.title || "",
          subtitle: item.artists?.[0]?.name || item.artist?.name || item.owner_name || "",
          thumbnail: item.metadata?.images?.[0]?.path || item.image?.path || null,
          can_play: true,
        });
      }
    }
    // Return null if all buckets empty (probably wrong format, try next strategy)
    const total = Object.values(out).reduce((s, a) => s + a.length, 0);
    return total > 0 ? out : null;
  }

  /* Search via HA browse_media WebSocket on an MA media_player entity */
  async _searchViaBrowseMedia(entityId, query) {
    const attempts = [
      { media_content_id: `music_assistant://search?query=${encodeURIComponent(query)}`, media_content_type: "" },
      { media_content_id: `music_assistant://search?query=${encodeURIComponent(query)}`, media_content_type: "search" },
    ];
    for (const attempt of attempts) {
      try {
        const result = await this._hass.callWS({
          type: "media_player/browse_media",
          entity_id: entityId,
          ...attempt,
        });
        return this._parseSearchResults(result);
      } catch (e) {
        // browse_media search failed
      }
    }
    return null;
  }

  _parseSearchResults(browseResult) {
    const out = { tracks: [], artists: [], albums: [], playlists: [] };
    if (!browseResult?.children) return out;
    for (const child of browseResult.children) {
      const type = (child.media_content_type || "").toLowerCase();
      const item = {
        id: child.media_content_id,
        type,
        title: child.title,
        subtitle: child.media_artist || child.media_album_name || "",
        thumbnail: child.thumbnail,
        can_play: child.can_play,
        can_expand: child.can_expand,
      };
      if (type === "track" || type === "music") out.tracks.push(item);
      else if (type === "artist") out.artists.push(item);
      else if (type === "album") out.albums.push(item);
      else if (type === "playlist") out.playlists.push(item);
      else out.tracks.push(item); // default bucket
    }
    return out;
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

    const sections = [
      { key: "artists",   label: this._t("search.artists"),   icon: "artist",   card: true,  limit: 15 },
      { key: "albums",    label: this._t("search.albums"),    icon: "album",    card: true,  limit: 15 },
      { key: "tracks",    label: this._t("search.tracks"),    icon: "music",    card: false, limit: 10 },
      { key: "playlists", label: this._t("search.playlists"), icon: "playlist", card: true,  limit: 15 },
    ];

    // Clear and render each section progressively via microtasks
    el.innerHTML = "";
    let total = 0;
    let pending = sections.length;

    for (const { key, label, icon: iconName, card: isCard, limit } of sections) {
      const items = (results[key] || []).slice(0, limit);
      if (items.length === 0) { pending--; continue; }
      total += items.length;

      // Use a microtask so each section paints independently
      queueMicrotask(() => {
        const secHtml = isCard
          ? `<div class="search-section">
               <div class="search-section-title">${label}</div>
               <div class="lib-scroll">${items.map(i => this._renderSearchCard(i, iconName)).join("")}</div>
             </div>`
          : `<div class="search-section">
               <div class="search-section-title">${label}</div>
               ${items.map(i => this._renderResultItem(i, iconName)).join("")}
             </div>`;
        const tmp = document.createElement("div");
        tmp.innerHTML = secHtml;
        while (tmp.firstChild) el.appendChild(tmp.firstChild);
        this._attachItemActions(el);
      });
    }

    if (total === 0) {
      el.innerHTML = `<div class="empty-state">${ICONS.search}<p>${this._t("search.no_results")} « ${this._searchQuery} »</p></div>`;
    }
  }

  _renderResultItem(item, iconName) {
    const thumb = item.thumbnail
      ? `<img class="result-thumb" src="${item.thumbnail}" alt="" loading="lazy">`
      : `<div class="result-thumb-placeholder">${ICONS[iconName] || ICONS.music}</div>`;
    return `
      <div class="result-item">
        ${thumb}
        <div class="result-info">
          <div class="result-title">${this._esc(item.title)}</div>
          ${item.subtitle ? `<div class="result-sub">${this._esc(item.subtitle)}</div>` : ""}
        </div>
        ${item.can_play ? `<button class="result-play" data-action="play" data-id="${this._esc(item.id)}" data-type="${this._esc(item.type)}" title="Play">${ICONS.play}</button>` : ""}
      </div>`;
  }

  /* ── Library ── */

  static _LOCAL_PROVIDERS = ["filesystem_local", "filesystem_smb", "filesystem_nfs", "plex"];

  _isLocalProvider(domain) {
    return MyMusicLibraryCard._LOCAL_PROVIDERS.some(p => domain.startsWith(p));
  }

  _filterLibItems(items) {
    if (this._libSourceFilter === "all") return items;
    return items.filter(item => {
      const provs = item.providers || [];
      if (provs.length === 0) {
        // Fallback: infer from URI scheme
        const uri = item.media_content_id || "";
        const scheme = uri.includes("://") ? uri.split("://")[0] : "";
        if (this._libSourceFilter === "local") return this._isLocalProvider(scheme);
        return scheme && !this._isLocalProvider(scheme);
      }
      if (this._libSourceFilter === "local") return provs.some(p => this._isLocalProvider(p));
      return provs.some(p => !this._isLocalProvider(p));
    });
  }

  _reloadLibrary() {
    this._libLoaded = false;
    this._loadLibrary();
  }

  async _loadLibrary() {
    if (!this._hass) return;

    const card = this.shadowRoot.querySelector(".card-root");
    const libEl = card?.querySelector("#lib-content-inner");
    if (!libEl) return;

    this._libLoaded = true;
    this._libLoadId = (this._libLoadId || 0) + 1;
    const loadId = this._libLoadId;
    const favorite = this._libFavFilter;
    const sourceFilter = this._libSourceFilter;

    const SECTIONS = [
      { type: "artists",   label: this._t("lib.artists"),   icon: "artist",   favorite },
      { type: "albums",    label: this._t("lib.albums"),    icon: "album",    favorite },
      { type: "playlists", label: this._t("lib.playlists"), icon: "playlist", favorite },
      { type: "tracks",    label: this._t("lib.tracks"),    icon: "music",    favorite },
    ];
    const PAGE = 25;
    const MAX_PAGES = 8;

    libEl.innerHTML = `<div class="loader" id="lib-loader"><div class="spinner"></div> ${this._t("lib.loading")}</div>`;
    this._libSections = {};

    // Helper: build section HTML
    const sectionHtml = (type, label, iconName, items) => {
      const isTrackList = iconName === "music";
      return `
        <div class="lib-section" id="lib-sec-${type}">
          <div class="lib-section-header">
            <span class="lib-section-title">${label}</span>
          </div>
          ${isTrackList
            ? `<div id="lib-list-${type}">${items.map(i => this._renderLibListItem(i)).join("")}
                 <div class="lib-sentinel-v" id="lib-sentinel-${type}"></div>
               </div>`
            : `<div class="lib-scroll" id="lib-scroll-${type}">${items.map(i => this._renderLibCard(i, iconName)).join("")}
                 <div class="lib-sentinel" id="lib-sentinel-${type}"></div>
               </div>`
          }
        </div>`;
    };

    // Helper: append a section to the DOM and wire up actions
    const appendSection = (type, label, iconName, items) => {
      if (loadId !== this._libLoadId) return; // stale load
      const loader = libEl.querySelector("#lib-loader");
      if (loader) loader.remove();
      const tmp = document.createElement("div");
      tmp.innerHTML = sectionHtml(type, label, iconName, items);
      while (tmp.firstChild) libEl.appendChild(tmp.firstChild);
      const sec = libEl.querySelector(`#lib-sec-${type}`);
      if (sec) this._attachItemActions(sec);
    };

    // Fetch one section: first page in parallel, then lazy-paginate if source filter needs more
    const fetchSection = async (s) => {
      let offset = 0;
      let exhausted = false;
      let pages = 0;
      let rendered = false;

      while (pages < MAX_PAGES && !exhausted) {
        if (loadId !== this._libLoadId) return; // stale load
        pages++;
        const r = await this._hass.callApi(
          "GET",
          `my_music_library/library?type=${s.type}&limit=${PAGE}&offset=${offset}&favorite=${s.favorite}`
        );
        const raw = r?.items || [];
        offset += raw.length;
        if (raw.length < PAGE) exhausted = true;

        const filtered = this._filterLibItems(raw);

        if (filtered.length > 0 && !rendered) {
          // First batch with results — render immediately
          this._libSections[s.type] = { offset, loading: false, exhausted, favorite: s.favorite, iconName: s.icon };
          appendSection(s.type, s.label, s.icon, filtered);
          rendered = true;
          // No source filter or server exhausted → done
          if (sourceFilter === "all" || exhausted) break;
          // Source filter active — continue fetching more in background to append
          continue;
        }

        if (filtered.length > 0 && rendered) {
          // Subsequent batches — append to existing section
          this._libSections[s.type].offset = offset;
          this._libSections[s.type].exhausted = exhausted;
          const isTrackList = s.icon === "music";
          const sentinel = libEl.querySelector(`#lib-sentinel-${s.type}`);
          const container = isTrackList
            ? libEl.querySelector(`#lib-list-${s.type}`)
            : libEl.querySelector(`#lib-scroll-${s.type}`);
          if (container && sentinel) {
            const tmp = document.createElement("div");
            tmp.innerHTML = filtered.map(i => isTrackList ? this._renderLibListItem(i) : this._renderLibCard(i, s.icon)).join("");
            while (tmp.firstChild) container.insertBefore(tmp.firstChild, sentinel);
            this._attachItemActions(container);
          }
          break;
        }

        // 0 filtered results — stop if no source filter or server exhausted
        if (sourceFilter === "all" || exhausted) break;
        // Source filter active, 0 matches so far — try next page
      }

      // Register section state even if nothing rendered
      if (!this._libSections[s.type]) {
        this._libSections[s.type] = { offset, loading: false, exhausted: true, favorite: s.favorite, iconName: s.icon };
      }
    };

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
  }

  _attachLibInfiniteScroll(libEl) {
    // Horizontal scroll sections: listen on the scroll container
    for (const [type, state] of Object.entries(this._libSections)) {
      if (state.iconName === "music") continue; // tracks handled via vertical scroll
      const scrollEl = libEl.querySelector(`#lib-scroll-${type}`);
      if (!scrollEl) continue;
      scrollEl.addEventListener("scroll", () => {
        const remaining = scrollEl.scrollWidth - scrollEl.scrollLeft - scrollEl.clientWidth;
        if (remaining < 300 && !state.loading && !state.exhausted) {
          this._loadMoreLibSection(type, libEl);
        }
      }, { passive: true });
    }

    // Vertical scroll (tracks): listen on the library panel itself
    const tracksState = this._libSections["tracks"];
    if (tracksState) {
      libEl.addEventListener("scroll", () => {
        const remaining = libEl.scrollHeight - libEl.scrollTop - libEl.clientHeight;
        if (remaining < 300 && !tracksState.loading && !tracksState.exhausted) {
          this._loadMoreLibSection("tracks", libEl);
        }
      }, { passive: true });
    }
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

    const appendItems = (items) => {
      const sentinel = libEl.querySelector(`#lib-sentinel-${type}`);
      const container = isTrackList
        ? libEl.querySelector(`#lib-list-${type}`)
        : libEl.querySelector(`#lib-scroll-${type}`);
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
        const data = await this._hass.callApi("GET",
          `my_music_library/library?type=${type}&limit=${PAGE}&offset=${state.offset}&favorite=${favorite}`);
        const rawItems = data?.items || [];

        if (rawItems.length < PAGE) state.exhausted = true;
        state.offset += rawItems.length;

        const filtered = this._filterLibItems(rawItems);
        if (filtered.length > 0) {
          appendItems(filtered);
          break;
        }
        // Source filter active, 0 matches — try next page
        if (sourceFilter === "all" || state.exhausted) break;
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
      ? `<img class="${artClass}" src="${item.thumbnail}" alt="" loading="lazy">`
      : `<div class="${placeholderClass}">${ICONS[iconName] || ICONS.music}</div>`;
    const type = item.type || iconName;
    const action = type === "artist" ? "browse" : (type === "track" ? "play" : "play-queue");
    const extra = type === "artist" ? `data-title="${this._esc(item.title)}" data-thumb="${this._esc(item.thumbnail || "")}"` : "";
    return `
      <div class="search-card" data-action="${action}" data-id="${this._esc(item.id)}" data-type="${type}" ${extra}>
        ${art}
        <div class="search-card-name">${this._esc(item.title)}</div>
        ${item.subtitle ? `<div class="search-card-sub">${this._esc(item.subtitle)}</div>` : ""}
      </div>`;
  }

  _attachItemActions(container) {
    container.querySelectorAll("[data-action]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const { action, id, type, title, thumb } = el.dataset;
        if (action === "browse") {
          this._openArtistPage(id, title || id, thumb || "");
        } else if (action === "play-queue") {
          this._playAndSwitchToPlayer(id, type);
        } else {
          this._playItem(id, type);
          const card = this.shadowRoot.querySelector(".card-root");
          if (card) this._setActiveTab("player", card);
        }
      });
    });
  }

  _openArtistPage(id, title, thumbnail) {
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
      ? `<img class="artist-hero-art" src="${thumbnail}" alt="" loading="lazy">`
      : `<div class="artist-hero-art-placeholder">${ICONS.artist}</div>`;

    artistPanel.innerHTML = `
      <div class="artist-page-header">
        <button class="back-btn" id="artist-back">${this._t("nav.back")}</button>
        ${heroArt}
        <div class="artist-page-name">${this._esc(title)}</div>
      </div>
      <div class="artist-page-sections">
        <div class="loader"><div class="spinner"></div> ${this._t("lib.loading_short")}</div>
      </div>
    `;

    artistPanel.querySelector("#artist-back").addEventListener("click", () => {
      artistPanel.style.display = "none";
      searchMain.style.display = "";
    });

    this._hass.callApi("GET", `my_music_library/subitems?action=artist_albums&uri=${encodeURIComponent(id)}&limit=100`)
      .then(r => {
        const items = r?.items || [];
        const groups = {};
        for (const item of items) {
          const t = (item.album_type || "album").toLowerCase();
          (groups[t] = groups[t] || []).push(item);
        }
        const labelMap = {
          album: this._t("lib.album_types.album"),
          ep: this._t("lib.album_types.ep"),
          single: this._t("lib.album_types.single"),
          compilation: this._t("lib.album_types.compilation"),
        };
        const order = ["album", "ep", "single", "compilation"];
        let sectionsHtml = "";
        for (const t of order) {
          const group = groups[t];
          if (!group?.length) continue;
          sectionsHtml += `
            <div class="search-section">
              <div class="search-section-title">${labelMap[t] || t}</div>
              <div class="lib-scroll">
                ${group.map(i => this._renderSearchCard({ id: i.media_content_id, type: "album", title: i.title, subtitle: i.media_artist, thumbnail: i.thumbnail }, "album")).join("")}
              </div>
            </div>`;
        }
        if (!sectionsHtml) {
          sectionsHtml = `<div class="empty-state">${ICONS.library}<p>${this._t("lib.no_albums")}</p></div>`;
        }
        const sections = artistPanel.querySelector(".artist-page-sections");
        if (sections) {
          sections.innerHTML = sectionsHtml;
          this._attachItemActions(sections);
        }
      })
      .catch(err => {
        // Artist albums fetch failed
        const sections = artistPanel.querySelector(".artist-page-sections");
        if (sections) sections.innerHTML = `<div class="empty-state">${ICONS.library}<p>${this._t("lib.load_error")}</p></div>`;
      });
  }

  async _playAndSwitchToPlayer(id, type) {
    this._playItem(id, type);
    const card = this.shadowRoot.querySelector(".card-root");
    if (!card) return;
    this._setActiveTab("player", card);
    this._queue = [];
    // Mark as source immediately so _updatePlayerContent doesn't double-fetch
    this._lastQueueSource = id;
    this._updateQueueDisplay(card);

    const actionMap = { album: "album_tracks", playlist: "playlist_tracks" };
    const action = actionMap[type];
    if (!action) return;

    try {
      const data = await this._hass.callApi("GET", `my_music_library/subitems?action=${action}&uri=${encodeURIComponent(id)}&limit=100`);
      this._queue = data?.items || [];
      // Sort album tracks by track number to match real album order
      if (action === "album_tracks") {
        this._queue.sort((a, b) => (a.track_number || 0) - (b.track_number || 0));
      }
      this._saveQueueState();
      this._updateQueueDisplay(card);
    } catch (err) {
      // Queue fetch failed
    }
  }

  _updateQueueDisplay(card) {
    const section = card.querySelector("#queue-section");
    if (!section) return;
    if (!this._queue.length) {
      section.style.display = "none";
      return;
    }
    section.style.display = "";
    const list = section.querySelector("#queue-list");
    list.innerHTML = this._queue.map((t, i) => `
      <div class="queue-item" data-action="play" data-id="${this._esc(t.media_content_id)}" data-type="${this._esc(t.media_content_type)}">
        <div class="queue-num">${i + 1}</div>
        <div class="queue-info">
          <div class="queue-title">${this._esc(t.title)}</div>
          ${t.media_artist ? `<div class="queue-sub">${this._esc(t.media_artist)}</div>` : ""}
        </div>
        ${t.duration ? `<div class="queue-dur">${fmt(t.duration)}</div>` : ""}
      </div>
    `).join("");
    list.querySelectorAll("[data-action='play']").forEach(item => {
      item.addEventListener("click", () => this._playItem(item.dataset.id, item.dataset.type));
    });
  }

  _renderLibCard(item, iconName) {
    const thumb = item.thumbnail
      ? `<img class="lib-card-art" src="${item.thumbnail}" alt="" loading="lazy">`
      : `<div class="lib-card-art-placeholder">${ICONS[iconName] || ICONS.music}</div>`;
    const action = iconName === "artist" ? "browse" : (iconName === "music" ? "play" : "play-queue");
    const extra = iconName === "artist" ? `data-title="${this._esc(item.title)}" data-thumb="${this._esc(item.thumbnail || "")}"` : "";
    return `
      <div class="lib-card" data-action="${action}" data-id="${this._esc(item.media_content_id)}" data-type="${this._esc(iconName === 'artist' ? 'artist' : item.media_content_type)}" ${extra}>
        ${thumb}
        <div class="lib-card-name">${this._esc(item.title)}</div>
        ${item.media_artist ? `<div class="lib-card-sub">${this._esc(item.media_artist)}</div>` : ""}
      </div>`;
  }

  _renderLibListItem(item) {
    const thumb = item.thumbnail
      ? `<img class="lib-list-thumb" src="${item.thumbnail}" alt="" loading="lazy">`
      : "";
    return `
      <div class="lib-list-item" data-action="play" data-id="${this._esc(item.media_content_id)}" data-type="${this._esc(item.media_content_type)}">
        ${thumb}
        <div class="lib-list-info">
          <div class="lib-list-title">${this._esc(item.title)}</div>
          ${item.media_artist ? `<div class="lib-list-sub">${this._esc(item.media_artist)}</div>` : ""}
        </div>
        <button class="result-play" data-action="play" data-id="${this._esc(item.media_content_id)}" data-type="${this._esc(item.media_content_type)}" title="Play">${ICONS.play}</button>
      </div>`;
  }

  /* ── Play an item ── */
  _playItem(contentId, contentType) {
    if (!this._hass || !this._activePlayer) return;
    // Try music_assistant.play_media first, fallback to media_player.play_media
    this._hass.callService("media_player", "play_media", {
      entity_id: this._activePlayer,
      media_content_id: contentId,
      media_content_type: contentType || "music",
    });
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

customElements.define("my-music-library-card", MyMusicLibraryCard);

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
