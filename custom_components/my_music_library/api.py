"""HTTP API views for My Music Library (proxy to Music Assistant)."""
from __future__ import annotations

import asyncio
import dataclasses
import enum
import logging
from http import HTTPStatus
from typing import Any

import aiohttp
from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import CONF_MA_URL, DOMAIN, MUSIC_ASSISTANT_DOMAIN

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


# ── MA client / URL resolution ────────────────────────────────────────────────

_MA_CANDIDATE_DOMAINS = (MUSIC_ASSISTANT_DOMAIN, "music_assistant")


def _get_mass_client(hass: HomeAssistant) -> Any | None:
    """Return the MusicAssistantClient from the MA integration's runtime_data.

    Tries domain "mass" first (MA 2.x+), then "music_assistant" (legacy).
    """
    for domain in _MA_CANDIDATE_DOMAINS:
        for entry in hass.config_entries.async_entries(domain):
            client = getattr(getattr(entry, "runtime_data", None), "mass", None)
            if client is not None:
                _LOGGER.debug("MA client found via domain=%r entry=%s", domain, entry.entry_id)
                return client

    # Nothing found — emit a warning with enough context to diagnose the issue
    all_entries = {
        e.domain: e.entry_id
        for e in hass.config_entries.async_entries()
        if e.domain in (*_MA_CANDIDATE_DOMAINS, "mass", "music_assistant")
    }
    _LOGGER.warning(
        "No Music Assistant client found. "
        "Tried domains %s. Loaded MA-related entries: %s. "
        "Make sure the Music Assistant integration is installed and loaded.",
        _MA_CANDIDATE_DOMAINS,
        all_entries or "none",
    )
    return None


def _get_mass_url(hass: HomeAssistant) -> str | None:
    """Return the MA server URL, trying MA config entries first then our own config."""
    for domain in _MA_CANDIDATE_DOMAINS:
        for entry in hass.config_entries.async_entries(domain):
            url = entry.data.get("url")
            if url:
                return url.rstrip("/")
    # Backward compat: URL manually configured in my_music_library config entry
    for entry in hass.config_entries.async_entries(DOMAIN):
        url = entry.data.get(CONF_MA_URL)
        if url:
            return url.rstrip("/")
    return None


# ── REST fallback: direct HTTP call to MA ────────────────────────────────────

async def _search_via_rest(
    hass: HomeAssistant,
    ma_url: str,
    query: str,
    limit: int,
    *,
    library_only: bool = False,
) -> dict | None:
    """Call MA's REST search API directly over HTTP."""
    from aiohttp import ClientTimeout  # noqa: PLC0415

    session = async_get_clientsession(hass)
    timeout = ClientTimeout(total=10)
    params: dict[str, str] = {"query": query, "limit": str(limit)}
    if library_only:
        params["library_only"] = "true"

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


# ── Search ────────────────────────────────────────────────────────────────────

async def _search_via_ma_client(
    hass: HomeAssistant,
    query: str,
    limit: int,
    *,
    library_only: bool = False,
) -> dict | None:
    """Use the MA Python client to search."""
    mass = _get_mass_client(hass)
    if mass is None:
        _LOGGER.warning("No Music Assistant (mass) client available for search")
        return None

    music = getattr(mass, "music", None)
    search_fn = getattr(music, "search", None) if music else getattr(mass, "search", None)
    if search_fn is None:
        _LOGGER.warning("No search() method on MA client (type=%s)", type(mass).__name__)
        return None

    kwarg_variants: list[dict[str, Any]] = [
        {"media_types": None, "limit": limit, "library_only": library_only},
        {"media_types": None, "limit": limit},
        {"limit": limit, "library_only": library_only},
        {"limit": limit},
        {},
    ]
    for kwargs in kwarg_variants:
        try:
            results = await search_fn(query, **kwargs)
            return _serialize_search_results(results)
        except TypeError:
            continue
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("MA client search(%r) failed: %s", query, err)
            return None

    return None


