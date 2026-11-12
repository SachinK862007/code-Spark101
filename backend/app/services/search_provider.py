"""Search provider abstraction.

Only the official Google Programmable Search JSON API is used — no scraping of
Google result pages. Swapping providers means implementing ``SearchProvider``
and returning it from ``get_provider``.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Protocol
from urllib.parse import urlparse

import httpx

from app.core.config import settings
from app.services.exceptions import ServiceError

logger = logging.getLogger(__name__)

GOOGLE_ENDPOINT = "https://www.googleapis.com/customsearch/v1"

# Official / institutional domains, highest priority first.
OFFICIAL_DOMAINS: dict[str, int] = {
    "mnre.gov.in": 100,
    "powermin.gov.in": 95,
    "cea.nic.in": 95,
    "beeindia.gov.in": 90,
    "niti.gov.in": 85,
    "grid-india.in": 85,
    "cercind.gov.in": 80,
    "solarrooftop.gov.in": 90,
    "pmkusum.mnre.gov.in": 85,
    "nghm.mnre.gov.in": 80,
    "isea.org.in": 60,
    "cpcb.nic.in": 60,
}


@dataclass
class SearchResult:
    title: str
    url: str
    snippet: str
    source_name: str
    is_official: bool
    priority: int
    published_at: str | None = None
    retrieved_at: str | None = None
    extra: dict = field(default_factory=dict)


class SearchProvider(Protocol):
    name: str

    async def search(self, query: str, *, num: int = 6) -> list[SearchResult]: ...


def domain_priority(url: str) -> tuple[int, bool]:
    host = (urlparse(url).hostname or "").lower()
    for domain, priority in OFFICIAL_DOMAINS.items():
        if host == domain or host.endswith(f".{domain}"):
            return priority, True
    if host.endswith(".gov.in") or host.endswith(".nic.in"):
        return 50, True
    return 10, False


def _source_name(url: str) -> str:
    host = (urlparse(url).hostname or url).replace("www.", "")
    return host


class GoogleProgrammableSearch:
    name = "google_programmable_search"

    def __init__(self, api_key: str, engine_id: str) -> None:
        self._api_key = api_key
        self._engine_id = engine_id

    async def search(self, query: str, *, num: int = 6) -> list[SearchResult]:
        params = {
            "key": self._api_key,
            "cx": self._engine_id,
            "q": query,
            "num": min(max(num, 1), 10),
            "safe": "active",
            "fields": "items(title,link,snippet,pagemap/metatags)",
        }
        try:
            async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
                response = await client.get(GOOGLE_ENDPOINT, params=params)
        except httpx.TimeoutException as error:
            logger.warning("Google search timed out")
            raise ServiceError(
                code="search_timeout",
                message="The search provider did not respond in time. Please retry.",
                status_code=504,
            ) from error
        except httpx.HTTPError as error:
            logger.warning("Google search transport error: %s", type(error).__name__)
            raise ServiceError(
                code="search_unavailable",
                message="The search provider is unreachable. Please retry shortly.",
                status_code=502,
            ) from error

        if response.status_code in (400, 401, 403):
            logger.error("Google search rejected the request (status %s)", response.status_code)
            raise ServiceError(
                code="search_not_configured",
                message=(
                    "Google search rejected the configured credentials. Check "
                    "GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID in backend/.env."
                ),
                status_code=503,
            )
        if response.status_code == 429:
            raise ServiceError(
                code="search_quota_exceeded",
                message=(
                    "The Google search quota for today has been reached. Try again later "
                    "or raise the quota in Google Cloud."
                ),
                status_code=429,
            )
        if response.status_code >= 500:
            raise ServiceError(
                code="search_upstream_error",
                message="The search provider returned an error. Please retry.",
                status_code=502,
            )
        if response.status_code != 200:
            raise ServiceError(
                code="search_failed",
                message=f"Search failed with status {response.status_code}.",
                status_code=502,
            )

        payload = response.json()
        items = payload.get("items") or []
        results: list[SearchResult] = []
        for item in items:
            url = item.get("link", "")
            if not url:
                continue
            priority, official = domain_priority(url)
            results.append(
                SearchResult(
                    title=item.get("title", "").strip() or _source_name(url),
                    url=url,
                    snippet=(item.get("snippet") or "").strip(),
                    source_name=_source_name(url),
                    is_official=official,
                    priority=priority,
                )
            )
        return results


class UnavailableProvider:
    name = "unavailable"

    async def search(self, query: str, *, num: int = 6) -> list[SearchResult]:
        raise ServiceError(
            code="search_not_configured",
            message=(
                "Google search is not configured. Add GOOGLE_SEARCH_API_KEY and "
                "GOOGLE_SEARCH_ENGINE_ID to backend/.env and restart the API."
            ),
            status_code=503,
        )


def get_provider() -> SearchProvider:
    if settings.google_search_configured:
        return GoogleProgrammableSearch(
            settings.google_search_api_key, settings.google_search_engine_id
        )
    return UnavailableProvider()
