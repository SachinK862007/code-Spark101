"""URJA FastAPI application."""

from __future__ import annotations

import logging
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app import __version__
from app.api.routes import (
    ask,
    circularity,
    data_sources,
    energy,
    environment,
    finance,
    forecasting,
    jobs,
    maps,
    rpo,
    services,
    solar,
    voice,
    weather,
)
from app.core.config import settings
from app.core.logging_config import configure_logging
from app.database.init_db import init_db
from app.database.session import engine
from app.schemas.common import HealthResponse
from app.services.exceptions import ServiceError

configure_logging()
logger = logging.getLogger(__name__)

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    logger.info(
        "URJA API starting (env=%s, origins=%s)",
        settings.app_env,
        ", ".join(settings.frontend_origins),
    )
    logger.info(
        "Integrations — google_search=%s weather=%s voice=%s",
        settings.google_search_configured,
        settings.weather_configured,
        settings.voice_configured,
    )
    yield
    logger.info("URJA API shutting down")


app = FastAPI(
    title="URJA — India Green Grid API",
    version=__version__,
    description=(
        "Backend for URJA: sourced information retrieval, energy calculations, "
        "RPO compliance, solar ROI, weather and forecasting.\n\n"
        "All API keys stay server-side. Endpoints that depend on an unconfigured "
        "provider return HTTP 503 with a `code` explaining what to configure."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.frontend_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "X-Session-Id"],
    max_age=600,
)


# ----------------------------------------------------------------- middleware


@app.middleware("http")
async def request_guard(request: Request, call_next):
    request_id = str(uuid.uuid4())
    started = time.perf_counter()

    content_length = request.headers.get("content-length")
    if content_length and content_length.isdigit():
        if int(content_length) > settings.max_request_bytes:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={
                    "detail": {
                        "code": "request_too_large",
                        "message": (
                            f"Request body exceeds {settings.max_request_bytes // (1024 * 1024)} MB."
                        ),
                    }
                },
            )

    response = await call_next(request)
    response.headers["X-Request-Id"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    elapsed_ms = (time.perf_counter() - started) * 1000
    logger.info(
        "%s %s -> %s (%.1f ms, id=%s)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
        request_id[:8],
    )
    return response


# ------------------------------------------------------------ error handlers


@app.exception_handler(ServiceError)
async def service_error_handler(_: Request, exc: ServiceError) -> JSONResponse:
    logger.warning("Service error [%s]: %s", exc.code, exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    _: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": {
                "code": "validation_error",
                "message": "The request contains invalid values.",
                "details": {"errors": exc.errors()},
            }
        },
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(_: Request, exc: Exception) -> JSONResponse:
    # Never leak a stack trace to the client; log it server-side instead.
    logger.exception("Unhandled error: %s", type(exc).__name__)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": {
                "code": "internal_error",
                "message": "Something went wrong on the server. Please retry.",
            }
        },
    )


# --------------------------------------------------------------------- routes


@app.get(
    f"{API_PREFIX}/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Service health and integration readiness",
)
def health() -> HealthResponse:
    database_status = "ok"
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:  # pragma: no cover - depends on filesystem
        database_status = "unavailable"

    return HealthResponse(
        status="ok" if database_status == "ok" else "degraded",
        version=__version__,
        environment=settings.app_env,
        database=database_status,
        integrations={
            "google_search": settings.google_search_configured,
            "weather": settings.weather_configured,
            "voice": settings.voice_configured,
        },
        time=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/", include_in_schema=False)
def root() -> dict:
    return {
        "name": "URJA — India Green Grid API",
        "version": __version__,
        "docs": "/docs",
        "health": f"{API_PREFIX}/health",
    }


for module in (
    ask,
    energy,
    rpo,
    solar,
    weather,
    maps,
    voice,
    services,
    jobs,
    finance,
    circularity,
    environment,
    forecasting,
    data_sources,
):
    app.include_router(module.router, prefix=API_PREFIX)