def _merge_search_results(primary: dict, secondary: dict) -> dict:
    """Merge two search result dicts, deduplicating by item id."""
    merged: dict[str, list] = {}
    for key in ("tracks", "artists", "albums", "playlists"):
        items = list(primary.get(key) or [])
        seen = {_item_dedup_key(i) for i in items}
        for item in secondary.get(key) or []:
            k = _item_dedup_key(item)
            if k not in seen:
                seen.add(k)
                items.append(item)
        merged[key] = items
    return merged


def _item_dedup_key(item: dict) -> str:
    """Return a dedup key for a search result item."""
    uri = item.get("uri") or item.get("item_id") or item.get("media_content_id") or ""
    name = item.get("name") or item.get("title") or ""
    return f"{uri}|{name}".lower()



# ── Library ───────────────────────────────────────────────────────────────────

def _normalize_library_item(item: dict) -> dict:
    """Map MA Python client fields to the browse_media-compatible fields the card expects."""
    title = item.get("name") or item.get("title") or ""
    uri = item.get("uri") or item.get("media_content_id") or ""

    media_type = item.get("media_type", "")
    if isinstance(media_type, dict):
        media_type = media_type.get("value", "")

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

    album_type = item.get("album_type", "album")
    if isinstance(album_type, dict):
        album_type = album_type.get("value", "album")

    track_number = item.get("track_number") or item.get("position") or 0
    duration = item.get("duration") or 0

    provider_mappings = item.get("provider_mappings") or []
    providers: set[str] = set()
    provider_instances: set[str] = set()
    for m in provider_mappings:
        if isinstance(m, dict):
            dom = m.get("provider_domain", "")
            inst = (
                m.get("provider_instance_id_or_domain")
                or m.get("provider_instance")
                or m.get("provider_instance_id")
                or dom
            )
            if dom:
                providers.add(dom)
            if inst:
                provider_instances.add(inst)
        elif isinstance(m, str):
            provider_instances.add(m)
        else:
            dom = str(getattr(m, "provider_domain", "") or "")
            inst = str(
                getattr(m, "provider_instance", "")
                or getattr(m, "provider_instance_id_or_domain", "")
                or dom
            )
            if dom:
                providers.add(dom)
            if inst:
                provider_instances.add(inst)
    provider_instances.discard("")
    provider_instances.discard("builtin")
    providers.discard("")
    providers.discard("builtin")
    return {
        "title": title,
        "media_content_id": uri,
        "media_content_type": media_type,
        "thumbnail": thumbnail,
        "media_artist": artist,
        "album_type": str(album_type).lower() if album_type else "album",
        "track_number": int(track_number) if track_number else 0,
        "duration": float(duration) if duration else 0,
        "providers": sorted(providers),
        "provider_instances": sorted(provider_instances),
    }


_LIBRARY_METHODS: dict[str, list[str]] = {
    "artists":   ["get_library_artists", "get_artists"],
    "albums":    ["get_library_albums",  "get_albums"],
    "tracks":    ["get_library_tracks",  "get_tracks"],
    "playlists": ["get_library_playlists", "get_playlists"],
    "radios":    ["get_library_radios",  "get_radios"],
}


async def _get_library_via_ma_client(
    hass: HomeAssistant,
    media_type: str,
    limit: int,
    favorite: bool,
    offset: int = 0,
    provider_instance: str | None = None,
) -> list | None:
    """Fetch library items via the MA Python client."""
    mass = _get_mass_client(hass)
    if mass is None:
        _LOGGER.warning("No Music Assistant (mass) client available for library")
        return None

    music = getattr(mass, "music", None)
    if music is None:
        _LOGGER.warning("mass.music module not available")
        return None

    fn = None
    for name in _LIBRARY_METHODS.get(media_type, []):
        fn = getattr(music, name, None)
        if fn is not None:
            _LOGGER.debug("Using MA client method: music.%s()", name)
            break

    if fn is None:
        _LOGGER.warning("No library method found for type=%s on %s", media_type, type(music).__name__)
        return None

    kwargs_variants: list[dict] = []
    if provider_instance:
        for pkey in ("provider_instance_id_or_domain", "provider", "provider_instance"):
            kwargs_variants.append({"favorite": favorite, "limit": limit, "offset": offset, pkey: provider_instance})
    kwargs_variants += [
        {"favorite": favorite, "limit": limit, "offset": offset},
        {"favorite": favorite, "limit": limit},
        {"limit": limit},
        {},
    ]

    for kwargs in kwargs_variants:
        try:
            result = await fn(**kwargs)
            items = list(result) if not isinstance(result, list) else result
            _LOGGER.debug("Library %s: %d items", media_type, len(items))
            normalized = [_normalize_library_item(_to_json_safe(i)) for i in items[:limit]]
            return normalized
        except TypeError:
            continue
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Library fetch for %s failed: %s", media_type, err)
            break

    return None


