"""Energy data and calculation endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.security import rate_limit
from app.schemas.energy import CalculationResponse, EnergyValueRequest, RequirementRequest
from app.services import carbon_service, energy_service

router = APIRouter(prefix="/energy", tags=["Energy"])


@router.get("/mix", summary="Capacity and generation mix with provenance")
def mix() -> dict:
    return energy_service.combined_mix()


@router.get("/capacity", summary="Installed capacity by source (MW)")
def capacity() -> dict:
    return energy_service.capacity_mix()


@router.get("/generation", summary="Generation by source (GWh)")
def generation() -> dict:
    return energy_service.generation_mix()


@router.get("/summary", summary="Compact national indicators")
def summary() -> dict:
    return energy_service.summary()


@router.get("/states", summary="State-level renewable reference data")
def states(state: str | None = Query(default=None, max_length=80)) -> dict:
    return energy_service.states(state)


@router.get("/history", summary="Installed capacity history (GW)")
def history() -> dict:
    return energy_service.capacity_history()


@router.post(
    "/calculate",
    response_model=CalculationResponse,
    summary="Renewable contribution share from supplied energy values",
    dependencies=[Depends(rate_limit("energy_calc", 60))],
)
def calculate(payload: EnergyValueRequest) -> CalculationResponse:
    result = carbon_service.renewable_contribution(
        total_mwh=payload.total_mwh,
        renewable_mwh=payload.renewable_mwh,
        non_fossil_mwh=payload.non_fossil_mwh,
    )
    return CalculationResponse(**result)


@router.post(
    "/requirement",
    response_model=CalculationResponse,
    summary="Renewable energy requirement for a target share",
    dependencies=[Depends(rate_limit("energy_calc", 60))],
)
def requirement(payload: RequirementRequest) -> CalculationResponse:
    result = carbon_service.renewable_requirement(
        total_mwh=payload.total_mwh,
        target_pct=payload.target_pct,
        existing_renewable_mwh=payload.existing_renewable_mwh,
    )
    return CalculationResponse(**result)
