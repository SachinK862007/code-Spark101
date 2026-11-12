"""Weather API schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class CurrentWeatherResponse(BaseModel):
    location: dict[str, Any]
    current: dict[str, Any]
    retrieved_at: str
    provider: str
    cached: bool


class ForecastResponse(BaseModel):
    location: dict[str, Any]
    forecast: dict[str, Any]
    retrieved_at: str
    cached: bool


class LocationSearchResponse(BaseModel):
    count: int
    locations: list[dict[str, Any]]


class WeatherStatusResponse(BaseModel):
    configured: bool
    provider: str
    message: str
    supported_endpoints: list[str] = Field(default_factory=list)