# ── Recommendations ──────────────────────────────────────────────────────────

def _normalize_recommendation_item(item: dict) -> dict:
    """Normalize a single item from a MA recommendation folder."""
    media_type = item.get("media_type", "")
    if isinstance(media_type, dict):
        media_type = media_type.get("value", "")
    media_type = str(media_type).lower() if media_type else ""

    if media_type in ("track", "album", "artist", "playlist", "radio"):
        return _normalize_library_item(item)
    return _normalize_browse_item(item)


async def _get_recommendations_via_ma_client(
    hass: HomeAssistant,
) -> list[dict] | None:
    """Fetch recommendations via the MA Python client."""
    mass = _get_mass_client(hass)
    if mass is None:
        _LOGGER.warning("No Music Assistant (mass) client available for recommendations")
        return None

    music = getattr(mass, "music", None)
    if music is None:
        _LOGGER.warning("mass.music module not available for recommendations")
        return None

    rec_fn = None
    for name in ("recommendations", "get_recommendations"):
        fn = getattr(music, name, None)
        if fn is not None and callable(fn):
            rec_fn = fn
            _LOGGER.debug("Using MA recommendations method: music.%s()", name)
            break

    if rec_fn is None:
        _LOGGER.warning("No recommendations() method on music module (%s)", type(music).__name__)
        return None

    for kwargs in [{}, {"limit": 50}]:
        try:
            result = await asyncio.wait_for(rec_fn(**kwargs), timeout=10)
            folders = list(result) if not isinstance(result, list) else result
            _LOGGER.debug("Recommendations: %d folders", len(folders))
            normalized: list[dict] = []
            for folder in folders:
                f = _to_json_safe(folder)
                folder_domain = str(f.get("provider_domain") or f.get("provider", "") or "")
                folder_instance = str(
                    f.get("provider_instance_id_or_domain")
                    or f.get("provider_instance")
                    or f.get("provider_instance_id")
                    or folder_domain
                )
                is_library_folder = folder_domain in ("library", "builtin", "")
                items_raw = f.get("items") or []
                items_norm = []
                for i in items_raw:
                    i_safe = _to_json_safe(i)
                    if is_library_folder:
                        pm = i_safe.get("provider_mappings") or []
                        if pm:
                            i_safe["provider_mappings"] = [
                                m for m in pm
                                if (m.get("in_library") is True if isinstance(m, dict) else getattr(m, "in_library", True))
                            ] or pm
                    item = _normalize_recommendation_item(i_safe)
                    if not is_library_folder:
                        if folder_instance and not item.get("provider_instances"):
                            item["provider_instances"] = [folder_instance]
                        if folder_domain and not item.get("providers"):
                            item["providers"] = [folder_domain]
                    items_norm.append(item)
                normalized.append({
                    "folder_id": f.get("item_id") or f.get("path") or "",
                    "name": f.get("name") or f.get("label") or "",
                    "icon": f.get("icon") or "",
                    "provider_domain": folder_domain,
                    "provider_instance": folder_instance,
                    "items": items_norm,
                })
            return normalized
        except asyncio.TimeoutError:
            _LOGGER.warning("Recommendations fetch timed out")
            return None
        except TypeError:
            continue
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Recommendations fetch failed: %s", err)
            return None

    return None


async def _enrich_radios_from_recommendations(
    hass: HomeAssistant,
    library_radios: list[dict],
) -> list[dict]:
    """Merge provider radios from recommendations into library radios."""
    try:
        folders = await asyncio.wait_for(
            _get_recommendations_via_ma_client(hass), timeout=10,
        )
        if not folders:
            return library_radios

        existing_ids = {r.get("media_content_id") for r in library_radios if r.get("media_content_id")}
        extra: list[dict] = []
        for folder in folders:
            for item in folder.get("items", []):
                mtype = (item.get("media_content_type") or "").lower()
                mid = item.get("media_content_id") or item.get("uri") or ""
                if mtype == "radio" and mid and mid not in existing_ids:
                    existing_ids.add(mid)
                    extra.append(item)
        if extra:
            _LOGGER.debug("Enriched radios: %d provider radios added", len(extra))
        return library_radios + extra
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("Radio enrichment failed (non-critical): %s", err)
        return library_radios


