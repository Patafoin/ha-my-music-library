"""HTTP API views for My Music Library (proxy to Music Assistant)."""
from __future__ import annotations

import dataclasses
import enum
import logging
from http import HTTPStatus
from typing import Any

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import CONF_MA_URL, DOMAIN

_LOGGER = logging.getLogger(__name__)


# ── Serialization ────────────────────────────────────────────────────────────

def _to_json_safe(obj: Any) -> Any:
    """Recursively convert MA model objects to JSON-serialisable dicts."""
    if obj is None or isinstance(obj, (bool, int, float, str)):
        return obj
    if isinstance(obj, enum.Enum):
        return obj.value
    if dataclasses.is_dataclass(obj) and not isinstance(obj, type):
        return {f.name: _to_json_safe(getattr(obj, f.name)) for f in dataclasses.fields(obj)}
    if isinstance(obj, dict):
        return {k: _to_json_safe(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set, frozenset)):
        return [_to_json_safe(i) for i in obj]
    return str(obj)


def _serialize_search_results(results: Any) -> dict:
    """Convert a MA SearchResults object (or dict) to a plain dict."""
    if results is None:
        return {"tracks": [], "artists": [], "albums": [], "playlists": []}
    safe = _to_json_safe(results)
    if isinstance(safe, dict):
        return safe
    return {"tracks": [], "artists": [], "albums": [], "playlists": [], "raw": str(safe)}


# ── Get configured MA URL ─────────────────────────────────────────────────────

def _get_ma_url(hass: HomeAssistant) -> str | None:
    """Return the MA base URL from My Music Library config entry."""
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        _LOGGER.warning("No My Music Library config entry found")
        return None
    url = entries[0].data.get(CONF_MA_URL) or None
    if not url:
        _LOGGER.warning("MA URL not set in My Music Library config entry (data=%s)", dict(entries[0].data))
    return url.rstrip("/") if url else None


# ── Primary: direct HTTP call to configured MA URL ────────────────────────────

async def _search_via_ma_url(
    hass: HomeAssistant,
    ma_url: str,
    query: str,
    limit: int,
) -> dict | None:
    """Call MA's REST search API using the base URL configured at install time."""
    from aiohttp import ClientTimeout  # noqa: PLC0415

    session = async_get_clientsession(hass)
    timeout = ClientTimeout(total=10)
    params = {"query": query, "limit": str(limit)}

    for path in ["/api/search", "/api/music/search"]:
        url = f"{ma_url}{path}"
        try:
            async with session.get(url, params=params, timeout=timeout) as resp:
                if resp.status == 200:
                    data = await resp.json(content_type=None)
                    _LOGGER.info("MA REST search via %s succeeded", url)
                    return _serialize_search_results(data)
                _LOGGER.debug("MA REST search via %s returned HTTP %s", url, resp.status)
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("MA REST search via %s failed: %s", url, err)

    return None


# ── Fallback: authenticated MA integration client ─────────────────────────────

async def _search_via_ma_client(
    hass: HomeAssistant,
    query: str,
    limit: int,
) -> dict | None:
    """Use the MA HA integration's authenticated Python client to search."""
    ma_entries = hass.config_entries.async_entries("music_assistant")
    if not ma_entries:
        _LOGGER.warning("No music_assistant config entries found")
        return None

    _LOGGER.info(
        "Trying MA client search, found %d music_assistant entry(ies): %s",
        len(ma_entries),
        [e.entry_id for e in ma_entries],
    )

    for ma_entry in ma_entries:
        entry_id = ma_entry.entry_id

        # HA 2024.4+: runtime data lives on the entry object itself
        entry_data = getattr(ma_entry, "runtime_data", None)

        # Older pattern: hass.data["music_assistant"][entry_id]
        if entry_data is None:
            ma_data = hass.data.get("music_assistant", {})
            entry_data = ma_data.get(entry_id)
            _LOGGER.warning(
                "runtime_data not found, tried hass.data['music_assistant'] keys=%s",
                list(ma_data.keys()),
            )

        if entry_data is None:
            _LOGGER.warning("No entry_data found for music_assistant entry %s", entry_id)
            continue

        mass = getattr(entry_data, "mass", None)
        if mass is None:
            _LOGGER.warning(
                "entry_data for %s has no .mass (type=%s, attrs=%s)",
                entry_id,
                type(entry_data).__name__,
                [a for a in dir(entry_data) if not a.startswith("_")],
            )
            continue

        # Try mass.music.search() (MA 2.x) then mass.search() (older)
        music_module = getattr(mass, "music", None)
        search_fn = (
            getattr(music_module, "search", None) if music_module else None
        ) or getattr(mass, "search", None)

        if search_fn is None:
            _LOGGER.warning(
                "No search method on MA client (mass type=%s, music=%s)",
                type(mass).__name__,
                music_module,
            )
            continue

        _LOGGER.info("Calling %s.search() for %r", type(search_fn).__name__, query)

        # Try multiple call signatures in case the MA version differs
        last_err: Exception | None = None
        for kwargs in [
            {"media_types": None, "limit": limit},
            {"limit": limit},
            {},
        ]:
            try:
                results = await search_fn(query, **kwargs)
                _LOGGER.info("MA client search succeeded (kwargs=%s)", kwargs)
                return _serialize_search_results(results)
            except TypeError as err:
                _LOGGER.warning("search_fn(%r, **%s) TypeError: %s", query, kwargs, err)
                last_err = err
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("MA client search failed: %s", err)
                last_err = err
                break

        _LOGGER.warning("All MA client search attempts failed. Last error: %s", last_err)

    return None


