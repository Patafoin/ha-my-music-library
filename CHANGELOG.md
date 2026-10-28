# Changelog

> **4.8.2 is the first public release of the 4.x line.** Versions 4.0.0 to 4.8.1 were never published: together, the entries from 4.5.0 to 4.8.2 below describe everything 4.8.2 brings since 3.14.0.

## 4.9.0 — Profiles: everyone their own music 🎉

**One Music Assistant account per Home Assistant user.** Until now, everyone in the house saw the same library in the card — the one of the account entered at setup. With **profiles**, each Home Assistant user can browse and play with **their own Music Assistant account**:

- **their own library, search, browsing and discovery** — a child sees their Deezer library and their bedtime stories, the parents keep theirs, untouched;
- **their own music sources and speakers** — the card only offers what their Music Assistant account may use (the filters set in Music Assistant > Settings > Users);
- **their own streaming account** — music started from the card plays from their account, so their listening history and recommendations stay theirs;
- **no surprises** — a user with a profile never falls back to someone else's account: if their token is revoked, they get the "not connected" banner.

Add one from the integration page (**Settings > Devices & Services > My Music Library > Add profile**): a Home Assistant user, a Music Assistant token created for that user, and an optional default player. No restart needed. Users without a profile keep the setup account, exactly as before. Step-by-step guide: [Profiles](README.md#profiles--one-music-assistant-account-per-user).

Also in 4.9.0:

- **Change** — the card's music sources and speakers now follow the Music Assistant filters of the setup account too, even for a Music Assistant admin (Music Assistant itself lists them all for an admin).
- **Fix** — with several Music Assistant users, the search could show **another user's library**: Music Assistant 2.10 caches library search results without telling users apart, so whoever searched first set the results for everyone. The card's library search now uses Music Assistant's library listings, which keep to each user's own library. Library items of another account no longer show as favorites either.
- **Fix** — the card's queue was never saved on the Home Assistant side (the request failed with an error in the logs), so it was not shared between devices nor kept across restarts.
- **Fix** — the **Default player** option was not used by the card; it now selects that player when the card opens on a device where no player was chosen yet.

## 4.8.6
- **Fix** — after re-entering the Music Assistant URL and token (**Reconfiguration needed** / reauthentication), the integration now reconnects by itself. From Home Assistant 2026.12 it would otherwise have kept the old connection until the next restart. Typing the same token again also reconnects.
- **Maintenance** — the integration declares that it is set up from the UI only (`CONFIG_SCHEMA`), which removes a hassfest warning. No change for users; still compatible with Home Assistant 2026.2 and later.

## 4.8.5
- **Fix** — media players of Music Assistant players that no longer exist **stayed in Home Assistant forever** (unavailable, often with the same name as the real one). This happens when a device comes back under another identifier: Music Assistant then sees a new player — for instance a Squeezelite player that started before the network was up (`00:00:00:00:00:00`) or on another network interface, or a browser's web player. Now:
  - a player removed in Music Assistant has its media player and device removed at once;
  - players Music Assistant no longer knows at all are listed in **Settings > Repairs** (10 minutes after start-up, so that players have time to reconnect); the fix lets you tick the ones to delete. Never automatic: a speaker that is only switched off is missing from Music Assistant's list too;
  - such a device can also be deleted from its device page.
- **Fix** — compatibility with Home Assistant 2026.10 (new device registry API).

## 4.8.4
- **Fix** — on next/previous track, the player showed the new track, **went back to the previous one** for a second or two, then showed the new one again (title and artwork). Music Assistant briefly points back to the track it left while the speaker still plays the old stream; the integration now holds such a return for up to 3 seconds and only shows it if it lasts (a real "previous" right after "next" is shown at most 3 seconds late).
- **Fix** — the elapsed time could show **negative values** for a moment when a track started (on a device whose clock is a bit behind Home Assistant's); it now never goes below 0:00.

## 4.8.3
- **Fix** — after moving forward in a track with the progress bar, the bar **stayed at that position on the next track** (or on another player) instead of starting over: the position chosen by the seek kept priority over the one reported by Home Assistant as long as music was playing. It now only bridges the gap until Home Assistant reports the new position, and is dropped on a track or player change.

## 4.8.2 — first public 4.x release
- **Fix** — the output panel showed **no output at all** with the oldest supported Music Assistant client (1.3.3, shipped with Home Assistant 2026.2): its "hide player" setting is a set of conditions (when off, when synced…), never empty, which was read as "hidden". Only "always" hides a player now.
- **Fix** — the duplicate-players Repairs issue had a description both on the issue and on its fix flow, which Home Assistant's validation (hassfest) rejects; the issue keeps its title, the details stay in the fix flow.

## 4.8.1
- **Fix** — **Switch restarted the queue from its first track** when moving a group to one of its own members (e.g. "Bathroom + Living room" → "Living room"). The integration ungrouped the target itself before asking Music Assistant to transfer the queue, which made the source re-set its stream right when Music Assistant reads the current track and position. Music Assistant frees such a target itself (and waits for it): the integration no longer touches the source's group before the transfer, other targets are ungrouped afterwards. The current track and position are kept.
- **Fix** — Switch with the source kept in the selection now gives exactly the selected outputs (outputs left out leave the group), and switching while the card controls a group member moves the whole group's music.

## 4.8.0
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

## 4.7.1
- **Fix (workaround for a Music Assistant bug)** — **playback stopped after the first track** of an album or playlist, with the rest still in the queue ("next" worked). Music Assistant (seen on 2.10.4) hands the next track to the player while the current one starts, and skips that step when the queue was empty just before — typically right after a launch that failed and emptied the queue (e.g. a Deezer "Flow" with nothing to play). Nothing retries it, so the player stops at the end of the first track. The integration now watches the queues: when one stops on a track played to its end while a next track is waiting (not at the end of the queue, not in "repeat one", not stopped by you mid-track), it waits 6 seconds, then skips to the next track — what you would do by pressing "next". Logged as a warning.

## 4.7.0
- **New** — **"Artist" button on the player tab**: opens the page of the artist of the track being played (favorite albums and full catalog). The back button returns to the player. New `track_artist` action on the `/my_music_library/subitems` view (main artist of a track, library version when the artist is in the library).
- **Improvement** — **artist page: albums, EPs, singles and live albums in separate sections**, in both "Favorites" and "All albums" (sorting by name or date applies inside each section). Live albums (`live` type) used to be missing from the "Favorites" section.
- **Fix** — **artist page "Favorites" showed the artist's whole streaming catalog** when the page was opened with a streaming provider's artist (a search result, or the track playing): e.g. 47 Deezer albums instead of the 4 albums in your library. "Favorites" now only lists your library's albums of that artist (none if the artist isn't in your library).
- **Improvement** — **"Start a mix" gives immediate feedback**: Music Assistant builds the whole mix (similar-track lookups at the streaming providers) before answering, which takes several seconds. The card now switches to the player and shows "Preparing the mix…" right away, and shows an error message if the mix fails (it used to fail silently).

## 4.6.2
- **Fix** — **browsing Deezer's "Made For You" (and any folder with an explicit navigation path)** failed with a 502: the URI was rebuilt from the item ID (`…://made_for_me`) instead of Music Assistant's navigation path (`…://Made For You`). Root cause: the Music Assistant client converts browse folders into a type that has no `path` field, so the path was lost before reaching the integration. Browsing now requests the raw data from the server, and the navigation path is used whenever the provider sets one.

## 4.6.1
- **Fix** — **browsing sub-folders of the filesystem provider** ([#17](https://github.com/Patafoin/ha-my-music-library/issues/17)): opening a sub-folder repeated its parent in the path (`Disco/Disco/ABBA Gold…`), so every sub-folder failed with a 502 error. Since 3.10.0, folder URIs were rebuilt as *parent + item ID*, but the filesystem provider's item ID already contains the full path from its root. The parent is no longer repeated.

## 4.6.0
- **Improvement** — **the queue updates as soon as Music Assistant changes it**. The card used to reload the queue after fixed delays (500 ms to 1.5 s after an action, plus waiting for the action itself to finish): after starting an album or playlist, the queue showed up about 2.3 s after the click although Music Assistant had it ready after about 0.75 s. Music Assistant's queue events are now relayed to the card through a WebSocket subscription (`my_music_library/subscribe_queue`), so the queue is reloaded right when it changes — when starting media, skipping tracks, enqueuing, moving or removing items. A reload every 4 s after an action remains as a safety net; if the subscription is unavailable, the previous delays apply.

## 4.5.0
First 4.x version (never published on its own) — everything below is new since 3.14.0 (versions 4.0.0 to 4.4.4 were never published either). **Breaking change**: read [Upgrading from 3.x](https://github.com/Patafoin/ha-my-music-library#upgrading-from-3x) first.

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

## 3.14.0
- **Feature** — **`playlist` tab type**: a new tab locked to one playlist, picked from a dropdown in the visual editor (populated from your Music Assistant library — queries both favorited and non-favorited playlists, since some providers such as Deezer only sync their playlists as favorites). Every track is listed and tapping one plays it instantly without leaving the tab. A compact player bar (previous / play-pause / next, progress bar, volume slider, device picker — no album art) stays pinned at the bottom, reusing the exact same components and callbacks as the main Player tab. Tracks can be toggled between list and grid view via a header button, remembered per tab.

## 3.12.5
- **Fix** — **Suggestions tab always empty**: Music Assistant's `music/recommendations` call only returns the recommendation folders' metadata (name, provider, item_id), not their content — a second call per folder (`music/recommendations/items`) is required to fetch the actual items. The integration now issues that second call in parallel for every folder, so Deezer/TuneIn/library suggestions display correctly. A folder that fails or times out is now skipped individually instead of blanking the whole tab.

## 3.12.4
- **Feature** — **nav bar position and alignment**: new `nav_bar` configuration block with `position` (`top` / `bottom` / `left` / `right`, default `top`) and `align` (`start` / `center` / `end` / `space-between`, default `start`). Configurable in the visual editor under the new "Nav bar" section.
- **Feature** — **`custom_element` tab type**: embed any HA custom element (e.g. `button-card`, `mini-graph-card`) directly in the nav bar. Configure `element` (custom element tag name) and `element_config` (YAML/JSON). Supports `tap_action`. Editable in the visual editor.
- **Feature** — **`show_in_nav` property**: set `show_in_nav: false` on any tab to hide it from the nav bar while keeping it navigable via `mml_navigate_tab` actions.
- **Feature** — **MML internal actions**: three new action types for `button` and `custom_element` tabs:
  - `mml_navigate_tab` — navigate to a named card tab (`player`, `search`, `library`, `settings`)
  - `mml_navigate_section` — scroll the library tab to a specific section (`artists`, `albums`, `playlists`, `tracks`, `radios`, `recently_played`, `recently_added`, `recommended`, `flows`)
  - `mml_control` — trigger a player control without leaving the card (`play_pause`, `next`, `prev`, `shuffle`, `repeat`, `mute`)
- **Improvement** — **visual editor**: nav bar section with position/alignment selects; `custom_element` in the add-tab menu; action selector shared between `button` and `custom_element` tabs and includes all MML actions.

## 3.11.2
- **Fix** — **library scroll conflict on mobile (iPhone)** ([#13](https://github.com/Patafoin/ha-my-music-library/issues/13)): scrolling vertically through library sections was blocked when the touch gesture started on a horizontal lane (albums, artists). A direction-lock mechanism now detects the dominant gesture direction on the first touch move — if vertical, horizontal scroll on all lanes is temporarily disabled so the page scrolls smoothly. Horizontal lane scrolling remains fully functional when the gesture is clearly horizontal.

## 3.11.1
- **Fix** — **library tab not scrollable on iOS Safari** ([#13](https://github.com/Patafoin/ha-my-music-library/issues/13)): both `.library-panel` and `.lib-content` had `overflow-y: auto`, creating nested scroll containers that iOS Safari cannot handle. Changed `.library-panel` to `overflow: hidden` (matching the search panel pattern) so only `.lib-content` scrolls. Added `min-height: 0` and `-webkit-overflow-scrolling: touch` for proper flex shrinking and older iOS compatibility.

## 3.11.0
- **Fix** — **cover images missing in library, search, browse & queue** ([#12](https://github.com/Patafoin/ha-my-music-library/issues/12)): raw image paths from Music Assistant (Plex URLs requiring auth, internal MA references) were exposed directly to the browser, which couldn't load them. All thumbnails are now routed through a new server-side proxy endpoint (`/my_music_library/thumb`) that resolves images via the MA server — handling provider authentication (Plex tokens), internal paths, and mixed-content issues transparently. Both backend normalization and frontend WebSocket search results wrap thumbnails in this proxy.
- **Fix** — **clicking artist in library shows empty results** ([#12](https://github.com/Patafoin/ha-my-music-library/issues/12)): `get_artist_albums` calls via the MA Python client could fail silently (logged at DEBUG). Added a REST API fallback (`/api/music/artists/{id}/albums`) that kicks in when all client attempts fail. Upgraded failure logging from DEBUG to WARNING for diagnosability.

## 3.10.4
- **Fix** — **cover images missing in Library, Search and Browse tabs** ([#12](https://github.com/Patafoin/ha-my-music-library/issues/12)): thumbnails were not displayed because the backend only accepted image paths starting with `http://`, rejecting relative or proxy paths from Music Assistant. A new centralized `_extract_thumbnail()` helper now searches all known MA image locations (`thumbnail`, `image.path`, `metadata.images[].path`) without protocol restriction. Also fixes thumbnails in search results and MA queue items.
- **Fix** — **`image` property lost during serialization**: Music Assistant exposes `image` as a `@property` on media items, which `dataclasses.fields()` does not include. The serializer now explicitly captures this property so cover art is preserved even when it's the only image source.
- **Fix** — **search results missing thumbnails server-side**: `_serialize_search_results()` now injects a `thumbnail` field into each search result item, so the frontend no longer has to guess where MA stores image paths.
- **Improvement** — **image error fallback on all tabs**: a delegated error handler on the shadow root automatically replaces broken `<img>` elements with SVG placeholder icons, matching the player tab's existing fallback behavior.

## 3.10.3
- **Feature** — **hide device picker**: new `show_device_select` option (default: `true`) and matching checkbox in the visual card editor. When unchecked, the device selection row at the bottom of the player tab is hidden.
- **Fix** — **i18n: hardcoded strings**: the device modal title ("Choose a device"), play button tooltips, and editor move/delete tooltips were hardcoded in English. All are now translated (EN / FR / DE).
- **Fix** — **FR translation**: corrected anglicism "sélection du device" → "sélection de l'appareil".

## 3.10.2
- **Fix** — **provider filter server-side post-filter**: MA's library API silently ignores the `provider` parameter (absorbed by `**kwargs`), returning all items instead of filtering by provider instance. Added a server-side post-filter that verifies each returned item's `provider_instances` contains the requested provider, ensuring items from disabled providers (e.g., a second Deezer account) are excluded.

## 3.10.1
- **Fix** — **provider filter race condition**: library could load before providers were fetched, causing `_activeProviderFilter()` to always return `null` and bypassing server-side per-provider queries. Provider fetch is now awaited before proceeding, and library tabs are invalidated when providers arrive late.
- **Fix** — **provider validation by domain**: stored provider filter keys are now validated against both `instance_id` and `domain`, preventing a full filter reset when MA provider instance IDs change across restarts.
- **Improvement** — **alphabetical sort in library lanes**: artists sorted by name, albums by album name, tracks by title, etc. Uses locale-aware case-insensitive comparison.

## 3.10.0
- **Feature** — **per-tab library filter state**: when using multiple library tabs (e.g., one for catalogue, one for discover/recommendations), each tab now has its own independent source filter (All / Local / Streaming), favorites toggle, and browse mode state. Switching filters in one tab no longer affects the other. Preferences are saved per tab in localStorage.
- **Feature** — **search lazy loading**: search results now fetch up to 100 items (was 25) and render progressively — initial batch on screen, then more items load on scroll (15 cards / 20 list items initially, 30 per scroll batch).
- **Fix** — **browse back navigation**: clicking ".." in filesystem and radio browsers now correctly navigates back. The back-item detector now handles `title == ".."` and `root`-level URIs.
- **Fix** — **browse empty titles**: provider sub-items (Deezer, Music Assistant builtin, TuneIn) that returned empty `name` now fall back to `display_name`, `translation_key`, or `item_id` for a readable title.
- **Fix** — **browse recommendations sub-folders**: navigating into recommendation folders (e.g., Deezer "Made for you") no longer fails with "Invalid subpath". URIs are now reconstructed from parent URI + `item_id` instead of relying on MA's auto-generated `folder/`-prefixed URIs.
- **Fix** — **browse path priority**: `BrowseFolder` items now use the `path` field (navigation path) over `uri` (semantic identifier), matching what Music Assistant expects.
- **Improvement** — **discover tabs hide filters**: library tabs that only contain discover sections (recently_played, recently_added, recommended, flows) now automatically hide the source/favorites filter bar since those filters don't apply.

## 3.9.4
- **Fix** — **discover section thumbnails**: items returned by Music Assistant with image data in the `image` field (e.g., "Recently played" flows) were missing their cover art. The backend now reads `image.path` / `image.url` in addition to `metadata.images`.
- **Feature** — **artist queue & mix**: artists now have a (+) button in the library lane, search results, and artist detail page. The dropdown menu offers "Play next", "Add to end", and "Start a mix" (radio mode) — same as albums and playlists.

## 3.9.3
- **Fix** — **discover sections now respect provider filter**: Music Assistant returns recommendation folders without provider metadata. The backend now infers each folder's provider by analyzing its items — folders where all items share one provider (e.g., a Deezer account's "Made for you") are tagged with that provider. Mixed folders (e.g., "Recently added tracks") are filtered at the item level. Disabling a Deezer account in Settings now correctly hides that account's recommendations, mood flows, genre flows, and radios.

## 3.9.2
- **Fix** — **library provider filter restored**: the per-source filter (Deezer account A vs B, TuneIn, etc.) was broken — items from all providers were shown regardless of checkbox state. Root cause: items with a `library://` URI scheme or `library` provider tag were unconditionally bypassing the filter. Now only items with truly no identifiable provider pass through; all others are correctly checked against the enabled providers list.

## 3.9.1
- **Fix** — **search now finds local files by filename**: search runs both a normal query and a `library_only` query in parallel, then merges and deduplicates results. Tracks whose filename contains the search term (but whose metadata does not) now appear in results, matching Music Assistant's own search behavior.

## 3.9.0
- **Feature** — **discover sections in library**: new `recently_played`, `recently_added`, `recommended`, and `flows` sections available in the library tab. Powered by Music Assistant's recommendations API.
- **Feature** — **radios enriched with recommendations**: radio section now includes MA-recommended radios alongside library radios.

## 3.8.1
- **Fix** — **mobile touch targets**: device modal attach/detach buttons now have visible circle backgrounds and 38×38 px hit zones on Companion mobile.

## 3.8.0
- **Feature** — **Companion mobile mode**: automatically detects HA Companion app on phone-sized screens and activates a touch-optimized UI.
- **Feature** — **queue bottom-sheet overlay**: on mobile, the queue slides up from the bottom with a backdrop; tap outside or the close button to dismiss.
- **Feature** — **enlarged touch targets**: add-to-queue buttons with accent circle, queue remove buttons with visible circle, bigger slider thumbs and progress bar hit zone.
- **Feature** — **player controls reflowed**: queue toggle button integrated in the control row instead of overlapping on narrow screens.
- **Feature** — **version in Settings**: version number displayed at the bottom of the Settings panel.
- **Fix** — queue toast messages now show confirmation text ("Added after current track" / "Added to end of queue") instead of repeating the menu label.

## 3.7.4
- **Fix** — **library provider filter**: server-side filtering via Music Assistant's `provider_instance_id_or_domain` parameter. Previously the filter relied on client-side matching of `provider_instances`, which didn't work because MA deduplicates content and assigns all available playback sources to each item. Now each enabled provider is queried individually and results are merged/deduplicated.
- **Fix** — exclude MA internal `builtin` provider from the settings provider list, from item `provider_instances`, and from localStorage cache. The `builtin` provider (MA's internal library manager) was causing all items to pass the filter.
- **Feature** — **device volume sliders**: the group/device modal now shows per-device volume sliders for the master and all group members, with live updating and drag support.

## 3.6.3
- **Fix** — **cover art & thumbnails mixed-content proxy**: new `_resolveImageUrl` helper detects HTTPS pages loading HTTP images (mixed content blocked by browsers) and routes them through a server-side image proxy (`/my_music_library/image_proxy`). HTTP-only setups are unaffected — images load directly as before.
- **Fix** — subitems API compatibility: reordered `get_album_tracks` / `get_playlist_tracks` call attempts to try `(item_id, provider)` first, matching newer Music Assistant API signatures. Reduced fallback log noise from `warning` to `debug`.

## 3.6.2 *(yanked)*
- Broken release — incorrect proxy URL path caused all images to fail. Superseded by 3.6.3.

## 3.6.2
- **Fix** — **cover art server-side image proxy**: new `/api/my_music_library/image_proxy` endpoint fetches images server-side, solving mixed-content (HTTPS page → HTTP MA) and CORS issues that prevented cover art from loading on Safari, iOS, and wall panels.
- **Fix** — all thumbnail URLs (library, search, queue) are now routed through the image proxy, preventing mixed-content blocking everywhere.
- **Fix** — subitems API compatibility: reordered `get_album_tracks` / `get_playlist_tracks` call attempts to try `(item_id, provider)` first, matching the new Music Assistant API signature. Reduced fallback log noise from `warning` to `debug`.

## 3.6.1
- **Fix** — `_resolve_queue_id` now async: awaits `player_queues.get_active_queue()` which became a coroutine in recent Music Assistant versions (fixes `RuntimeWarning: coroutine was never awaited`).
- **Fix** — cover art fallback: when the direct MA imageproxy URL fails (CORS, network), the card now falls back to HA's built-in media player proxy (`/api/media_player_proxy/{entity_id}`) before showing the placeholder.

## 3.6.0
- **Feature** — **MA native queue integration**: new `MAQueueView` endpoint reads and controls the Music Assistant queue directly, keeping the card in sync with MA's actual playback queue.
- **Feature** — **queue actions**: play next, add to end, remove from queue, jump to track.
- **Feature** — **queue UI**: toggle queue visibility, empty state display.
- **Feature** — **search layout toggle**: switch between rows and columns view for search results.

## 3.5.0
- **Feature** — **library layout modes**: `lanes` (horizontal scroll with arrows on hover), `grid` (responsive CSS grid), `columns` (side-by-side sections), `auto` (adaptive).
- **Feature** — **layout selector** in Settings panel (persisted in localStorage).
- **Feature** — **lane navigation arrows** on desktop hover.
- **Feature** — YAML `layout` option on the library tab configuration.

## 3.4.0
- **Feature** — toggleable **debug logging** via integration options. When enabled, Python logs switch to DEBUG level (visible in HA logs with filter `my_music_library`) and the JS card outputs detailed `[MML]` traces in the browser console for config, API calls, search strategies, library loading, player selection, queue, and playback.
- **Feature** — pulsing orange debug indicator banner in the Settings modal when debug mode is active.
- **Feature** — GitHub issue template with step-by-step debug log collection instructions.

## 3.3.0
- **Feature** — visual **WYSIWYG card editor** for Lovelace UI: drag-and-drop tab reorder, inline configuration of labels, icons, library sections, and button actions — no YAML needed.

## 3.2.0
- **Feature** — **fully configurable tabs** via YAML `tabs` array: reorder, rename, re-icon any tab; insert action buttons anywhere in the tab bar; control which library sections appear and their order.
- **Feature** — **radios** support in the library (new section type).
- **Feature** — `settings` tab type, positionable in the tab bar.
- **Backward compatible** — `nav_buttons_left` / `nav_buttons_right` still work if `tabs` is not provided.

## 3.1.5
- **Feature** — horizontal scroll **nav bar** for mobile accessibility; fade indicators on scroll edges.

## 3.1.4
- **Fix** — robust cover art loading with fallback chain and debug logs.

## 3.1.3
- **Fix** — `customElements.define` guarded with `customElements.get` so a double module load never triggers "already been used with this registry".
- **Fix** — removed `add_extra_js_url` registration: HA's `scoped-custom-element-registry` polyfill was causing the card module to be evaluated twice. The Lovelace resource mechanism alone is the correct approach for custom cards.

## 3.1.2
- **Fix** — reliable browser cache-busting with versioned Lovelace resource URL (`?v=X.Y.Z`). Delete-first, add-after strategy prevents `customElements.define` conflicts on upgrade.

## 3.1.1
- **Fix** — Ctrl+Shift+R after upgrade no longer shows "configuration error".
- **Fix** — Settings modal: library providers always loaded regardless of `ma_entry_id`.
- **Fix** — `_get_providers_via_ma_client`: direct `getattr` access on `ProviderInstance` objects for compatibility with all MA model versions.

## 3.0.2
- **Fix** — card invisible after fresh install: `frontend` and `lovelace` made hard dependencies in `manifest.json`.

## 3.0.1
- **Fix** — Lovelace card not appearing in picker after fresh HACS install. Registration deferred to `EVENT_HOMEASSISTANT_STARTED`.
- **Fix** — YAML-mode fallback and `add_extra_js_url()` last-resort fallback.

## 3.0.0
- **Refactor** — MA connectivity rewritten: integration discovers the MA client via the `mass` config entry instead of managing its own connection.
- **Fix** — MA domain corrected to `"mass"` with `"music_assistant"` as legacy fallback.
- **Improvement** — MA URL auto-discovered from the `mass` config entry.

## 2.9.6
- **Fix** — browse: MA virtual "back" items intercepted and translated to breadcrumb navigation.

## 2.9.5
- **Fix** — browse: root level no longer erroneously filtered.

## 2.9.4
- **Fix** — browse: MA virtual `back` items filtered server-side.

## 2.9.3
- **Fix** — browse: breadcrumb navigation displayed in all states (loading, empty, error).
- **Fix** — browse: MA URI prefix `folder/` stripped server-side.

## 2.9.2
- **Fix** — browse: `mass.browse()` tried at top-level for compatibility with all MA versions.
- **Fix** — library mode toggle: switching between Catalogue and Browse takes effect immediately.

## 2.9.1
- **Feature** — Library **Browse mode**: navigate the local filesystem directory tree, play files or folders.
- **Backend** — new endpoint `GET /api/my_music_library/browse?uri=<uri>`.

## 2.9.0
- **Fix** — volume slider and progress bar: commands sent only on pointer release, not during drag.

## 2.8.9
- **Fix** — library source filter works correctly; provider mappings properly serialized.
- **Improvement** — progressive rendering, auto-pagination, parallel search strategies, 700 ms debounce.

## 2.8.5
- **Feature** — library source filter (All / Local / Streaming) and favorites toggle.

## 2.8.2
- **Fix** — device picker reflects updated exclusion list without full page refresh.

## 2.8.1
- **Fix** — stale group members no longer persist across player switches.

## 2.8.0
- **Feature** — player grouping: attach and detach players from the device picker.

## 2.7.0
- **Feature** — player exclusion via integration options with wildcard pattern support.

## 2.6.0
- **Feature** — server-side queue persistence per player, shared across browsers/devices.
- **Feature** — auto-detection of externally triggered album/playlist changes.

## 2.5.0
- **Feature** — custom tab-bar buttons with tap/hold/double-tap actions.
- **Feature** — `height` and `entity` card config options.

## 2.4.0
- **Feature** — Library tab with infinite scroll / pagination.

## 2.3.0
- **Feature** — Search tab.

## 2.2.0
- **Feature** — multilingual support (en, fr, de) and responsive layout.

## 2.1.0
- **Feature** — device picker with localStorage persistence.

## 2.0.0
- Initial public release.
