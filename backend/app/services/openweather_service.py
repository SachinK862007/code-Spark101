"""OpenWeatherMap integration.

Free-plan friendly endpoints only:
  * ``/geo/1.0/direct``   — forward geocoding
  * ``/data/2.5/weather`` — current conditions
  * ``/data/2.5/forecast``— 5 day / 3 hour forecast

The API key is read from the environment and never returned to the client.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import settings
from app.services.exceptions import ServiceError
from app.utils.cache import TTLCache

logger = logging.getLogger(__name__)

BASE_URL = "https://api.openweathermap.org"
_cache = TTLCache(max_entries=256)

COMPASS = (
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
)


def _require_key() -> str:
    if not settings.weather_configured:
        raise ServiceError(
            code="weather_not_configured",
            message=(
                "Weather is not configured. Add OPENWEATHER_API_KEY to backend/.env "
                "and restart the API. The key is used server-side only."
            ),
            status_code=503,
        )
    return settings.openweather_api_key


def _compass(degrees: float | None) -> str | None:
    if degrees is None:
        return None
    return COMPASS[int((degrees % 360) / 22.5 + 0.5) % 16]


def _icon_url(icon: str | None) -> str | None:
    return f"https://openweathermap.org/img/wn/{icon}@2x.png" if icon else None


async def _get(path: str, params: dict[str, Any]) -> tuple[dict[str, Any], bool]:
    key = _require_key()
    url = f"{BASE_URL}{path}"
    query = {**params, "appid": key, "units": "metric"}
    cache_key = f"{path}|{sorted((k, str(v)) for k, v in params.items() if k != 'appid')}"

    cached = _cache.get(cache_key)
    if cached is not None:
        return cached, True

    try:
        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            response = await client.get(url, params=query)
    except httpx.TimeoutException as error:
        raise ServiceError(
            code="weather_timeout",
            message="The weather provider did not respond in time. Please retry.",
            status_code=504,
        ) from error
    except httpx.HTTPError as error:
        logger.warning("Weather transport error: %s", type(error).__name__)
        raise ServiceError(
            code="weather_unavailable",
            message="The weather provider is unreachable. Please retry shortly.",
            status_code=502,
        ) from error

    if response.status_code == 401:
        raise ServiceError(
            code="weather_not_configured",
            message=(
                "OpenWeatherMap rejected OPENWEATHER_API_KEY. Check the key in "
                "backend/.env; a new key can take up to a few hours to activate."
            ),
            status_code=503,
        )
    if response.status_code == 404:
        raise ServiceError(
            code="location_not_found",
            message="No weather data was found for that location.",
            status_code=404,
        )
    if response.status_code == 429:
        raise ServiceError(
            code="weather_quota_exceeded",
            message=(
                "The OpenWeatherMap rate limit was reached. Wait a little and retry, "
                "or raise the plan limit."
            ),
            status_code=429,
        )
    if response.status_code in (402, 403):
        raise ServiceError(
            code="weather_endpoint_not_available",
            message=(
                "This OpenWeatherMap endpoint is not included in the current plan. "
                "Current conditions and the 5 day / 3 hour forecast require the free "
                "tier; other endpoints may need a paid subscription."
            ),
            status_code=503,
        )
    if response.status_code >= 500:
        raise ServiceError(
            code="weather_upstream_error",
            message="The weather provider returned an error. Please retry.",
            status_code=502,
        )
    if response.status_code != 200:
        raise ServiceError(
            code="weather_failed",
            message=f"Weather request failed with status {response.status_code}.",
            status_code=502,
        )

    payload = response.json()
    _cache.set(cache_key, payload, settings.weather_cache_ttl_seconds)
    return payload, False


async def geocode_city(
    city: str, *, state: str | None = None, country: str = "IN", limit: int = 5
) -> list[dict[str, Any]]:
    if not city.strip():
        raise ServiceError(
            code="invalid_location",
            message="A city name is required.",
            status_code=422,
        )
    query = f"{city},{state}" if state else city
    payload, _ = await _get(
        "/geo/1.0/direct",
        {"q": f"{query},{country}" if country else query, "limit": limit},
    )
    if not payload:
        raise ServiceError(
            code="location_not_found",
            message=f"No location matched '{city}'. Check the spelling or try a nearby city.",
            status_code=404,
        )
    return [
        {
            "name": item.get("name"),
            "state": item.get("state"),
            "country": item.get("country"),
            "latitude": item.get("lat"),
            "longitude": item.get("lon"),
        }
        for item in payload
    ]


async def resolve_location(
    *, city: str, state: str | None, country: str, latitude: float | None = None, longitude: float | None = None
) -> dict[str, Any]:
    if latitude is not None and longitude is not None:
        return {
            "name": city,
            "state": state,
            "country": country,
            "latitude": latitude,
            "longitude": longitude,
        }
    matches = await geocode_city(city, state=state, country=country)
    return matches[0]


async def current_weather(
    latitude: float, longitude: float
) -> tuple[dict[str, Any], bool]:
    payload, cached = await _get(
        "/data/2.5/weather", {"lat": latitude, "lon": longitude}
    )
    main = payload.get("main", {})
    wind = payload.get("wind", {})
    weather = (payload.get("weather") or [{}])[0]
    sys_block = payload.get("sys", {})

    return {
        "city": payload.get("name"),
        "country": sys_block.get("country"),
        "latitude": payload.get("coord", {}).get("lat"),
        "longitude": payload.get("coord", {}).get("lon"),
        "temperature_c": main.get("temp"),
        "feels_like_c": main.get("feels_like"),
        "min_temp_c": main.get("temp_min"),
        "max_temp_c": main.get("temp_max"),
        "humidity_pct": main.get("humidity"),
        "pressure_hpa": main.get("pressure"),
        "condition": weather.get("main"),
        "description": weather.get("description"),
        "icon": weather.get("icon"),
        "icon_url": _icon_url(weather.get("icon")),
        "wind_speed_ms": wind.get("speed"),
        "wind_direction_deg": wind.get("deg"),
        "wind_direction": _compass(wind.get("deg")),
        "wind_gust_ms": wind.get("gust"),
        "clouds_pct": payload.get("clouds", {}).get("all"),
        "visibility_m": payload.get("visibility"),
        "sunrise": datetime.fromtimestamp(
            sys_block.get("sunrise", 0), tz=timezone.utc
        ).isoformat()
        if sys_block.get("sunrise")
        else None,
        "sunset": datetime.fromtimestamp(
            sys_block.get("sunset", 0), tz=timezone.utc
        ).isoformat()
        if sys_block.get("sunset")
        else None,
        "observed_at": datetime.fromtimestamp(
            payload.get("dt", 0), tz=timezone.utc
        ).isoformat()
        if payload.get("dt")
        else None,
        "provider": "OpenWeatherMap",
    }, cached


async def forecast(
    latitude: float, longitude: float
) -> tuple[dict[str, Any], bool]:
    payload, cached = await _get(
        "/data/2.5/forecast", {"lat": latitude, "lon": longitude}
    )
    intervals: list[dict[str, Any]] = []
    for item in payload.get("list", []):
        weather = (item.get("weather") or [{}])[0]
        intervals.append(
            {
                "time": item.get("dt_txt"),
                "timestamp": item.get("dt"),
                "temperature_c": item.get("main", {}).get("temp"),
                "feels_like_c": item.get("main", {}).get("feels_like"),
                "humidity_pct": item.get("main", {}).get("humidity"),
                "condition": weather.get("main"),
                "description": weather.get("description"),
                "icon": weather.get("icon"),
                "icon_url": _icon_url(weather.get("icon")),
                "wind_speed_ms": item.get("wind", {}).get("speed"),
                "wind_direction_deg": item.get("wind", {}).get("deg"),
                "wind_direction": _compass(item.get("wind", {}).get("deg")),
                "precipitation_probability": item.get("pop"),
                "rain_3h_mm": item.get("rain", {}).get("3h"),
                "clouds_pct": item.get("clouds", {}).get("all"),
            }
        )

    daily: dict[str, dict[str, Any]] = {}
    for interval in intervals:
        day = (interval["time"] or "")[:10]
        bucket = daily.setdefault(
            day,
            {
                "date": day,
                "min_temp_c": interval["temperature_c"],
                "max_temp_c": interval["temperature_c"],
                "conditions": [],
                "precipitation_probability": 0.0,
                "wind_speed_ms": 0.0,
                "samples": 0,
            },
        )
        if interval["temperature_c"] is not None:
            bucket["min_temp_c"] = min(bucket["min_temp_c"], interval["temperature_c"])
            bucket["max_temp_c"] = max(bucket["max_temp_c"], interval["temperature_c"])
            bucket["wind_speed_ms"] += interval["wind_speed_ms"] or 0
            bucket["samples"] += 1
        if interval["condition"]:
            bucket["conditions"].append(interval["condition"])
        bucket["precipitation_probability"] = max(
            bucket["precipitation_probability"],
            interval["precipitation_probability"] or 0.0,
        )

    daily_rows = []
    for bucket in daily.values():
        conditions = bucket.pop("conditions")
        samples = bucket.pop("samples") or 1
        bucket["wind_speed_ms"] = round(bucket["wind_speed_ms"] / samples, 2)
        bucket["condition"] = max(set(conditions), key=conditions.count) if conditions else None
        bucket["precipitation_probability"] = round(
            bucket["precipitation_probability"] * 100, 0
        )
        daily_rows.append(bucket)

    return {
        "city": payload.get("city", {}).get("name"),
        "country": payload.get("city", {}).get("country"),
        "intervals": intervals,
        "daily": sorted(daily_rows, key=lambda row: row["date"]),
        "provider": "OpenWeatherMap (5 day / 3 hour forecast)",
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
    }, cached


def clear_cache() -> None:
    _cache.clear()