# ── Browse ────────────────────────────────────────────────────────────────────

def _normalize_browse_item(item: dict) -> dict:
    """Normalise a MA browse result item (BrowseFolder or MediaItem) for the card."""
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
    """Browse a MA path via the MA Python client."""
    mass = _get_mass_client(hass)
    if mass is None:
        return None

    music = getattr(mass, "music", None)

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
        return None

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
                for n in normalized:
                    if _is_ma_back_item(n):
                        n["is_back"] = True
                return normalized[:limit]
            except TypeError:
                continue
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("%s(%r) failed: %s", fn_name, uri, err)
                break

    return None


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
    parts = [p for p in rest.split("/") if p]
    item_id = parts[-1] if parts else rest
    return item_id, scheme


async def _get_subitems(
    hass: HomeAssistant,
    action: str,
    uri: str,
    limit: int = 50,
) -> list | None:
    """Fetch sub-items of a MA library item via the MA Python client."""
    mass = _get_mass_client(hass)
    if mass is None:
        _LOGGER.warning("No Music Assistant (mass) client available for subitems")
        return None

    music = getattr(mass, "music", None)
    if not music:
        return None

    methods = _SUBITEM_METHODS.get(action, [])
    if not methods:
        return None

    item_id, provider = _parse_ma_uri(uri)
    _LOGGER.info("Subitems %s: uri=%r → item_id=%r provider=%r", action, uri, item_id, provider)

    for method_name in methods:
        fn = getattr(music, method_name, None)
        if not fn:
            _LOGGER.warning("Subitems: method %r not found on music module", method_name)
            continue

        attempts = [
            ((item_id, provider), {}),
            ((), {"item_id": item_id, "provider_instance_id_or_domain": provider}),
            ((uri,), {}),
            ((item_id,), {}),
            ((), {"item_id": item_id}),
        ]
        for call_args, call_kwargs in attempts:
            try:
                result = await fn(*call_args, **call_kwargs)
                items = list(result) if not isinstance(result, list) else result
                _LOGGER.info("Subitems %s: %d items (args=%s kwargs=%s)", action, len(items), call_args, call_kwargs)
                return [_normalize_library_item(_to_json_safe(i)) for i in items[:limit]]
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("Subitems %s args=%s kwargs=%s → %s: %s", method_name, call_args, call_kwargs, type(err).__name__, err)
                continue

    return None


# ── Providers ─────────────────────────────────────────────────────────────────

async def _get_providers_via_ma_client(hass: HomeAssistant) -> list | None:
    """Return available MA providers (domain + name) via the MA Python client.

    mass.providers returns list[ProviderInstance] in music_assistant_client.
    We access attributes directly to avoid _to_json_safe conversion issues
    (e.g. StrEnum not being a dataclass in certain model versions).
    """
    mass = _get_mass_client(hass)
    if mass is None:
        return None

    try:
        raw = getattr(mass, "providers", None)
        if raw is None:
            _LOGGER.debug("mass.providers is None — MA provider list unavailable")
            return None

        # mass.providers is list[ProviderInstance]; guard against dict-like wrappers too
        items: Any = raw.values() if (isinstance(raw, dict) or hasattr(raw, "items")) else raw

        seen: set[str] = set()
        result = []
        for p in items:
            try:
                # Access attributes directly — avoids _to_json_safe conversion issues
                provider_type = str(getattr(p, "type", "") or "").lower()
                if provider_type and provider_type != "music":
                    continue
                domain = str(getattr(p, "domain", "") or "")
                if domain == "builtin":
                    continue
                instance_id = str(getattr(p, "instance_id", "") or domain)
                name = str(getattr(p, "name", "") or domain)
                available = bool(getattr(p, "available", True))
                if not instance_id or instance_id in seen:
                    continue
                seen.add(instance_id)
                _LOGGER.debug("MA provider: instance_id=%r domain=%r name=%r available=%s", instance_id, domain, name, available)
                result.append({
                    "domain": domain,
                    "instance_id": instance_id,
                    "name": name,
                    "available": available,
                })
            except Exception as item_err:  # noqa: BLE001
                _LOGGER.debug("Skipping MA provider item: %s", item_err)
                continue

        _LOGGER.debug(
            "MA providers: %d total, %d available",
            len(result), sum(1 for r in result if r["available"]),
        )
        return [r for r in result if r["available"]]
    except Exception as err:  # noqa: BLE001
        _LOGGER.warning("Failed to get MA providers: %s", err)
        return None