# ── Library via MA client ─────────────────────────────────────────────────────

def _normalize_library_item(item: dict) -> dict:
    """Map MA Python client fields to the browse_media-compatible fields the card expects."""
    # Title: MA uses 'name', browse_media uses 'title'
    title = item.get("name") or item.get("title") or ""

    # URI / content ID
    uri = item.get("uri") or item.get("media_content_id") or ""

    # Media type (MA enum value or string)
    media_type = item.get("media_type", "")
    if isinstance(media_type, dict):
        media_type = media_type.get("value", "")

    # Thumbnail: look in metadata.images list
    thumbnail = item.get("thumbnail") or ""
    if not thumbnail:
        metadata = item.get("metadata") or {}
        images = metadata.get("images") or []
        for img in images:
            path = img.get("path", "") if isinstance(img, dict) else ""
            if path and path.startswith("http"):
                thumbnail = path
                break

    # Artist name (for albums and tracks)
    artist = item.get("media_artist") or ""
    if not artist:
        artists = item.get("artists") or []
        if artists and isinstance(artists[0], dict):
            artist = artists[0].get("name", "")

    # Album type (album, ep, single, compilation) — used for grouping on artist page
    album_type = item.get("album_type", "album")
    if isinstance(album_type, dict):
        album_type = album_type.get("value", "album")

    # Track fields
    track_number = item.get("track_number") or item.get("position") or 0
    duration = item.get("duration") or 0

    # Provider domains this item belongs to (e.g. ["filesystem_local", "deezer"])
    provider_mappings = item.get("provider_mappings") or []
    providers = sorted({
        m.get("provider_domain", "")
        for m in provider_mappings if isinstance(m, dict) and m.get("provider_domain")
    })
    return {
        "title": title,
        "media_content_id": uri,
        "media_content_type": media_type,
        "thumbnail": thumbnail,
        "media_artist": artist,
        "album_type": str(album_type).lower() if album_type else "album",
        "track_number": int(track_number) if track_number else 0,
        "duration": float(duration) if duration else 0,
        "providers": providers,
    }


_LIBRARY_METHODS: dict[str, list[str]] = {
    "artists":   ["get_library_artists", "get_artists"],
    "albums":    ["get_library_albums",  "get_albums"],
    "tracks":    ["get_library_tracks",  "get_tracks"],
    "playlists": ["get_library_playlists", "get_playlists"],
}


