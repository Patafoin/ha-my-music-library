/**
 * My Music Library Card
 * A responsive music player card for Home Assistant + Music Assistant.
 * No external dependencies — pure vanilla JS Custom Element.
 * @version 1.0.0
 */

const CARD_VERSION = "3.9.3";

/* ─── Icons (inline SVG strings) ─────────────────────────── */
const ICONS = {
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
};

/* ─── i18n ────────────────────────────────────────────────── */
const TRANSLATIONS = {
  en: {
    tabs: { player: "Player", search: "Search", library: "Library", settings: "Settings" },
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
      filter_favorites: "Favorites",
      empty: "Library is empty or Music Assistant is not connected.",
      empty_hint: "Make sure Music Assistant integration is installed and running.",
      no_albums: "No albums found",
      load_error: "Could not load albums",
      album_types: { album: "Albums", ep: "EPs", single: "Singles", compilation: "Compilations" },
      mode_catalogue: "Catalogue",
      mode_browse: "Browse",
      browse_root: "Root",
      browse_play: "Play",
      browse_error: "Could not load folder contents",
      browse_empty: "Empty folder",
    },
    queue: { up_next: "Up Next", empty: "Queue is empty", play_next: "Play next", add_to_end: "Add to end", added_next: "Added after current track", added_end: "Added to end of queue", remove: "Remove", toggle: "Toggle queue", start_mix: "Start a mix", mix_started: "Mix started" },
    errors: { media_not_found: "Media not found on source" },
    nav: { back: "← Back" },
    group: {
      section_master: "Active",
      section_members: "Group members",
      section_available: "Available",
      attach: "Add to group",
      detach: "Remove from group",
      no_players: "No Music Assistant players found.",
      volume: "Volume",
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
      type_settings: "Settings",
      type_button: "Button",
      confirm_delete: "Remove this tab?",
      search_layout: "Layout",
      search_layout_rows: "Rows",
      search_layout_columns: "Columns",
    },
  },
  fr: {
    tabs: { player: "Lecteur", search: "Recherche", library: "Bibliothèque", settings: "Paramètres" },
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
      filter_favorites: "Favoris",
      empty: "La bibliothèque est vide ou Music Assistant n'est pas connecté.",
      empty_hint: "Assurez-vous que l'intégration Music Assistant est installée et en cours d'exécution.",
      no_albums: "Aucun album trouvé",
      load_error: "Impossible de charger les albums",
      album_types: { album: "Albums", ep: "EPs", single: "Singles", compilation: "Compilations" },
      mode_catalogue: "Catalogue",
      mode_browse: "Parcourir",
      browse_root: "Racine",
      browse_play: "Lire",
      browse_error: "Impossible de charger le contenu du dossier",
      browse_empty: "Dossier vide",
    },
    queue: { up_next: "À suivre", empty: "File d'attente vide", play_next: "Lire après le titre en cours", add_to_end: "Ajouter à la fin", added_next: "Ajouté après le titre en cours", added_end: "Ajouté à la fin de la file d'attente", remove: "Supprimer", toggle: "Afficher/masquer la file", start_mix: "Lancer un mix", mix_started: "Mix lancé" },
    errors: { media_not_found: "Média introuvable sur la source" },
    nav: { back: "← Retour" },
    group: {
      section_master: "Actif",
      section_members: "Membres du groupe",
      section_available: "Disponible",
      attach: "Ajouter au groupe",
      detach: "Retirer du groupe",
      no_players: "Aucun lecteur Music Assistant trouvé.",
      volume: "Volume",
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
      type_settings: "Paramètres",
      type_button: "Bouton",
      confirm_delete: "Supprimer cet onglet ?",
      search_layout: "Disposition",
      search_layout_rows: "Lignes",
      search_layout_columns: "Colonnes",
    },
  },
  de: {
    tabs: { player: "Wiedergabe", search: "Suche", library: "Bibliothek", settings: "Einstellungen" },
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
      filter_favorites: "Favoriten",
      empty: "Bibliothek ist leer oder Music Assistant ist nicht verbunden.",
      empty_hint: "Stellen Sie sicher, dass die Music Assistant Integration installiert und aktiv ist.",
      no_albums: "Keine Alben gefunden",
      load_error: "Alben konnten nicht geladen werden",
      album_types: { album: "Alben", ep: "EPs", single: "Singles", compilation: "Kompilationen" },
      mode_catalogue: "Katalog",
      mode_browse: "Durchsuchen",
      browse_root: "Wurzel",
      browse_play: "Abspielen",
      browse_error: "Ordnerinhalt konnte nicht geladen werden",
      browse_empty: "Leerer Ordner",
    },
    queue: { up_next: "Als Nächstes", empty: "Warteschlange ist leer", play_next: "Als Nächstes abspielen", add_to_end: "Am Ende hinzufügen", added_next: "Nach dem aktuellen Titel hinzugefügt", added_end: "Am Ende der Warteschlange hinzugefügt", remove: "Entfernen", toggle: "Warteschlange ein-/ausblenden", start_mix: "Mix starten", mix_started: "Mix gestartet" },
    errors: { media_not_found: "Medium auf der Quelle nicht gefunden" },
    nav: { back: "← Zurück" },
    group: {
      section_master: "Aktiv",
      section_members: "Gruppenmitglieder",
      section_available: "Verfügbar",
      attach: "Zur Gruppe hinzufügen",
      detach: "Aus der Gruppe entfernen",
      no_players: "Keine Music Assistant Player gefunden.",
      volume: "Lautstärke",
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
      type_settings: "Einstellungen",
      type_button: "Schaltfläche",
      confirm_delete: "Diesen Tab entfernen?",
      search_layout: "Layout",
      search_layout_rows: "Zeilen",
      search_layout_columns: "Spalten",
    },
  },
};

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

  /* Device volume slider (inside group modal) */
  .device-item-volume {
    display: flex; align-items: center; gap: 6px;
    padding: 2px 12px 8px 42px;
    margin-top: -6px;
  }
  .device-item-volume svg { width: 14px; height: 14px; fill: var(--text2); flex-shrink: 0; }
  .device-item-volume input[type=range] {
    flex: 1; -webkit-appearance: none; height: 4px; border-radius: 2px;
    background: color-mix(in srgb, var(--text) 25%, transparent);
    outline: none; cursor: pointer; touch-action: none;
  }
  .device-item-volume input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%;
    background: var(--accent); cursor: pointer;
  }
  .device-item-volume input[type=range]::-moz-range-thumb {
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--accent); border: none; cursor: pointer;
  }
  .device-item-volume .device-vol-pct {
    font-size: 11px; color: var(--text2); min-width: 28px; text-align: right;
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

  /* ── Lanes layout (horizontal scroll) ── */
  .lib-scroll {
    display: flex;
    gap: 12px;
    padding: 0 16px 4px;
    overflow-x: auto;
    scrollbar-width: none;
    position: relative;
  }
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
    this._libSections = {}; // type → { offset, loading, exhausted, favorite, iconName }
    this._libSourceFilter = this._loadPref("mml_lib_source") || "all";
    this._libFavFilter = this._loadPref("mml_lib_fav") === "true";
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
    this._deviceModalOpen = false;
    this._searching = false;
    this._searchTimeout = null;
    this._searchId = 0;
    this._players = [];
    this._activePlayer = null;
    this._progressInterval = null;
    this._localPosition = null;
    this._localPositionTime = null;
    this._maQueueItems = [];
    this._lastKnownUri = null;
    this._queueVisible = this._loadPref("mml_queue_visible") !== "false";
    this._groupMembers = [];       // entity_ids attached to _activePlayer as group
    this._deviceVolDragging = new Set();
    this._excludedPlayers = [];    // entity_ids hidden from the device picker (HA options)
    this._libBrowseMode = false;   // true = browse filesystem mode
    this._browseStack = [];        // [{uri, label}] — navigation stack for browse mode
    this._rendered = false;
    this._isMobile = this._detectMobile();
    // MA config fetched from backend via WebSocket
    this._maUrl = null;       // stored but only used as a last-resort hint
    this._maEntryId = null;   // MA config entry ID — used for music_assistant/search WS calls
    this._maConfigLoaded = false;
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
    if (!this._activePlayer || !this._hass) { this._maQueueItems = []; this._updateQueueUI(); return; }
    try {
      const data = await this._callIntegration("GET", `ma_queue?player=${encodeURIComponent(this._activePlayer)}&limit=100`);
      this._maQueueItems = data?.items || [];
      this._debugLog("MA queue loaded →", this._maQueueItems.length, "items");
    } catch (_) {
      this._maQueueItems = [];
    }
    this._updateQueueUI();
  }

  _refreshQueueSoon(delay = 1200) {
    clearTimeout(this._queueRefreshTimer);
    this._queueRefreshTimer = setTimeout(() => this._loadMAQueue(), delay);
  }

  _updateQueueUI() {
    const card = this.shadowRoot?.querySelector(".card-root");
    if (card) this._updateQueueDisplay(card);
  }

  /* ── Group persistence (server-side, per player) ── */

  /** Load group members for a given player from the HA backend. */
  async _loadGroupFromServer(player) {
    if (!player || !this._hass) { this._groupMembers = []; return; }
    try {
      const data = await this._callIntegration("GET", `groups?player=${encodeURIComponent(player)}`);
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
    this._callIntegration("POST", "groups", {
      player: this._activePlayer,
      members: this._groupMembers,
    }).catch(() => {});
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
    this._resolvedTabs = this._buildResolvedTabs(config);
    const firstPanel = this._resolvedTabs.find(t => t.type !== "button");
    const defaultTab = this._config.default_tab || (firstPanel ? firstPanel.id : "player");
    this._tab = defaultTab;
    if (config.height != null && config.height !== "") {
      const h = typeof config.height === "number" ? `${config.height}px` : String(config.height);
      this.style.setProperty("--mml-height", h);
    }
  }

  _buildResolvedTabs(config) {
    const DEFAULT_SECTIONS = ["artists", "albums", "playlists", "tracks"];
    const VALID_SECTIONS = ["artists", "albums", "playlists", "tracks", "radios", "recently_played", "recently_added", "recommended", "flows"];
    const TAB_ICONS = { player: "player", search: "search", library: "library", settings: "settings" };

    if (config.tabs && Array.isArray(config.tabs)) {
      let idx = 0;
      const typeCounts = {};
      return config.tabs.map(t => {
        const type = t.type || "button";
        if (type === "button") {
          return { type: "button", id: `btn-${idx++}`, icon: t.icon, name: t.name || "", entity: t.entity,
            tap_action: t.tap_action, hold_action: t.hold_action, double_tap_action: t.double_tap_action,
            width: t.width, height: t.height };
        }
        typeCounts[type] = (typeCounts[type] || 0) + 1;
        const id = type === "settings" ? "settings" : (typeCounts[type] > 1 ? `${type}-${typeCounts[type] - 1}` : type);
        const tab = { type, id, label: t.label || null, iconOverride: t.icon || null,
          defaultIcon: TAB_ICONS[type] || null };
        if (type === "library") {
          const sections = Array.isArray(t.sections) ? t.sections.filter(s => VALID_SECTIONS.includes(s)) : null;
          tab.sections = sections && sections.length ? sections : DEFAULT_SECTIONS;
          const VALID_LAYOUTS = ["lanes", "grid", "columns", "auto"];
          tab.layout = VALID_LAYOUTS.includes(t.layout) ? t.layout : "lanes";
        }
        if (type === "search") {
          tab.search_layout = t.search_layout === "columns" ? "columns" : "rows";
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

    this._players = this._getMaPlayers();

    if (this._players.length === 0) {
      this._activePlayer = null;
    } else {
      if (!this._activePlayer || !this._players.find(p => p.entity_id === this._activePlayer)) {
        const saved = this._loadSavedPlayer();
        const prevActive = this._activePlayer;
        this._activePlayer = (saved && this._players.find(p => p.entity_id === saved) ? saved : null)
          || this._config.entity
          || (this._players.find(p => p.state === "playing") || this._players[0])?.entity_id;
        this._debugLog("Player selected:", this._activePlayer, "prev:", prevActive, "saved:", saved, "players:", this._players.map(p => p.entity_id));
        if (this._activePlayer && this._activePlayer !== prevActive) {
          this._loadMAQueue();
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
      this._debugMode = !!cfg?.debug_mode;
      this._debugLog("Config loaded:", JSON.stringify(cfg));
      if (cfg?.ma_entry_id) {
        this._maEntryId = cfg.ma_entry_id;
      }
      this._fetchProviders();
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
      // Validate stored filter: if none of the saved keys match current providers, reset
      if (this._enabledProviders !== null && this._maProviders.length > 0) {
        const validKeys = new Set(this._maProviders.map(p => p.instance_id || p.domain));
        const hasAnyValid = [...this._enabledProviders].some(k => validKeys.has(k));
        if (!hasAnyValid) {
          this._enabledProviders = null;
          this._savePref("mml_providers", "");
          const card = this.shadowRoot?.querySelector(".card-root");
        }
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

    this._isMobile = this._detectMobile();

    const card = document.createElement("div");
    card.className = `card-root${this._isMobile ? " mml-mobile" : ""}`;

    const panels = this._resolvedTabs.filter(t => t.type !== "button");
    const panelRenderers = {
      player: (t) => this._renderPlayerTab(),
      search: (t) => this._renderSearchTab(),
      library: (t) => this._renderLibraryTab(t),
    };

    card.innerHTML = `
      ${this._renderNav()}
      <div class="content">
        ${panels.map(t => panelRenderers[t.type] ? panelRenderers[t.type](t) : "").join("")}
      </div>
      ${this._renderDeviceModal()}
      ${this._renderSettingsModal()}
      <div class="mml-toast" id="mml-toast"></div>
    `;
    root.appendChild(card);

    this._attachListeners(card);
    this._setActiveTab(this._tab, card);
    this._updatePlayerContent(card);
  }

  _renderNav() {
    const items = this._resolvedTabs.map(t => {
      if (t.type === "button") {
        return this._renderNavButton(t);
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

    return `
      <div class="nav-wrapper">
        <div class="nav-fade-left"></div>
        <div class="nav-fade-right"></div>
        <nav class="nav">
          <div class="nav-tabs">${items}</div>
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
              <div class="device-row" id="device-row">
                <span id="device-icon-wrap">${ICONS.device}</span>
                <span class="device-name" id="device-name">${this._t("player.no_player")}</span>
                ${ICONS.chevronRight}
              </div>
            </div>
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
    const src = this._libSourceFilter;
    const fav = this._libFavFilter;
    const browse = this._libBrowseMode;
    return `
      <div class="tab-panel" data-panel="${panelId}">
        <div class="library-panel" id="library-content">
          <div class="lib-filters" id="lib-filters">
            <div class="lib-filter-group" id="lib-source-filter">
              <button class="lib-filter-btn ${src === "all" ? "active" : ""}" data-source="all">${this._t("lib.filter_all")}</button>
              <button class="lib-filter-btn ${src === "local" ? "active" : ""}" data-source="local">${this._t("lib.filter_local")}</button>
              <button class="lib-filter-btn ${src === "streaming" ? "active" : ""}" data-source="streaming">${this._t("lib.filter_streaming")}</button>
            </div>
            <div class="browse-mode-toggle" id="lib-browse-toggle" style="${src !== "local" ? "display:none" : ""}">
              <button class="browse-mode-btn ${!browse ? "active" : ""}" data-browse="false">${this._t("lib.mode_catalogue")}</button>
              <button class="browse-mode-btn ${browse ? "active" : ""}" data-browse="true">${this._t("lib.mode_browse")}</button>
            </div>
            <button class="lib-filter-fav ${fav ? "active" : ""}" id="lib-fav-filter" style="${browse ? "display:none" : ""}">
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

    // Library source filter (All / Local / Streaming)
    card.querySelector("#lib-source-filter")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".lib-filter-btn");
      if (!btn || btn.classList.contains("active")) return;
      const source = btn.dataset.source;
      this._libSourceFilter = source;
      this._savePref("mml_lib_source", source);
      // Reset browse mode when switching away from local
      if (source !== "local") this._libBrowseMode = false;
      card.querySelectorAll("#lib-source-filter .lib-filter-btn").forEach(b => b.classList.toggle("active", b.dataset.source === source));
      this._reloadLibrary();
    });

    // Browse mode toggle (Catalogue / Browse) — only visible in local mode
    card.querySelector("#lib-browse-toggle")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".browse-mode-btn");
      if (!btn || btn.classList.contains("active")) return;
      this._libBrowseMode = btn.dataset.browse === "true";
      this._browseStack = [];
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

    const hasPanel = (type) => this._resolvedTabs.some(t => t.type === type);

    // Player controls (only if player tab is present)
    if (hasPanel("player")) {
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

      // Device row
      card.querySelector("#device-row").addEventListener("click", () => this._openDeviceModal(card));
      card.querySelector("#modal-close").addEventListener("click", () => this._closeDeviceModal(card));
      card.querySelector("#device-modal").addEventListener("click", (e) => {
        if (e.target === card.querySelector("#device-modal")) this._closeDeviceModal(card);
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
    const activeTabDef = this._resolvedTabs.find(t => t.id === this._tab);
    if (activeTabDef?.type === "library" && !this._libLoadedTabs.has(this._tab)) this._loadLibrary();
  }

  _updateNavButtons(card) {
    for (const tab of this._resolvedTabs) {
      if (tab.type !== "button" || !tab.entity) continue;
      const st = this._hass?.states[tab.entity];
      const isActive = st ? ["on", "playing", "active", "home"].includes(st.state) : false;
      const el = card.querySelector(`[data-tab-btn="${tab.id}"]`);
      if (el) el.classList.toggle("active", isActive);
    }
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

    // Live-update volume sliders inside the device/group modal
    this._updateDeviceModalVolumes(card);

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
    const frag = document.createDocumentFragment();
    const item = document.createElement("div");
    item.className = `device-item${role === "master" ? " selected master" : role === "member" ? " member" : ""}`;

    const iconSvg = role === "member" ? ICONS.group : ICONS.device;
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
    frag.appendChild(item);

    if (role === "master" || role === "member") {
      const volState = this._hass?.states[player.entity_id];
      const volLevel = volState?.attributes?.volume_level;
      const volPct = volLevel !== undefined ? Math.round(volLevel * 100) : 0;
      const volRow = document.createElement("div");
      volRow.className = "device-item-volume";
      volRow.dataset.entity = player.entity_id;
      volRow.innerHTML = `
        ${ICONS.volumeHigh}
        <input type="range" min="0" max="100" value="${volPct}" title="${this._t("group.volume")}">
        <span class="device-vol-pct">${volPct}%</span>`;
      const slider = volRow.querySelector("input");
      const eid = player.entity_id;
      slider.addEventListener("pointerdown", () => { this._deviceVolDragging.add(eid); });
      slider.addEventListener("input", () => {
        volRow.querySelector(".device-vol-pct").textContent = `${slider.value}%`;
      });
      slider.addEventListener("pointerup", () => {
        if (!this._deviceVolDragging.has(eid)) return;
        this._deviceVolDragging.delete(eid);
        this._hass?.callService("media_player", "volume_set", {
          entity_id: eid,
          volume_level: parseInt(slider.value) / 100,
        });
      });
      slider.addEventListener("pointercancel", () => { this._deviceVolDragging.delete(eid); });
      frag.appendChild(volRow);
    }

    if (role === "available") {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".attach")) return;
        const prevActive = this._activePlayer;
        this._activePlayer = player.entity_id;
        this._savePlayer(player.entity_id);
        if (this._activePlayer !== prevActive) {
          this._groupMembers = [];
          this._loadMAQueue();
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
    return frag;
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
        this._reloadLibrary();
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

  _closeDeviceModal(card) {
    card.querySelector("#device-modal").classList.remove("open");
  }

  _updateDeviceModalVolumes(card) {
    const modal = card.querySelector("#device-modal");
    if (!modal?.classList.contains("open")) return;
    for (const volRow of modal.querySelectorAll(".device-item-volume")) {
      const eid = volRow.dataset.entity;
      const slider = volRow.querySelector("input");
      if (!eid || !slider || this._deviceVolDragging.has(eid)) continue;
      const st = this._hass?.states[eid];
      const vol = st?.attributes?.volume_level;
      if (vol === undefined) continue;
      const pct = Math.round(vol * 100);
      slider.value = pct;
      const label = volRow.querySelector(".device-vol-pct");
      if (label) label.textContent = `${pct}%`;
    }
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
      if (this._maEntryId) {
        candidates.push(this._searchViaMaWs(query));
        strategies.push("MA WS");
        candidates.push(this._searchViaMaWs(query, { libraryOnly: true }));
        strategies.push("MA WS (library)");
      }
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
      const browseEntity = this._getBrowseEntity();
      if (browseEntity) {
        this._debugLog("Search fallback: browse_media on", browseEntity);
        results = await this._searchViaBrowseMedia(browseEntity, query);
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
        `search?query=${encodedQuery}&limit=25${extra}`
      );
      if (!data) return null;
      const results = this._parseMaWsSearchResults(data);
      return results;
    } catch (e) {
      return null;
    }
  }

  /* Search via music_assistant/search WebSocket command (registered by MA integration).
     Passes through HA — no CORS, works from HTTPS. */
  async _searchViaMaWs(query, { libraryOnly = false } = {}) {
    const base = { entry_id: this._maEntryId, limit: 25 };
    if (libraryOnly) base.library_only = true;
    const attempts = [
      { type: "music_assistant/search", ...base, search_query: query },
      { type: "music_assistant/search", ...base, name: query },
      { type: "music_assistant/search_media_items", ...base, search_query: query },
    ];

    for (const msg of attempts) {
      try {
        const result = await this._hass.callWS(msg);
        if (result) {
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

    const searchTab = this._resolvedTabs.find(t => t.type === "search");
    const useColumns = searchTab?.search_layout === "columns";

    const sections = [
      { key: "artists",   label: this._t("search.artists"),   icon: "artist",   card: true,  limit: 15 },
      { key: "albums",    label: this._t("search.albums"),    icon: "album",    card: true,  limit: 15 },
      { key: "tracks",    label: this._t("search.tracks"),    icon: "music",    card: false, limit: 10 },
      { key: "playlists", label: this._t("search.playlists"), icon: "playlist", card: true,  limit: 15 },
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
      for (const { key, label, icon: iconName, limit } of populated) {
        const items = (results[key] || []).slice(0, limit);
        const col = document.createElement("div");
        col.className = "search-column";
        col.innerHTML = `<div class="search-section-title">${label}</div>`
          + items.map(i => this._renderResultItem(i, iconName)).join("");
        wrapper.appendChild(col);
      }
      el.appendChild(wrapper);
      this._attachItemActions(el);
    } else {
      for (const { key, label, icon: iconName, card: isCard, limit } of populated) {
        const items = (results[key] || []).slice(0, limit);
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
    }
  }

  _renderResultItem(item, iconName) {
    const thumb = item.thumbnail
      ? `<img class="result-thumb" src="${this._resolveImageUrl(item.thumbnail)}" alt="" loading="lazy">`
      : `<div class="result-thumb-placeholder">${ICONS[iconName] || ICONS.music}</div>`;
    const queueType = item.type === "track" || iconName === "music" ? "track" : item.type;
    const canQueue = ["track", "music", "album", "playlist"].includes(queueType);
    return `
      <div class="result-item">
        ${thumb}
        <div class="result-info">
          <div class="result-title">${this._esc(item.title)}</div>
          ${item.subtitle ? `<div class="result-sub">${this._esc(item.subtitle)}</div>` : ""}
        </div>
        ${canQueue ? `<button class="add-queue-btn" data-queue-id="${this._esc(item.id)}" data-queue-type="${this._esc(queueType)}" title="${this._t("queue.add_to_end")}">${ICONS.plus}</button>` : ""}
        ${item.can_play ? `<button class="result-play" data-action="play" data-id="${this._esc(item.id)}" data-type="${this._esc(item.type)}" title="Play">${ICONS.play}</button>` : ""}
      </div>`;
  }

  /* ── Library ── */

  static _LOCAL_PROVIDERS = ["filesystem_local", "filesystem_smb", "filesystem_nfs", "plex"];

  _isLocalProvider(domain) {
    return MyMusicLibraryCard._LOCAL_PROVIDERS.some(p => domain.startsWith(p));
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
    // Update filter bar in-place (no outerHTML replacement — preserves display state)
    const card = this.shadowRoot.querySelector(".card-root");
    if (card) {
      // Source filter active state
      card.querySelectorAll("#lib-source-filter .lib-filter-btn").forEach(b =>
        b.classList.toggle("active", b.dataset.source === this._libSourceFilter));
      // Browse toggle visibility
      const toggle = card.querySelector("#lib-browse-toggle");
      if (toggle) {
        toggle.style.display = this._libSourceFilter === "local" ? "" : "none";
        toggle.querySelectorAll(".browse-mode-btn").forEach(b =>
          b.classList.toggle("active", (b.dataset.browse === "true") === this._libBrowseMode));
      }
      // Fav button visibility
      const favBtn = card.querySelector("#lib-fav-filter");
      if (favBtn) favBtn.style.display = this._libBrowseMode ? "none" : "";
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
    this._debugLog("Library load start, browseMode:", this._libBrowseMode, "sourceFilter:", this._libSourceFilter, "favFilter:", this._libFavFilter);

    if (this._libBrowseMode) {
      const currentUri = this._browseStack.length ? this._browseStack[this._browseStack.length - 1].uri : null;
      return this._loadBrowse(currentUri, libEl);
    }
    this._libLoadId = (this._libLoadId || 0) + 1;
    const loadId = this._libLoadId;
    const favorite = this._libFavFilter;
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
    const filterBar = (activePanel || card)?.querySelector("#lib-filters");
    if (filterBar) {
      filterBar.style.display = "";
      const browseToggle = filterBar.querySelector("#lib-browse-toggle");
      if (browseToggle && allDiscover) browseToggle.style.display = "none";
    }

    // Helper: resolve per-item icon for mixed-type discover sections
    const _itemIcon = (item) => {
      const t = (item.media_content_type || "").toLowerCase();
      if (t.includes("artist")) return "artist";
      if (t.includes("album")) return "album";
      if (t.includes("playlist")) return "playlist";
      if (t.includes("radio")) return "radio";
      if (t === "track") return "music";
      return "music";
    };

    // Helper: build section HTML (layout-aware)
    const isDiscoverSection = (type) => DISCOVER_SECTIONS.includes(type);
    const sectionHtml = (type, label, iconName, items) => {
      const isTrackList = iconName === "music";
      const itemsHtml = isTrackList
        ? items.map(i => this._renderLibListItem(i)).join("")
        : isDiscoverSection(type)
          ? items.map(i => this._renderLibCard(i, _itemIcon(i))).join("")
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

    const _isProviderFolder = (f) => {
      const p = f.provider_instance || f.provider_domain || "";
      return p && p !== "library" && p !== "builtin";
    };
    const _matchFolderProvider = (key) => {
      if (!key || key === "library" || key === "builtin") return true;
      if (this._enabledProviders.has(key)) return true;
      return [...this._enabledProviders].some(ep => ep.startsWith(key + "_") || key.startsWith(ep.split("--")[0] + "--") || ep === key);
    };
    const _isFolderEnabled = (f) => {
      if (!_isProviderFolder(f)) return true;
      if (this._enabledProviders === null) return true;
      const inst = f.provider_instance || f.provider_domain || "";
      return _matchFolderProvider(inst);
    };

    const _extractDiscoverItems = async (sectionType) => {
      const recFolders = await _getRecommendations();
      if (!recFolders || recFolders.length === 0) return [];
      const folders = recFolders.filter(_isFolderEnabled);
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
    const canQueue = ["album", "playlist", "track"].includes(type);
    return `
      <div class="search-card" data-action="${action}" data-id="${this._esc(item.id)}" data-type="${type}" ${extra}>
        ${art}
        <div class="search-card-name">${this._esc(item.title)}</div>
        ${item.subtitle ? `<div class="search-card-sub">${this._esc(item.subtitle)}</div>` : ""}
        ${canQueue ? `<button class="add-queue-btn" data-queue-id="${this._esc(item.id)}" data-queue-type="${this._esc(type)}" title="${this._t("queue.add_to_end")}">${ICONS.plus}</button>` : ""}
      </div>`;
  }

  _attachItemActions(container) {
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
          const card = this.shadowRoot.querySelector(".card-root");
          if (card) this._setActiveTab("player", card);
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
      ? `<img class="artist-hero-art" src="${this._resolveImageUrl(thumbnail)}" alt="" loading="lazy">`
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

    this._callIntegration("GET", `subitems?action=artist_albums&uri=${encodeURIComponent(id)}&limit=100`)
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
    if (!this._hass || !this._activePlayer) return;
    const card = this.shadowRoot.querySelector(".card-root");
    if (!card) return;
    this._setActiveTab("player", card);

    this._debugLog("PlayQueue:", id, "type:", type, "on:", this._activePlayer);
    try {
      await this._callServiceSilent("music_assistant", "play_media", {
        entity_id: this._activePlayer,
        media_id: id,
        enqueue: "replace",
      });
    } catch (_) {
      try {
        await this._callServiceSilent("media_player", "play_media", {
          entity_id: this._activePlayer,
          media_content_id: id,
          media_content_type: type || "music",
        });
      } catch (err) {
        this._debugLog("play_media error:", err);
        if (this._isMediaNotFoundError(err)) {
          this._showToast(this._t("errors.media_not_found"));
        }
      }
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
      await this._callServiceSilent("music_assistant", "play_media", {
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

  async _startRadioMode(id, type) {
    if (!this._hass || !this._activePlayer) return;
    try {
      await this._callServiceSilent("music_assistant", "play_media", {
        entity_id: this._activePlayer,
        media_id: id,
        enqueue: "replace",
        radio_mode: true,
      });
      this._showToast(this._t("queue.mix_started"));
      const card = this.shadowRoot.querySelector(".card-root");
      if (card) this._setActiveTab("player", card);
      this._refreshQueueSoon(1500);
    } catch (err) {
      this._debugLog("startRadioMode failed:", err);
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
    const canQueue = ["album", "playlist", "track"].includes(type);
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
        <button class="result-play" data-action="play" data-id="${this._esc(item.media_content_id)}" data-type="${this._esc(item.media_content_type)}" title="Play">${ICONS.play}</button>
      </div>`;
  }

  /* ── Play an item ── */
  async _playItem(contentId, contentType) {
    if (!this._hass || !this._activePlayer) return;
    this._debugLog("Play:", contentId, "type:", contentType, "on:", this._activePlayer);
    try {
      await this._callServiceSilent("music_assistant", "play_media", {
        entity_id: this._activePlayer,
        media_id: contentId,
        enqueue: "replace",
      });
    } catch (_) {
      try {
        await this._callServiceSilent("media_player", "play_media", {
          entity_id: this._activePlayer,
          media_content_id: contentId,
          media_content_type: contentType || "music",
        });
      } catch (err) {
        this._debugLog("play_media error:", err);
        if (this._isMediaNotFoundError(err)) {
          this._showToast(this._t("errors.media_not_found"));
        }
      }
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
  .editor-row label { min-width: 120px; font-size: 14px; color: var(--primary-text-color, #212121); flex-shrink: 0; }
  .editor-row input, .editor-row select {
    flex: 1; padding: 8px; border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 4px; font-size: 14px; background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121); min-width: 0;
  }
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
`;

class MyMusicLibraryCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._expandedTab = -1;
    this._showAddMenu = false;
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
    if (this.shadowRoot && !this.shadowRoot.querySelector(".editor")) this._render();
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
    if (tab.type === "button") return tab.icon || "Button";
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
            ${["player","search","library","settings","button"].map(type => `
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

  _renderBasicFields(defaultTabOptions) {
    const cfg = this._config;
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
      </div>`;
  }

  _renderTabItem(tab, index, total) {
    const isExpanded = this._expandedTab === index;
    const typeClass = tab.type === "button" ? " button" : "";
    return `
      <div class="tab-item" data-tab-idx="${index}">
        <div class="tab-item-header" data-toggle-idx="${index}">
          <span class="expand-chevron ${isExpanded ? "open" : ""}">▶</span>
          <span class="tab-item-type${typeClass}">${this._tabTypeLabel(tab.type)}</span>
          <span class="tab-item-label">${this._esc(this._tabDisplayLabel(tab))}</span>
          <div class="tab-item-actions">
            <button data-move="up" data-idx="${index}" ${index === 0 ? "disabled" : ""} title="Move up">▲</button>
            <button data-move="down" data-idx="${index}" ${index === total - 1 ? "disabled" : ""} title="Move down">▼</button>
            <button class="delete" data-delete="${index}" title="Delete">✕</button>
          </div>
        </div>
        ${isExpanded ? this._renderTabBody(tab, index) : ""}
      </div>`;
  }

  _renderTabBody(tab, index) {
    if (tab.type === "button") return this._renderButtonBody(tab, index);
    let body = `
      <div class="tab-item-body">
        <div class="editor-row">
          <label>${this._t("editor.tab_label")}</label>
          <input data-field="label" data-idx="${index}" type="text" value="${this._esc(tab.label || "")}" placeholder="${this._t("editor.tab_label_hint")}">
        </div>
        <div class="editor-row">
          <label>${this._t("editor.tab_icon")}</label>
          <input data-field="icon" data-idx="${index}" type="text" value="${this._esc(tab.icon || "")}" placeholder="${this._t("editor.tab_icon_hint")}">
        </div>`;
    if (tab.type === "library") body += this._renderSectionsEditor(tab, index);
    if (tab.type === "search") body += this._renderSearchLayoutEditor(tab, index);
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

  _renderButtonBody(tab, index) {
    const actionType = tab.tap_action?.action || "none";
    let actionFields = "";
    if (actionType === "navigate") {
      actionFields = `
        <div class="editor-row">
          <label>${this._t("editor.btn_nav_path")}</label>
          <input data-btn-field="navigation_path" data-idx="${index}" type="text" value="${this._esc(tab.tap_action?.navigation_path || "")}">
        </div>`;
    } else if (actionType === "url") {
      actionFields = `
        <div class="editor-row">
          <label>${this._t("editor.btn_url")}</label>
          <input data-btn-field="url_path" data-idx="${index}" type="text" value="${this._esc(tab.tap_action?.url_path || "")}">
        </div>`;
    } else if (actionType === "call-service" || actionType === "perform-action") {
      actionFields = `
        <div class="editor-row">
          <label>${this._t("editor.btn_service")}</label>
          <input data-btn-field="perform_action" data-idx="${index}" type="text" value="${this._esc(tab.tap_action?.perform_action || tab.tap_action?.service || "")}">
        </div>`;
    }
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
        <div class="editor-row">
          <label>${this._t("editor.btn_action_type")}</label>
          <select data-btn-action-type data-idx="${index}">
            ${["none","toggle","more-info","navigate","url","call-service","assist"].map(a =>
              `<option value="${a}" ${actionType === a ? "selected" : ""}>${this._t(`editor.action_${a.replace("-","_").replace("-","_")}`) || a}</option>`
            ).join("")}
          </select>
        </div>
        ${actionFields}
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
