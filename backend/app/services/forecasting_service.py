"""Generation and storage estimates.

This is deliberately a transparent rule-based model, not a trained ML model.
It scales a specific-yield / capacity-factor assumption by the weather forecast
when one is available, and reports a wide uncertainty band otherwise.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any

from app.services import openweather_service
from app.services.exceptions import ServiceError

logger = logging.getLogger(__name__)

TECHNOLOGIES = ("solar", "wind")

# Planning defaults (kWh per kWp per day for solar, capacity factor for wind).
SOLAR_SPECIFIC_YIELD = 4.3
WIND_CAPACITY_FACTOR = 0.28
WIND_CUT_IN = 3.0
WIND_RATED = 12.0
WIND_CUT_OUT = 25.0


@dataclass(frozen=True)
class ForecastInputs:
    location: str
    technology: str
    capacity_mw: float
    horizon_days: int
    latitude: float | None
    longitude: float | None
    state: str | None


def _solar_factor(cloud_pct: float | None, temp_c: float | None) -> tuple[float, list[str]]:
    notes: list[str] = []
    factor = 1.0
    if cloud_pct is not None:
        factor *= max(0.15, 1 - 0.0075 * cloud_pct)
        notes.append(f"Cloud cover {cloud_pct:.0f}% applied as an irradiance derate.")
    if temp_c is not None and temp_c > 25:
        derate = 1 - min((temp_c - 25) * 0.004, 0.15)
        factor *= derate
        notes.append(f"Temperature {temp_c:.0f}°C applied as a {100 * (1 - derate):.1f}% derate.")
    return factor, notes


def _wind_capacity_factor(speed: float | None) -> float:
    if speed is None:
        return WIND_CAPACITY_FACTOR
    if speed < WIND_CUT_IN or speed > WIND_CUT_OUT:
        return 0.0
    return min((speed / WIND_RATED) ** 3, 0.45)


async def estimate(inputs: ForecastInputs) -> dict[str, Any]:
    if inputs.technology not in TECHNOLOGIES:
        raise ServiceError(
            code="invalid_technology",
            message=f"technology must be one of {', '.join(TECHNOLOGIES)}.",
            status_code=422,
        )
    if inputs.capacity_mw <= 0:
        raise ServiceError(
            code="invalid_capacity",
            message="Installed capacity must be greater than zero.",
            status_code=422,
        )
    if not 1 <= inputs.horizon_days <= 7:
        raise ServiceError(
            code="invalid_horizon",
            message="Forecast horizon must be between 1 and 7 days.",
            status_code=422,
        )

    weather_rows: list[dict[str, Any]] = []
    weather_used = False
    weather_note: str | None = None

    if inputs.latitude is not None and inputs.longitude is not None:
        try:
            data, _ = await openweather_service.forecast(
                inputs.latitude, inputs.longitude
            )
            weather_rows = data["daily"][: inputs.horizon_days]
            weather_used = bool(weather_rows)
        except ServiceError as error:
            weather_note = f"Weather unavailable ({error.code}); used planning defaults."
            logger.info("Forecast weather fallback: %s", error.code)
    else:
        weather_note = "No coordinates supplied; planning defaults were used."

    days: list[dict[str, Any]] = []
    total_mwh = 0.0

    for offset in range(inputs.horizon_days):
        day = date.today() + timedelta(days=offset)
        day_key = day.isoformat()
        weather_day = next(
            (row for row in weather_rows if row["date"] == day_key), None
        )

        notes: list[str] = []
        if inputs.technology == "solar":
            energy_kwh = (
                inputs.capacity_mw * 1000 * SOLAR_SPECIFIC_YIELD
            )
            if weather_day:
                cloud_proxy = min(
                    100.0,
                    float(weather_day["precipitation_probability"]) * 1.4,
                )
                factor, applied = _solar_factor(
                    cloud_proxy, weather_day.get("max_temp_c")
                )
                energy_kwh *= factor
                notes.extend(applied)
            else:
                notes.append("Planning default specific yield used for this day.")
            uncertainty = 0.18 if weather_day else 0.28
        else:
            cf = WIND_CAPACITY_FACTOR
            if weather_day and weather_day.get("wind_speed_ms"):
                cf = _wind_capacity_factor(float(weather_day["wind_speed_ms"]))
                notes.append(
                    f"Wind speed {weather_day['wind_speed_ms']:.1f} m/s mapped to a "
                    f"{cf * 100:.0f}% capacity factor."
                )
            else:
                notes.append("Planning default capacity factor used for this day.")
            energy_kwh = inputs.capacity_mw * 1000 * cf * 24
            uncertainty = 0.30 if weather_day else 0.45

        energy_mwh = energy_kwh / 1000
        total_mwh += energy_mwh
        days.append(
            {
                "date": day_key,
                "estimated_generation_mwh": round(energy_mwh, 2),
                "low_mwh": round(energy_mwh * (1 - uncertainty), 2),
                "high_mwh": round(energy_mwh * (1 + uncertainty), 2),
                "uncertainty_pct": round(uncertainty * 100, 0),
                "weather_used": bool(weather_day),
                "notes": notes,
            }
        )

    confidence = "low"
    if weather_used:
        confidence = "medium" if inputs.technology == "solar" else "low"

    return {
        "inputs": {
            "location": inputs.location,
            "state": inputs.state,
            "technology": inputs.technology,
            "capacity_mw": inputs.capacity_mw,
            "horizon_days": inputs.horizon_days,
            "latitude": inputs.latitude,
            "longitude": inputs.longitude,
        },
        "method": {
            "kind": "rule_based_estimate",
            "description": (
                "Specific-yield (solar) or power-curve capacity-factor (wind) model, "
                "adjusted by the weather forecast when available. This is not a "
                "trained machine-learning forecast."
            ),
            "weather_used": weather_used,
            "weather_note": weather_note,
            "confidence": confidence,
            "assumptions": {
                "solar_specific_yield_kwh_per_kwp_day": SOLAR_SPECIFIC_YIELD,
                "wind_default_capacity_factor": WIND_CAPACITY_FACTOR,
                "wind_cut_in_ms": WIND_CUT_IN,
                "wind_rated_ms": WIND_RATED,
                "wind_cut_out_ms": WIND_CUT_OUT,
            },
        },
        "daily": days,
        "totals": {
            "estimated_generation_mwh": round(total_mwh, 2),
            "low_mwh": round(sum(day["low_mwh"] for day in days), 2),
            "high_mwh": round(sum(day["high_mwh"] for day in days), 2),
        },
        "data_status": "estimate",
    }


def battery_sizing(
    *, daily_energy_kwh: float, autonomy_days: float, depth_of_discharge: float, roundtrip_efficiency: float
) -> dict[str, Any]:
    if daily_energy_kwh <= 0:
        raise ServiceError(
            code="invalid_energy",
            message="Daily energy requirement must be greater than zero.",
            status_code=422,
        )
    if not 0 < depth_of_discharge <= 1 or not 0 < roundtrip_efficiency <= 1:
        raise ServiceError(
            code="invalid_parameters",
            message="Depth of discharge and round-trip efficiency must be between 0 and 1.",
            status_code=422,
        )
    if not 0.25 <= autonomy_days <= 7:
        raise ServiceError(
            code="invalid_autonomy",
            message="Autonomy must be between 0.25 and 7 days.",
            status_code=422,
        )

    usable_kwh = daily_energy_kwh * autonomy_days
    required_kwh = usable_kwh / (depth_of_discharge * roundtrip_efficiency)
    return {
        "inputs": {
            "daily_energy_kwh": daily_energy_kwh,
            "autonomy_days": autonomy_days,
            "depth_of_discharge": depth_of_discharge,
            "roundtrip_efficiency": roundtrip_efficiency,
        },
        "result": {
            "usable_capacity_kwh": round(usable_kwh, 1),
            "required_capacity_kwh": round(required_kwh, 1),
            "required_capacity_mwh": round(required_kwh / 1000, 3),
        },
        "data_status": "estimate",
        "notes": [
            "Sizing excludes degradation, temperature derating and grid-charging limits.",
        ],
    }