async def _get_library_via_ma_client(
    hass: HomeAssistant,
    media_type: str,
    limit: int,
    favorite: bool,
    offset: int = 0,
) -> list | None:
    """Use the MA HA integration's Python client to fetch library items."""
    ma_entries = hass.config_entries.async_entries("music_assistant")
    if not ma_entries:
        _LOGGER.warning("No music_assistant config entries found")
        return None

    for ma_entry in ma_entries:
        entry_data = getattr(ma_entry, "runtime_data", None)
        if entry_data is None:
            ma_data = hass.data.get("music_assistant", {})
            entry_data = ma_data.get(ma_entry.entry_id)

        if entry_data is None:
            _LOGGER.warning("No entry_data for MA entry %s", ma_entry.entry_id)
            continue

        mass = getattr(entry_data, "mass", None)
        music_module = getattr(mass, "music", None) if mass else None
        if music_module is None:
            _LOGGER.warning("No mass.music module for MA entry %s", ma_entry.entry_id)
            continue

        fn = None
        for name in _LIBRARY_METHODS.get(media_type, []):
            fn = getattr(music_module, name, None)
            if fn is not None:
                _LOGGER.debug("Using MA client method: music.%s()", name)
                break

        if fn is None:
            _LOGGER.warning("No library method found for type=%s on music module %s", media_type, type(music_module).__name__)
            continue

        for kwargs in [
            {"favorite": favorite, "limit": limit, "offset": offset},
            {"favorite": favorite, "limit": limit},
            {"limit": limit},
            {},
        ]:
            try:
                result = await fn(**kwargs)
                items = list(result) if not isinstance(result, list) else result
                _LOGGER.debug("Library %s fetched: %d items (kwargs=%s)", media_type, len(items), kwargs)
                return [_normalize_library_item(_to_json_safe(i)) for i in items[:limit]]
            except TypeError:
                continue
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("Library fetch for %s failed: %s", media_type, err)
                break

    return None


# ── HA View ──────────────────────────────────────────────────────────────────

class MusicAssistantSearchView(HomeAssistantView):
    """Proxy search requests to Music Assistant.

    GET /api/my_music_library/search?query=<q>&limit=<n>

    Strategy:
      1. Direct HTTP call to the MA base URL configured during integration setup.
      2. Fallback: MA HA integration's authenticated Python client.
    """

    url = "/api/my_music_library/search"
    name = "api:my_music_library:search"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Handle search request."""
        hass: HomeAssistant = request.app["hass"]

        query = request.query.get("query", "").strip()
        if not query:
            return self.json_message("Missing 'query' parameter.", HTTPStatus.BAD_REQUEST)

        limit = min(int(request.query.get("limit", 25)), 100)
        _LOGGER.info("Search request: query=%r limit=%d", query, limit)

        # 1 — Direct call to the configured MA URL (REST, if the endpoint exists)
        ma_url = _get_ma_url(hass)
        if ma_url:
            _LOGGER.info("Trying MA REST search at %s", ma_url)
            result = await _search_via_ma_url(hass, ma_url, query, limit)
            if result is not None:
                return web.json_response(result)
            # 404 is expected if MA exposes no REST search endpoint — fall through silently

        # 2 — Fallback: MA integration client (authenticated WS-backed client)
        result = await _search_via_ma_client(hass, query, limit)
        if result is None:
            _LOGGER.error(
                "Both MA search strategies failed for query=%r. "
                "Check above warnings for the specific failure reason.",
                query,
            )
            return self.json_message(
                "Could not search Music Assistant. "
                "Check HA logs for details (filter: my_music_library).",
                HTTPStatus.BAD_GATEWAY,
            )

        return web.json_response(result)


class MusicAssistantLibraryView(HomeAssistantView):
    """Return library items from Music Assistant.

    GET /api/my_music_library/library?type=artists|albums|tracks|playlists&limit=25&favorite=true
    """

    url = "/api/my_music_library/library"
    name = "api:my_music_library:library"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Handle library request."""
        hass: HomeAssistant = request.app["hass"]

        media_type = request.query.get("type", "").strip()
        if media_type not in ("artists", "albums", "tracks", "playlists"):
            return self.json_message("Invalid 'type' parameter.", HTTPStatus.BAD_REQUEST)

        limit = min(int(request.query.get("limit", 25)), 100)
        favorite = request.query.get("favorite", "true").lower() != "false"
        offset = max(0, int(request.query.get("offset", 0)))

        _LOGGER.info("Library request: type=%s limit=%d offset=%d favorite=%s", media_type, limit, offset, favorite)

        items = await _get_library_via_ma_client(hass, media_type, limit, favorite, offset)
        if items is None:
            _LOGGER.error("Library fetch failed for type=%s", media_type)
            return self.json_message(
                "Could not get library from Music Assistant. "
                "Check HA logs for details (filter: my_music_library).",
                HTTPStatus.BAD_GATEWAY,
            )

        return web.json_response({"type": media_type, "items": items})


