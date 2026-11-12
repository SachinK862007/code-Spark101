"""Application settings.

Every secret is read from the environment (populated from ``backend/.env`` for
local development). Nothing here is ever exposed through an API response.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
APP_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = APP_DIR / "data"

# Load backend/.env once, without overriding variables already set by the shell.
load_dotenv(BACKEND_DIR / ".env", override=False)


def _env(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def _int_env(name: str, default: int) -> int:
    try:
        return int(_env(name, str(default)))
    except ValueError:
        return default


def _float_env(name: str, default: float) -> float:
    try:
        return float(_env(name, str(default)))
    except ValueError:
        return default


def _origins(raw: str) -> tuple[str, ...]:
    items = [part.strip().rstrip("/") for part in raw.split(",") if part.strip()]
    return tuple(items)


@dataclass(frozen=True)
class Settings:
    app_env: str
    app_host: str
    app_port: int
    database_url: str
    frontend_origins: tuple[str, ...]
    google_search_api_key: str
    google_search_engine_id: str
    google_application_credentials: str
    openweather_api_key: str
    log_level: str
    max_request_bytes: int
    rate_limit_per_minute: int
    ask_cache_ttl_seconds: int
    search_cache_ttl_seconds: int
    weather_cache_ttl_seconds: int
    request_timeout_seconds: float
    max_ask_history: int

    # -- integration availability -------------------------------------

    @property
    def google_search_configured(self) -> bool:
        return bool(self.google_search_api_key and self.google_search_engine_id)

    @property
    def weather_configured(self) -> bool:
        return bool(self.openweather_api_key)

    @property
    def voice_configured(self) -> bool:
        if self.google_application_credentials:
            return Path(self.google_application_credentials).is_file()
        # Application Default Credentials (e.g. GOOGLE_APPLICATION_CREDENTIALS
        # exported by the shell, or `gcloud auth application-default login`).
        return bool(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

    def secret_values(self) -> tuple[str, ...]:
        """Values that must never appear in logs."""
        return tuple(
            value
            for value in (
                self.google_search_api_key,
                self.google_search_engine_id,
                self.openweather_api_key,
            )
            if value
        )


settings = Settings(
    app_env=_env("APP_ENV", "development"),
    app_host=_env("APP_HOST", "127.0.0.1"),
    app_port=_int_env("APP_PORT", 8000),
    database_url=_env("DATABASE_URL", "sqlite:///./urja.db"),
    frontend_origins=_origins(
        _env(
            "FRONTEND_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        )
    ),
    google_search_api_key=_env("GOOGLE_SEARCH_API_KEY"),
    google_search_engine_id=_env("GOOGLE_SEARCH_ENGINE_ID"),
    google_application_credentials=_env("GOOGLE_APPLICATION_CREDENTIALS"),
    openweather_api_key=_env("OPENWEATHER_API_KEY"),
    log_level=_env("LOG_LEVEL", "INFO").upper(),
    max_request_bytes=_int_env("MAX_REQUEST_BYTES", 8 * 1024 * 1024),
    rate_limit_per_minute=_int_env("RATE_LIMIT_PER_MINUTE", 60),
    ask_cache_ttl_seconds=_int_env("ASK_CACHE_TTL_SECONDS", 3600),
    search_cache_ttl_seconds=_int_env("SEARCH_CACHE_TTL_SECONDS", 3600),
    weather_cache_ttl_seconds=_int_env("WEATHER_CACHE_TTL_SECONDS", 600),
    request_timeout_seconds=_float_env("REQUEST_TIMEOUT_SECONDS", 12.0),
    max_ask_history=_int_env("MAX_ASK_HISTORY", 50),
)
