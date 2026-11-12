"""Energy, carbon and forecasting API schemas."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class EnergyValueRequest(BaseModel):
    total_mwh: float = Field(..., gt=0)
    renewable_mwh: float = Field(..., ge=0)
    non_fossil_mwh: float | None = Field(default=None, ge=0)

    model_config = {"json_schema_extra": {
        "example": {"total_mwh": 1000, "renewable_mwh": 350, "non_fossil_mwh": 400}
    }}


class RequirementRequest(BaseModel):
    total_mwh: float = Field(..., gt=0)
    target_pct: float = Field(..., ge=0, le=100)
    existing_renewable_mwh: float = Field(default=0, ge=0)


class CarbonRequest(BaseModel):
    energy_mwh: float = Field(..., ge=0)
    unit: Literal["kWh", "MWh"] = "MWh"
    emission_factor_source: Literal["grid", "coal", "gas", "diesel"] = "grid"


class CalculationResponse(BaseModel):
    inputs: dict[str, Any]
    result: dict[str, Any]
    notes: list[str] = Field(default_factory=list)


class CarbonResponse(BaseModel):
    inputs: dict[str, Any]
    factor: dict[str, Any]
    result: dict[str, Any]
    notes: list[str]


class ForecastRequest(BaseModel):
    location: str = Field(default="Bengaluru", max_length=80)
    state: str | None = Field(default=None, max_length=80)
    technology: Literal["solar", "wind"] = "solar"
    capacity_mw: float = Field(..., gt=0, le=100000)
    horizon_days: int = Field(default=3, ge=1, le=7)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class BatteryRequest(BaseModel):
    daily_energy_kwh: float = Field(..., gt=0)
    autonomy_days: float = Field(default=1, ge=0.25, le=7)
    depth_of_discharge: float = Field(default=0.9, gt=0, le=1)
    roundtrip_efficiency: float = Field(default=0.88, gt=0, le=1)
