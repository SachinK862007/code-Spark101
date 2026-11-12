"""A tiny thread-safe TTL cache used for public, non-personal API results."""

from __future__ import annotations

import time
from dataclasses import dataclass
from threading import Lock
from typing import Any


@dataclass
class _Entry:
    value: Any
    expires_at: float


class TTLCache:
    def __init__(self, max_entries: int = 256) -> None:
        self._entries: dict[str, _Entry] = {}
        self._lock = Lock()
        self._max_entries = max_entries

    def get(self, key: str) -> Any | None:
        with self._lock:
            entry = self._entries.get(key)
            if entry is None:
                return None
            if entry.expires_at < time.monotonic():
                self._entries.pop(key, None)
                return None
            return entry.value

    def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        with self._lock:
            if len(self._entries) >= self._max_entries:
                # Drop the entry closest to expiry; cheap and good enough here.
                oldest = min(self._entries, key=lambda k: self._entries[k].expires_at)
                self._entries.pop(oldest, None)
            self._entries[key] = _Entry(value, time.monotonic() + ttl_seconds)

    def clear(self) -> None:
        with self._lock:
            self._entries.clear()
