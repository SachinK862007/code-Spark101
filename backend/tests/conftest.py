"""Test configuration.

The environment is pinned *before* the application is imported so tests never
depend on a developer's real `.env` and never call a paid external provider.
"""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

TEST_DB = Path(tempfile.gettempdir()) / "urja_test.db"
if TEST_DB.exists():
    TEST_DB.unlink()

os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB.as_posix()}"
os.environ["GOOGLE_SEARCH_API_KEY"] = ""
os.environ["GOOGLE_SEARCH_ENGINE_ID"] = ""
os.environ["OPENWEATHER_API_KEY"] = ""
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""
os.environ["RATE_LIMIT_PER_MINUTE"] = "10000"
os.environ["LOG_LEVEL"] = "WARNING"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.core.security import reset_rate_limits  # noqa: E402
from app.main import app  # noqa: E402
from app.services import google_search_service, openweather_service  # noqa: E402


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def _clear_caches():
    reset_rate_limits()
    google_search_service.clear_cache()
    openweather_service.clear_cache()
    yield