# ── MA queue helpers ──────────────────────────────────────────────────────────

def _resolve_ma_player_id(hass: HomeAssistant, entity_id: str) -> str | None:
    """Map a HA media_player entity_id to its Music Assistant player_id.

    The MA HA integration sets each entity's unique_id to the MA player_id.
    """
    from homeassistant.helpers import entity_registry as er  # noqa: PLC0415

    ent_reg = er.async_get(hass)
    entry = ent_reg.async_get(entity_id)
    if entry is None:
        return None
    return entry.unique_id or None


async def _resolve_queue_id(hass: HomeAssistant, entity_id: str) -> tuple[Any | None, str | None]:
    """Return (mass_client, queue_id) for a HA media_player entity."""
    mass = _get_mass_client(hass)
    if mass is None:
        return None, None

    ma_player_id = _resolve_ma_player_id(hass, entity_id)
    if not ma_player_id:
        return mass, None

    queue_id = ma_player_id
    player_queues = getattr(mass, "player_queues", None)
    if player_queues is not None:
        get_active = getattr(player_queues, "get_active_queue", None)
        if get_active is not None:
            try:
                q = get_active(ma_player_id)
                if asyncio.iscoroutine(q):
                    q = await q
                if q is not None:
                    queue_id = getattr(q, "queue_id", None) or ma_player_id
                    return mass, queue_id
            except Exception:  # noqa: BLE001
                pass

    players = getattr(mass, "players", None)
    if players is not None:
        try:
            player = players.get(ma_player_id) if hasattr(players, "get") else None
            if player is not None:
                queue_id = (
                    getattr(player, "active_source", None)
                    or getattr(player, "active_queue", None)
                    or getattr(player, "queue_id", None)
                    or ma_player_id
                )
        except Exception:  # noqa: BLE001
            pass

    return mass, queue_id


def _normalize_queue_item(item: dict) -> dict:
    """Normalize a MA QueueItem dict for the frontend."""
    name = item.get("name") or ""
    queue_item_id = item.get("queue_item_id") or ""
    duration = item.get("duration") or 0

    thumbnail = ""
    image = item.get("image") or {}
    if isinstance(image, dict):
        thumbnail = image.get("path") or image.get("url") or ""
    if not thumbnail:
        media_item = item.get("media_item") or {}
        metadata = media_item.get("metadata") or {}
        images = metadata.get("images") or []
        for img in images:
            path = img.get("path", "") if isinstance(img, dict) else ""
            if path and path.startswith("http"):
                thumbnail = path
                break

    media_item = item.get("media_item") or {}
    uri = media_item.get("uri") or ""
    artist = ""
    artists = media_item.get("artists") or []
    if artists and isinstance(artists[0], dict):
        artist = artists[0].get("name", "")

    media_type = media_item.get("media_type", "track")
    if isinstance(media_type, dict):
        media_type = media_type.get("value", "track")

    return {
        "queue_item_id": queue_item_id,
        "title": name or media_item.get("name", ""),
        "media_content_id": uri,
        "media_content_type": str(media_type),
        "media_artist": artist,
        "duration": float(duration) if duration else 0,
        "thumbnail": thumbnail,
    }


