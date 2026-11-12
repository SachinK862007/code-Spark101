"""Carbon emission avoidance and renewable-contribution calculators."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.services.exceptions import ServiceError
from app.utils.datasets import load_dataset
from app.utils.units import to_mwh

CARBON_FILE = "carbon_factors.json"


@dataclass(frozen=True)
class CarbonInputs:
    energy_mwh: float
    unit: str
    emission_factor_source: str  # "grid" | "coal" | "gas" | "diesel"


def factors() -> dict[str, Any]:
    return load_dataset(CARBON_FILE)


def calculate_avoided_emissions(inputs: CarbonInputs) -> dict[str, Any]:
    data = factors()
    key = f"{inputs.emission_factor_source}_factor_kg_per_kwh"
    mapping = {
        "grid": "grid_emission_factor_kg_per_kwh",
        "coal": "coal_generation_factor_kg_per_kwh",
        "gas": "natural_gas_factor_kg_per_kwh",
        "diesel": "diesel_factor_kg_per_kwh",
    }
    factor_key = mapping.get(inputs.emission_factor_source)
    if factor_key is None:
        raise ServiceError(
            code="invalid_emission_factor_source",
            message=(
                "emission_factor_source must be one of grid, coal, gas, diesel."
            ),
            status_code=422,
        )

    try:
        energy_mwh = to_mwh(inputs.energy_mwh, inputs.unit)
    except ValueError as error:
        raise ServiceError(
            code="invalid_unit", message=str(error), status_code=422
        ) from error

    if energy_mwh < 0:
        raise ServiceError(
            code="invalid_energy",
            message="Energy must not be negative.",
            status_code=422,
        )

    factor = float(data["factors"][factor_key])
    energy_kwh = energy_mwh * 1000
    kg = energy_kwh * factor

    return {
        "inputs": {
            "energy_mwh": round(energy_mwh, 3),
            "unit": inputs.unit,
            "emission_factor_source": inputs.emission_factor_source,
        },
        "factor": {
            "kg_co2_per_kwh": factor,
            "source_name": data["source"]["name"],
            "source_url": data["source"]["url"],
        },
        "result": {
            "co2_avoided_kg": round(kg, 2),
            "co2_avoided_tonnes": round(kg / 1000, 3),
            "equivalent_trees_per_year": round(kg / 21.0, 1),
        },
        "notes": data["notes"],
    }


def renewable_contribution(
    *,
    total_mwh: float,
    renewable_mwh: float,
    non_fossil_mwh: float | None = None,
) -> dict[str, Any]:
    if total_mwh <= 0:
        raise ServiceError(
            code="invalid_energy",
            message="Total energy must be greater than zero.",
            status_code=422,
        )
    if renewable_mwh < 0 or (non_fossil_mwh is not None and non_fossil_mwh < 0):
        raise ServiceError(
            code="invalid_energy",
            message="Energy values must not be negative.",
            status_code=422,
        )
    if renewable_mwh > total_mwh:
        raise ServiceError(
            code="invalid_energy",
            message="Renewable energy cannot exceed total energy.",
            status_code=422,
        )

    renewable_pct = renewable_mwh / total_mwh * 100
    non_fossil_pct = (
        (non_fossil_mwh / total_mwh * 100) if non_fossil_mwh is not None else None
    )
    return {
        "inputs": {
            "total_mwh": round(total_mwh, 3),
            "renewable_mwh": round(renewable_mwh, 3),
            "non_fossil_mwh": non_fossil_mwh,
        },
        "result": {
            "renewable_share_pct": round(renewable_pct, 2),
            "non_fossil_share_pct": round(non_fossil_pct, 2)
            if non_fossil_pct is not None
            else None,
            "fossil_mwh": round(
                total_mwh - (non_fossil_mwh if non_fossil_mwh is not None else renewable_mwh),
                3,
            ),
        },
        "notes": [
            "Shares are computed from the energy values supplied in this request.",
        ],
    }


def renewable_requirement(
    *, total_mwh: float, target_pct: float, existing_renewable_mwh: float
) -> dict[str, Any]:
    if total_mwh <= 0:
        raise ServiceError(
            code="invalid_energy",
            message="Total energy must be greater than zero.",
            status_code=422,
        )
    if not 0 <= target_pct <= 100:
        raise ServiceError(
            code="invalid_target",
            message="Target percentage must be between 0 and 100.",
            status_code=422,
        )
    required = total_mwh * target_pct / 100
    remaining = max(required - existing_renewable_mwh, 0.0)
    return {
        "inputs": {
            "total_mwh": round(total_mwh, 3),
            "target_pct": target_pct,
            "existing_renewable_mwh": round(existing_renewable_mwh, 3),
        },
        "result": {
            "required_renewable_mwh": round(required, 3),
            "remaining_requirement_mwh": round(remaining, 3),
            "achieved_share_pct": round(
                existing_renewable_mwh / total_mwh * 100, 2
            ),
            "met": remaining <= 0.01,
        },
        "notes": [
            "The target percentage is supplied by the caller; verify it against the "
            "applicable notified obligation before relying on the result.",
        ],
    }
