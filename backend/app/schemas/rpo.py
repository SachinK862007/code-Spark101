"""RPO API schemas."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


class RpoCalculateRequest(BaseModel):
    entity_name: str = Field(default="Unnamed entity", max_length=160)
    entity_category: Literal[
        "DISCOM",
        "Captive Consumer",
        "Open Access Consumer",
        "Other eligible entity",
    ] = "DISCOM"
    state: str = Field(default="All India", max_length=80)
    year: str = Field(..., description="Financial year label, e.g. 2025-26")
    consumption: float = Field(..., gt=0, description="Applicable electricity consumption")
    consumption_unit: Literal["kWh", "MWh"] = "MWh"
    renewable_procured: float = Field(default=0, ge=0)
    certificates: float = Field(default=0, ge=0)
    obligation_category: Literal[
        "total", "wind", "hydro", "distributed_re", "other"
    ] = "total"

    @field_validator("year")
    @classmethod
    def validate_year(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) != 7 or cleaned[4] != "-":
            raise ValueError("year must use the FY label format, e.g. 2025-26")
        return cleaned

    @field_validator("entity_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        return value.strip() or "Unnamed entity"


class RpoTargetRow(BaseModel):
    year: str
    category: str
    total: float
    sub_targets: dict[str, float] | None = None
    effective_from: str | None = None
    effective_to: str | None = None


class RpoTargetsResponse(BaseModel):
    policy: dict[str, Any]
    years: list[str]
    entity_categories: list[str]
    obligation_categories: dict[str, str]
    targets: list[RpoTargetRow]


class RpoCalculationResponse(BaseModel):
    policy: dict[str, Any]
    inputs: dict[str, Any]
    target: dict[str, Any]
    eligible: dict[str, Any]
    result: dict[str, Any]
    notes: list[str]