async def _queue_jump_via_ma_client(
    hass: HomeAssistant, entity_id: str, index: int,
) -> bool:
    """Ask MA to jump to ``index`` within the player's existing queue."""
    mass, queue_id = await _resolve_queue_id(hass, entity_id)
    if mass is None or queue_id is None:
        _LOGGER.warning("queue_jump: cannot resolve queue for %s", entity_id)
        return False

    player_queues = getattr(mass, "player_queues", None)
    play_index_fn = getattr(player_queues, "play_index", None) if player_queues else None
    if play_index_fn is None:
        _LOGGER.warning("queue_jump: mass.player_queues.play_index not available")
        return False

    try:
        await play_index_fn(queue_id, index)
        _LOGGER.debug("queue_jump: queue=%s index=%d ok", queue_id, index)
        return True
    except Exception as err:  # noqa: BLE001
        _LOGGER.warning("queue_jump: play_index(%s, %d) failed: %s", queue_id, index, err)
        return False


# ── HA Views ──────────────────────────────────────────────────────────────────

class MusicAssistantSearchView(HomeAssistantView):
    """Proxy search requests to Music Assistant.

    GET /my_music_library/search?query=<q>&limit=<n>&library_only=true
    """

    url = "/my_music_library/search"
    name = "my_music_library:search"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Handle search request."""
        hass: HomeAssistant = request.app["hass"]

        query = request.query.get("query", "").strip()
        if not query:
            return self.json_message("Missing 'query' parameter.", HTTPStatus.BAD_REQUEST)

        limit = min(int(request.query.get("limit", 25)), 100)
        library_only = request.query.get("library_only", "").lower() in ("1", "true", "yes")
        _LOGGER.info("Search request: query=%r limit=%d library_only=%s", query, limit, library_only)

        # 1 — MA integration client (primary: authenticated, typed, no duplicate connection)
        result = await _search_via_ma_client(hass, query, limit, library_only=library_only)
        if result is not None:
            return web.json_response(result)

        # 2 — Direct REST call to MA (fallback)
        ma_url = _get_mass_url(hass)
        if ma_url:
            _LOGGER.info("MA client unavailable, trying REST at %s", ma_url)
            result = await _search_via_rest(hass, ma_url, query, limit, library_only=library_only)
            if result is not None:
                return web.json_response(result)

        _LOGGER.error("Both MA search strategies failed for query=%r", query)
        return self.json_message(
            "Could not search Music Assistant. Check HA logs (filter: my_music_library).",
            HTTPStatus.BAD_GATEWAY,
        )


class MusicAssistantLibraryView(HomeAssistantView):
    """Return library items from Music Assistant.

    GET /my_music_library/library?type=artists|albums|tracks|playlists&limit=25&favorite=true
    """

    url = "/my_music_library/library"
    name = "my_music_library:library"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Handle library request."""
        hass: HomeAssistant = request.app["hass"]

        media_type = request.query.get("type", "").strip()
        if media_type not in ("artists", "albums", "tracks", "playlists", "radios"):
            return self.json_message("Invalid 'type' parameter.", HTTPStatus.BAD_REQUEST)

        limit = min(int(request.query.get("limit", 25)), 100)
        favorite = request.query.get("favorite", "true").lower() != "false"
        offset = max(0, int(request.query.get("offset", 0)))
        provider_instance = request.query.get("provider", "").strip() or None

        _LOGGER.info("Library request: type=%s limit=%d offset=%d favorite=%s provider=%s", media_type, limit, offset, favorite, provider_instance)

        items = await _get_library_via_ma_client(hass, media_type, limit, favorite, offset, provider_instance)
        if items is None:
            _LOGGER.error("Library fetch failed for type=%s", media_type)
            return self.json_message(
                "Could not get library from Music Assistant. Check HA logs (filter: my_music_library).",
                HTTPStatus.BAD_GATEWAY,
            )

        if media_type == "radios" and offset == 0:
            items = await _enrich_radios_from_recommendations(hass, items)

        return web.json_response({"type": media_type, "items": items})


class MusicAssistantBrowseView(HomeAssistantView):
    """Browse the MA filesystem tree.

    GET /my_music_library/browse?uri=<uri>
        uri is optional — omit for root.
    """

    url = "/my_music_library/browse"
    name = "my_music_library:browse"
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


