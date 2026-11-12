"""Weather endpoints (OpenWeatherMap, server-side key only)."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query

from app.core.config import settings
from app.core.security import rate_limit
from app.schemas.weather import (
    CurrentWeatherResponse,
    ForecastResponse,
    LocationSearchResponse,
    WeatherStatusResponse,
)
from app.services import openweather_service
from app.services.exceptions import ServiceError

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get(
    "/status",
    response_model=WeatherStatusResponse,
    summary="Whether the weather provider is configured",
)
def status() -> WeatherStatusResponse:
    configured = settings.weather_configured
    return WeatherStatusResponse(
        configured=configured,
        provider="OpenWeatherMap",
        message=(
            "Weather is configured."
            if configured
            else "Weather is not configured. Add OPENWEATHER_API_KEY to backend/.env."
        ),
        supported_endpoints=[
            "/data/2.5/weather",
            "/data/2.5/forecast",
            "/geo/1.0/direct",
        ],
    )


@router.get(
    "/locations",
    response_model=LocationSearchResponse,
    summary="Search for a city to use as a weather location",
    dependencies=[Depends(rate_limit("weather", 60))],
)
async def locations(
    q: str = Query(..., min_length=2, max_length=80),
    country: str = Query(default="IN", max_length=2),
) -> LocationSearchResponse:
    rows = await openweather_service.geocode_city(q, country=country)
    return LocationSearchResponse(count=len(rows), locations=rows)


@router.get(
    "/current",
    response_model=CurrentWeatherResponse,
    summary="Current weather for a city or coordinate",
    dependencies=[Depends(rate_limit("weather", 60))],
)
async def current(
    city: str = Query(..., min_length=2, max_length=80),
    state: str | None = Query(default=None, max_length=80),
    country: str = Query(default="IN", max_length=2),
    latitude: float | None = Query(default=None, ge=-90, le=90),
    longitude: float | None = Query(default=None, ge=-180, le=180),
) -> CurrentWeatherResponse:
    if (latitude is None) != (longitude is None):
        raise ServiceError(
            code="invalid_coordinates",
            message="Provide both latitude and longitude, or neither.",
            status_code=422,
        )
    location = await openweather_service.resolve_location(
        city=city,
        state=state,
        country=country,
        latitude=latitude,
        longitude=longitude,
    )
    data, cached = await openweather_service.current_weather(
        location["latitude"], location["longitude"]
    )
    return CurrentWeatherResponse(
        location=location,
        current=data,
        retrieved_at=datetime.now(timezone.utc).isoformat(),
        provider="OpenWeatherMap",
        cached=cached,
    )


@router.get(
    "/forecast",
    response_model=ForecastResponse,
    summary="5 day / 3 hour forecast for a city or coordinate",
    dependencies=[Depends(rate_limit("weather", 40))],
)
async def forecast(
    city: str = Query(..., min_length=2, max_length=80),
    state: str | None = Query(default=None, max_length=80),
    country: str = Query(default="IN", max_length=2),
    latitude: float | None = Query(default=None, ge=-90, le=90),
    longitude: float | None = Query(default=None, ge=-180, le=180),
) -> ForecastResponse:
    if (latitude is None) != (longitude is None):
        raise ServiceError(
            code="invalid_coordinates",
            message="Provide both latitude and longitude, or neither.",
            status_code=422,
        )
    location = await openweather_service.resolve_location(
        city=city,
        state=state,
        country=country,
        latitude=latitude,
        longitude=longitude,
    )
    data, cached = await openweather_service.forecast(
        location["latitude"], location["longitude"]
    )
    return ForecastResponse(
        location=location,
        forecast=data,
        retrieved_at=datetime.now(timezone.utc).isoformat(),
        cached=cached,
    )
