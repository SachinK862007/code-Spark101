"""Solar ROI API schemas."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class SolarCalculateRequest(BaseModel):
    state: str = Field(default="Rajasthan", max_length=80)
    city: str | None = Field(default=None, max_length=80)
    monthly_bill: float | None = Field(default=None, ge=0)
    monthly_consumption_kwh: float | None = Field(default=None, ge=0)
    tariff: float | None = Field(default=None, gt=0, le=60)
    roof_area_sqft: float | None = Field(default=None, ge=0)
    system_capacity_kw: float | None = Field(default=None, gt=0, le=10000)
    consumer_category: Literal["residential", "commercial"] = "residential"
    system_type: Literal["ongrid", "offgrid", "hybrid"] = "ongrid"


class SolarCalculationResponse(BaseModel):
    inputs: dict[str, Any]
    sizing: dict[str, Any]
    cost: dict[str, Any]
    returns: dict[str, Any]
    assumptions: dict[str, Any]
    subsidy_source: dict[str, Any]
    disclaimer: str