class MusicAssistantRecommendationsView(HomeAssistantView):
    """Return recommendation folders from Music Assistant.

    GET /my_music_library/recommendations
        → {"folders": [{folder_id, name, icon, items: [...]}]}
    """

    url = "/my_music_library/recommendations"
    name = "my_music_library:recommendations"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Handle recommendations request."""
        hass: HomeAssistant = request.app["hass"]
        folders = await _get_recommendations_via_ma_client(hass)
        if folders is None:
            return self.json_message(
                "Could not get recommendations from Music Assistant. Check HA logs.",
                HTTPStatus.BAD_GATEWAY,
            )
        return web.json_response({"folders": folders})


class MusicAssistantSubitemsView(HomeAssistantView):
    """Return sub-items of a MA library item.

    GET /my_music_library/subitems?action=artist_albums|album_tracks|playlist_tracks&uri=<uri>
    """

    url = "/my_music_library/subitems"
    name = "my_music_library:subitems"
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


class MusicAssistantProvidersView(HomeAssistantView):
    """Return the list of available Music Assistant providers.

    GET /my_music_library/providers
    """

    url = "/my_music_library/providers"
    name = "my_music_library:providers"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Handle providers request."""
        hass: HomeAssistant = request.app["hass"]
        providers = await _get_providers_via_ma_client(hass)
        return web.json_response({"providers": providers or []})


class PlayerQueueView(HomeAssistantView):
    """Per-player queue storage — accessible from any browser/device.

    GET  /my_music_library/queue?player=<entity_id>
         → {"queue": [...], "source": "<uri or null>"}

    POST /my_music_library/queue
         body: {"player": "<entity_id>", "queue": [...], "source": "<uri or null>"}
         → {"ok": true}
    """

    url = "/my_music_library/queue"
    name = "my_music_library:queue"
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

    GET  /my_music_library/groups?player=<entity_id>
         → {"player": "<entity_id>", "members": [...]}

    POST /my_music_library/groups
         body: {"player": "<entity_id>", "members": [...]}
         → {"ok": true}
    """

    url = "/my_music_library/groups"
    name = "my_music_library:groups"
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


class MAQueueView(HomeAssistantView):
    """Proxy to Music Assistant's native player queue.

    GET  /my_music_library/ma_queue?player=<entity_id>&limit=50&offset=0
         → {"items": [...], "queue_id": "..."}

    POST /my_music_library/ma_queue
         body: {"player": "<entity_id>", "action": "delete_item", "item_id": "..."}
         → {"ok": true}
    """

    url = "/my_music_library/ma_queue"
    name = "my_music_library:ma_queue"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Return the MA queue items for a player."""
        hass: HomeAssistant = request.app["hass"]
        player = request.query.get("player", "").strip()
        if not player:
            return self.json_message("Missing 'player' parameter.", HTTPStatus.BAD_REQUEST)

        mass, queue_id = await _resolve_queue_id(hass, player)
        if mass is None or queue_id is None:
            _LOGGER.warning("ma_queue GET: cannot resolve queue for %s", player)
            return self.json_message(
                "Cannot resolve MA queue. Check HA logs.", HTTPStatus.BAD_GATEWAY,
            )

        player_queues = getattr(mass, "player_queues", None)
        get_items_fn = getattr(player_queues, "get_queue_items", None) if player_queues else None
        if get_items_fn is None:
            _LOGGER.warning("ma_queue GET: get_queue_items not available")
            return self.json_message("get_queue_items not available.", HTTPStatus.BAD_GATEWAY)

        limit = min(int(request.query.get("limit", 50)), 500)
        offset = max(0, int(request.query.get("offset", 0)))

        try:
            items = await get_items_fn(queue_id, limit=limit, offset=offset)
            normalized = [_normalize_queue_item(_to_json_safe(i)) for i in items]
            _LOGGER.debug("ma_queue GET: queue=%s → %d items", queue_id, len(normalized))
            return web.json_response({"items": normalized, "queue_id": queue_id})
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("ma_queue GET failed: %s", err)
            return self.json_message(
                f"Failed to get queue items: {err}", HTTPStatus.BAD_GATEWAY,
            )

    async def post(self, request: web.Request) -> web.Response:
        """Execute a queue action (delete_item)."""
        hass: HomeAssistant = request.app["hass"]
        try:
            body: dict = await request.json()
        except Exception:  # noqa: BLE001
            return self.json_message("Invalid JSON body.", HTTPStatus.BAD_REQUEST)

        player = (body.get("player") or "").strip()
        action = (body.get("action") or "").strip()
        if not player or not action:
            return self.json_message("Missing 'player' or 'action'.", HTTPStatus.BAD_REQUEST)

        mass, queue_id = await _resolve_queue_id(hass, player)
        if mass is None or queue_id is None:
            return self.json_message("Cannot resolve MA queue.", HTTPStatus.BAD_GATEWAY)

        player_queues = getattr(mass, "player_queues", None)
        if player_queues is None:
            return self.json_message("player_queues not available.", HTTPStatus.BAD_GATEWAY)

        if action == "delete_item":
            item_id = body.get("item_id")
            if item_id is None:
                return self.json_message("Missing 'item_id'.", HTTPStatus.BAD_REQUEST)
            fn = getattr(player_queues, "delete_item", None)
            if fn is None:
                return self.json_message("delete_item not available.", HTTPStatus.BAD_GATEWAY)
            try:
                await fn(queue_id, item_id)
                return web.json_response({"ok": True})
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("ma_queue delete_item failed: %s", err)
                return self.json_message(f"delete_item failed: {err}", HTTPStatus.BAD_GATEWAY)

        if action == "clear":
            fn = getattr(player_queues, "clear", None)
            if fn is None:
                return self.json_message("clear not available.", HTTPStatus.BAD_GATEWAY)
            try:
                await fn(queue_id)
                return web.json_response({"ok": True})
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("ma_queue clear failed: %s", err)
                return self.json_message(f"clear failed: {err}", HTTPStatus.BAD_GATEWAY)

        return self.json_message(f"Unknown action: {action}", HTTPStatus.BAD_REQUEST)