# ── Browse (filesystem directory tree) ───────────────────────────────────────

def _normalize_browse_item(item: dict) -> dict:
    """Normalise a MA browse result item (BrowseFolder or MediaItem) for the card."""
    # Detect folders: BrowseFolder has 'path' and no 'media_type', or media_type == "folder"
    media_type = item.get("media_type", "")
    if isinstance(media_type, dict):
        media_type = media_type.get("value", "")
    media_type = str(media_type).lower() if media_type else ""

    is_folder = (
        "path" in item and media_type in ("", "folder", "directory")
    ) or media_type in ("folder", "directory")

    title = item.get("name") or item.get("label") or item.get("title") or ""
    uri = item.get("uri") or item.get("media_content_id") or ""

    # MA sometimes returns URIs like "provider://folder/Deftones" where "folder/"
    # is an internal prefix, not a real directory. Strip it so navigation works.
    if "://" in uri:
        _scheme, _path = uri.split("://", 1)
        if _path.startswith("folder/"):
            uri = f"{_scheme}://{_path[len('folder/'):]}"

    thumbnail = item.get("thumbnail") or ""
    if not thumbnail:
        metadata = item.get("metadata") or {}
        images = metadata.get("images") or []
        for img in images:
            path = img.get("path", "") if isinstance(img, dict) else ""
            if path and path.startswith("http"):
                thumbnail = path
                break

    artist = item.get("media_artist") or ""
    if not artist:
        artists = item.get("artists") or []
        if artists and isinstance(artists[0], dict):
            artist = artists[0].get("name", "")

    duration = item.get("duration") or 0

    return {
        "title": title,
        "uri": uri,
        "media_content_type": media_type or ("folder" if is_folder else "music"),
        "thumbnail": thumbnail,
        "subtitle": artist,
        "duration": float(duration) if duration else 0,
        "is_folder": is_folder,
    }


def _is_ma_back_item(item: dict) -> bool:
    """Return True for MA virtual 'back' navigation items (uri ends with ://back or ://..)."""
    uri = item.get("uri", "")
    if "://" in uri:
        path = uri.split("://", 1)[1].lower().rstrip("/")
        if path in ("back", ".."):
            return True
    return False


async def _browse_via_ma_client(
    hass: HomeAssistant,
    uri: str | None,
    limit: int = 200,
) -> list | None:
    """Browse a MA path via the MA Python client.

    Tries, in order:
      1. mass.music.browse(uri)
      2. mass.browse(uri)           — top-level, used in some MA versions
    """
    ma_entries = hass.config_entries.async_entries("music_assistant")
    if not ma_entries:
        return None

    for ma_entry in ma_entries:
        entry_data = getattr(ma_entry, "runtime_data", None)
        if entry_data is None:
            entry_data = hass.data.get("music_assistant", {}).get(ma_entry.entry_id)

        mass = getattr(entry_data, "mass", None)
        if not mass:
            continue

        music = getattr(mass, "music", None)

        # Collect candidate browse functions: music.browse first, then mass.browse
        candidates: list[tuple[str, Any]] = []
        if music:
            fn = getattr(music, "browse", None)
            if fn:
                candidates.append(("mass.music.browse", fn))
        fn = getattr(mass, "browse", None)
        if fn:
            candidates.append(("mass.browse", fn))

        if not candidates:
            _LOGGER.warning("No browse() method found on mass or mass.music")
            continue

        for fn_name, browse_fn in candidates:
            attempts: list[tuple[tuple, dict]] = [
                ((uri,), {}) if uri else ((), {}),
                ((), {"uri": uri}) if uri else ((), {}),
                ((), {"path": uri}) if uri else ((), {}),
            ]
            for call_args, call_kwargs in attempts:
                try:
                    result = await browse_fn(*call_args, **call_kwargs)
                    items = list(result) if not isinstance(result, list) else result
                    _LOGGER.debug("%s(%r) → %d items", fn_name, uri, len(items))
                    normalized = [_normalize_browse_item(_to_json_safe(i)) for i in items]
                    # Mark back items instead of removing them — client handles the click
                    for n in normalized:
                        if _is_ma_back_item(n):
                            n["is_back"] = True
                    return normalized[:limit]
                except TypeError:
                    continue
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning("%s(%r) failed: %s", fn_name, uri, err)
                    break  # try next candidate

    return None


