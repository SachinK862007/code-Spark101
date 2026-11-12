"""Read-only loaders for the bundled reference datasets."""

from __future__ import annotations

import json
from functools import lru_cache
from typing import Any

from app.core.config import DATA_DIR


@lru_cache(maxsize=32)
def _read(filename: str) -> dict[str, Any]:
    path = DATA_DIR / filename
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_dataset(filename: str) -> dict[str, Any]:
    """Return a copy-free, cached dataset dictionary.

    Callers must treat the result as read-only; the loader is intentionally
    shared so repeated requests do not re-read files from disk.
    """
    return _read(filename)


def clear_dataset_cache() -> None:
    """Test helper for reloading edited datasets."""
    _read.cache_clear()