class PlayerQueueJumpView(HomeAssistantView):
    """Jump to a specific index in the player's existing MA queue.

    POST /my_music_library/queue_jump
        body: {"player": "<entity_id>", "index": <int>}
        → {"ok": true} on success, 502 otherwise
    """

    url = "/my_music_library/queue_jump"
    name = "my_music_library:queue_jump"
    requires_auth = True

    async def post(self, request: web.Request) -> web.Response:
        """Handle queue jump request."""
        hass: HomeAssistant = request.app["hass"]
        try:
            body: dict = await request.json()
        except Exception:  # noqa: BLE001
            return self.json_message("Invalid JSON body.", HTTPStatus.BAD_REQUEST)

        player = (body.get("player") or "").strip()
        try:
            index = int(body.get("index"))
        except (TypeError, ValueError):
            return self.json_message("Missing or invalid 'index'.", HTTPStatus.BAD_REQUEST)
        if not player or index < 0:
            return self.json_message("Missing 'player' or invalid 'index'.", HTTPStatus.BAD_REQUEST)

        ok = await _queue_jump_via_ma_client(hass, player, index)
        if not ok:
            return self.json_message(
                "Queue jump failed. Check HA logs (filter: my_music_library).",
                HTTPStatus.BAD_GATEWAY,
            )
        return web.json_response({"ok": True})


class ImageProxyView(HomeAssistantView):
    """Proxy an image URL through HA to avoid mixed-content / CORS issues.

    GET /my_music_library/image_proxy?url=<encoded_url>
        → binary image response
    """

    url = "/my_music_library/image_proxy"
    name = "my_music_library:image_proxy"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        """Fetch an image URL server-side and return it."""
        hass: HomeAssistant = request.app["hass"]
        image_url = request.query.get("url", "").strip()
        if not image_url or not image_url.startswith("http"):
            return web.Response(status=HTTPStatus.BAD_REQUEST)

        session = async_get_clientsession(hass)
        try:
            async with session.get(
                image_url,
                timeout=aiohttp.ClientTimeout(total=10),
            ) as resp:
                if resp.status != 200:
                    return web.Response(status=resp.status)
                body = await resp.read()
                return web.Response(
                    body=body,
                    content_type=resp.content_type or "image/jpeg",
                    headers={"Cache-Control": "public, max-age=300"},
                )
        except Exception:  # noqa: BLE001
            return web.Response(status=HTTPStatus.BAD_GATEWAY)