class MusicAssistantBrowseView(HomeAssistantView):
    """Browse the MA filesystem tree.

    GET /api/my_music_library/browse?uri=<uri>
        uri is optional — omit for root.
    """

    url = "/api/my_music_library/browse"
    name = "api:my_music_library:browse"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Handle browse request."""
        hass: HomeAssistant = request.app["hass"]
        uri = request.query.get("uri", "").strip() or None
        limit = min(int(request.query.get("limit", 200)), 500)

        _LOGGER.info("Browse request: uri=%r limit=%d", uri, limit)
        items = await _browse_via_ma_client(hass, uri, limit)
        if items is None:
            return self.json_message(
                "Could not browse Music Assistant. Check HA logs.",
                HTTPStatus.BAD_GATEWAY,
            )
        return web.json_response({"uri": uri or "", "items": items})


# ── Subitems (artist albums, album tracks, playlist tracks) ───────────────────

_SUBITEM_METHODS: dict[str, list[str]] = {
    "artist_albums":   ["get_artist_albums"],
    "album_tracks":    ["get_album_tracks"],
    "playlist_tracks": ["get_playlist_tracks"],
}


def _parse_ma_uri(uri: str) -> tuple[str, str]:
    """Return (item_id, provider_domain) from a MA URI string.

    Examples
    --------
    ``spotify://artist/12345``      → ("12345", "spotify")
    ``music_assistant://abc``       → ("abc",   "music_assistant")
    ``qobuz://album/xyz/789``       → ("789",   "qobuz")
    """
    if "://" not in uri:
        return uri, "library"
    scheme, rest = uri.split("://", 1)
    parts = [p for p in rest.split("/") if p]  # drop empty segments
    # item_id is the last non-empty path component; provider is the URI scheme
    item_id = parts[-1] if parts else rest
    return item_id, scheme


async def _get_subitems(
    hass: HomeAssistant,
    action: str,
    uri: str,
    limit: int = 50,
) -> list | None:
    """Fetch sub-items of a MA library item via the MA Python client."""
    ma_entries = hass.config_entries.async_entries("music_assistant")
    if not ma_entries:
        _LOGGER.warning("No music_assistant config entries found")
        return None

    methods = _SUBITEM_METHODS.get(action, [])
    if not methods:
        return None

    for ma_entry in ma_entries:
        entry_data = getattr(ma_entry, "runtime_data", None)
        if entry_data is None:
            entry_data = hass.data.get("music_assistant", {}).get(ma_entry.entry_id)

        mass = getattr(entry_data, "mass", None)
        music = getattr(mass, "music", None) if mass else None
        if not music:
            continue

        item_id, provider = _parse_ma_uri(uri)
        _LOGGER.info(
            "Subitems %s: uri=%r → item_id=%r provider=%r (music methods: %s)",
            action, uri, item_id, provider,
            [m for m in dir(music) if "artist" in m or "album" in m or "track" in m or "playlist" in m],
        )

        for method_name in methods:
            fn = getattr(music, method_name, None)
            if not fn:
                _LOGGER.warning("Subitems: method %r not found on music module %s", method_name, type(music).__name__)
                continue

            # Try progressively simpler call signatures
            attempts = [
                ((uri,), {}),
                ((item_id, provider), {}),
                ((item_id,), {}),
                ((), {"item_id": item_id, "provider_instance_id_or_domain": provider}),
                ((), {"item_id": item_id}),
            ]
            for call_args, call_kwargs in attempts:
                try:
                    result = await fn(*call_args, **call_kwargs)
                    items = list(result) if not isinstance(result, list) else result
                    _LOGGER.info(
                        "Subitems %s: %d items (args=%s kwargs=%s)",
                        action, len(items), call_args, call_kwargs,
                    )
                    return [_normalize_library_item(_to_json_safe(i)) for i in items[:limit]]
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning(
                        "Subitems %s args=%s kwargs=%s → %s: %s",
                        method_name, call_args, call_kwargs, type(err).__name__, err,
                    )
                    continue

    return None


class PlayerQueueView(HomeAssistantView):
    """Per-player queue storage — accessible from any browser/device.

    GET  /api/my_music_library/queue?player=<entity_id>
         → {"queue": [...], "source": "<uri or null>"}

    POST /api/my_music_library/queue
         body: {"player": "<entity_id>", "queue": [...], "source": "<uri or null>"}
         → {"ok": true}
    """

    url = "/api/my_music_library/queue"
    name = "api:my_music_library:queue"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Return the stored queue for a player."""
        hass: HomeAssistant = request.app["hass"]
        player = request.query.get("player", "").strip()
        if not player:
            return self.json_message("Missing 'player' parameter.", HTTPStatus.BAD_REQUEST)
        queues: dict = hass.data.get(DOMAIN, {}).get("queues", {})
        data = queues.get(player, {"queue": [], "source": None})
        return web.json_response(data)

    async def post(self, request: web.Request) -> web.Response:
        """Save the queue for a player."""
        hass: HomeAssistant = request.app["hass"]
        try:
            body: dict = await request.json()
        except Exception:  # noqa: BLE001
            return self.json_message("Invalid JSON body.", HTTPStatus.BAD_REQUEST)

        player = (body.get("player") or "").strip()
        if not player:
            return self.json_message("Missing 'player' field.", HTTPStatus.BAD_REQUEST)

        entry = {
            "queue": body.get("queue") or [],
            "source": body.get("source") or None,
        }
        domain_data = hass.data.setdefault(DOMAIN, {})
        domain_data.setdefault("queues", {})[player] = entry

        store = domain_data.get("queue_store")
        if store:
            await store.async_save({
                "queues": domain_data["queues"],
                "groups": domain_data.get("groups", {}),
            })

        return web.json_response({"ok": True})


