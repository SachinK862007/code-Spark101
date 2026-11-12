"""Request safety helpers: a small in-process rate limiter.

The limiter is deliberately simple (and process-local) so the app has no extra
infrastructure dependency for local deployment. Keys are rate limited per client
IP *and* per scope, so one expensive integration cannot be hammered.
"""

from __future__ import annotations

import time
from collections import deque
from threading import Lock

from fastapi import HTTPException, Request, status

from app.core.config import settings

_WINDOW_SECONDS = 60.0


class RateLimiter:
    def __init__(self, default_limit: int) -> None:
        self._default_limit = default_limit
        self._hits: dict[str, deque[float]] = {}
        self._lock = Lock()

    @staticmethod
    def _client_key(request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "anonymous"

    def check(self, request: Request, scope: str, limit: int | None = None) -> None:
        max_hits = limit or self._default_limit
        key = f"{scope}:{self._client_key(request)}"
        now = time.monotonic()

        with self._lock:
            bucket = self._hits.setdefault(key, deque())
            while bucket and now - bucket[0] > _WINDOW_SECONDS:
                bucket.popleft()
            if len(bucket) >= max_hits:
                retry_after = max(1, int(_WINDOW_SECONDS - (now - bucket[0])))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "code": "rate_limited",
                        "message": (
                            "Too many requests. Please wait a moment and try again."
                        ),
                        "retry_after_seconds": retry_after,
                    },
                    headers={"Retry-After": str(retry_after)},
                )
            bucket.append(now)


limiter = RateLimiter(settings.rate_limit_per_minute)


def rate_limit(scope: str, limit: int | None = None):
    """FastAPI dependency factory: ``Depends(rate_limit("ask", 20))``."""

    def dependency(request: Request) -> None:
        limiter.check(request, scope=scope, limit=limit)

    return dependency


def reset_rate_limits() -> None:
    """Test helper."""
    with limiter._lock:  # noqa: SLF001 - intentional test hook
        limiter._hits.clear()
