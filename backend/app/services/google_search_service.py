"""Search orchestration: normalise, rank official sources, cache public results."""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import Any

from app.core.config import settings
from app.services.exceptions import ServiceError
from app.services.search_provider import SearchResult, get_provider
from app.utils.cache import TTLCache

logger = logging.getLogger(__name__)

_cache = TTLCache(max_entries=128)

MAX_QUERY_LENGTH = 400
MIN_QUERY_LENGTH = 2

# Words that add no retrieval value in an Indian energy/public-service context.
_STOPWORDS = {
    "the",
    "a",
    "an",
    "of",
    "for",
    "in",
    "on",
    "is",
    "are",
    "what",
    "which",
    "how",
    "me",
    "my",
    "please",
    "tell",
    "about",
    "current",
    "latest",
    "today",
}

# Expansion hints keep retrieval focused on official sources.
_EXPANSIONS = {
    "rpo": "renewable purchase obligation India MNRE MoP target",
    "subsidy": "subsidy MNRE official guidelines",
    "solar": "solar MNRE India",
    "capacity": "installed capacity CEA India",
}


def normalize_query(raw: str) -> str:
    if raw is None:
        raise ServiceError(
            code="invalid_query",
            message="A question is required.",
            status_code=422,
        )
    cleaned = re.sub(r"\s+", " ", raw).strip()
    if len(cleaned) < MIN_QUERY_LENGTH:
        raise ServiceError(
            code="invalid_query",
            message="Please provide a longer question.",
            status_code=422,
        )
    if len(cleaned) > MAX_QUERY_LENGTH:
        cleaned = cleaned[:MAX_QUERY_LENGTH].rsplit(" ", 1)[0]
    return cleaned


def _search_query(normalized: str) -> str:
    lowered = normalized.lower()
    additions = [hint for key, hint in _EXPANSIONS.items() if key in lowered]
    if additions:
        return f"{normalized} {additions[0]}"
    tokens = [word for word in re.findall(r"[a-z0-9]+", lowered) if word not in _STOPWORDS]
    if tokens and "india" not in tokens and "india" not in lowered:
        return f"{normalized} India"
    return normalized


def _serialize(result: SearchResult, retrieved_at: str) -> dict[str, Any]:
    return {
        "title": result.title,
        "url": result.url,
        "snippet": result.snippet,
        "source_name": result.source_name,
        "is_official": result.is_official,
        "priority": result.priority,
        "published_at": result.published_at,
        "retrieved_at": retrieved_at,
    }


async def search_official(
    query: str, *, limit: int = 6, use_cache: bool = True
) -> tuple[list[dict[str, Any]], str, bool]:
    """Return ranked results, the provider name and whether the cache was used."""
    normalized = normalize_query(query)
    search_query = _search_query(normalized)
    cache_key = f"{search_query}|{limit}"

    if use_cache:
        cached = _cache.get(cache_key)
        if cached is not None:
            return cached["results"], cached["provider"], True

    provider = get_provider()
    results = await provider.search(search_query, num=max(limit, 6))
    retrieved_at = datetime.now(timezone.utc).isoformat()
    ranked = sorted(
        results,
        key=lambda item: (item.priority, len(item.snippet)),
        reverse=True,
    )[:limit]

    payload = [_serialize(item, retrieved_at) for item in ranked]
    if payload:
        _cache.set(
            cache_key,
            {"results": payload, "provider": provider.name},
            settings.search_cache_ttl_seconds,
        )
    return payload, provider.name, False


def clear_cache() -> None:
    _cache.clear()