class PlayerGroupView(HomeAssistantView):
    """Per-player group membership storage.

    GET  /api/my_music_library/groups?player=<entity_id>
         → {"player": "<entity_id>", "members": [...]}

    POST /api/my_music_library/groups
         body: {"player": "<entity_id>", "members": [...]}
         → {"ok": true}
    """

    url = "/api/my_music_library/groups"
    name = "api:my_music_library:groups"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Return the stored group members for a player."""
        hass: HomeAssistant = request.app["hass"]
        player = request.query.get("player", "").strip()
        if not player:
            return self.json_message("Missing 'player' parameter.", HTTPStatus.BAD_REQUEST)
        groups: dict = hass.data.get(DOMAIN, {}).get("groups", {})
        members = groups.get(player, [])
        return web.json_response({"player": player, "members": members})

    async def post(self, request: web.Request) -> web.Response:
        """Save the group members for a player."""
        hass: HomeAssistant = request.app["hass"]
        try:
            body: dict = await request.json()
        except Exception:  # noqa: BLE001
            return self.json_message("Invalid JSON body.", HTTPStatus.BAD_REQUEST)

        player = (body.get("player") or "").strip()
        if not player:
            return self.json_message("Missing 'player' field.", HTTPStatus.BAD_REQUEST)

        members = [m for m in (body.get("members") or []) if isinstance(m, str) and m]
        domain_data = hass.data.setdefault(DOMAIN, {})
        domain_data.setdefault("groups", {})[player] = members

        store = domain_data.get("queue_store")
        if store:
            await store.async_save({
                "queues": domain_data.get("queues", {}),
                "groups": domain_data["groups"],
            })

        return web.json_response({"ok": True})


class MusicAssistantSubitemsView(HomeAssistantView):
    """Return sub-items of a MA library item.

    GET /api/my_music_library/subitems?action=artist_albums|album_tracks|playlist_tracks&uri=<uri>
    """

    url = "/api/my_music_library/subitems"
    name = "api:my_music_library:subitems"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Handle subitems request."""
        hass: HomeAssistant = request.app["hass"]

        action = request.query.get("action", "").strip()
        uri = request.query.get("uri", "").strip()
        limit = min(int(request.query.get("limit", 50)), 200)

        if action not in ("artist_albums", "album_tracks", "playlist_tracks"):
            return self.json_message("Invalid 'action' parameter.", HTTPStatus.BAD_REQUEST)
        if not uri:
            return self.json_message("Missing 'uri' parameter.", HTTPStatus.BAD_REQUEST)

        _LOGGER.info("Subitems request: action=%s uri=%s limit=%d", action, uri, limit)
        items = await _get_subitems(hass, action, uri, limit)
        if items is None:
            return self.json_message(
                "Could not get subitems from Music Assistant. Check HA logs.",
                HTTPStatus.BAD_GATEWAY,
            )

        return web.json_response({"action": action, "items": items})
