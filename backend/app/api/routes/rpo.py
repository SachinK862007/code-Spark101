"""RPO compliance endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import rate_limit
from app.schemas.rpo import (
    RpoCalculateRequest,
    RpoCalculationResponse,
    RpoTargetsResponse,
)
from app.services import rpo_engine

router = APIRouter(prefix="/rpo", tags=["RPO Compliance"])


@router.post(
    "/calculate",
    response_model=RpoCalculationResponse,
    summary="Calculate RPO compliance against a notified target",
    dependencies=[Depends(rate_limit("rpo", 60))],
)
def calculate(payload: RpoCalculateRequest) -> RpoCalculationResponse:
    result = rpo_engine.calculate(
        rpo_engine.RpoInputs(
            entity_name=payload.entity_name,
            entity_category=payload.entity_category,
            state=payload.state,
            year=payload.year,
            consumption=payload.consumption,
            consumption_unit=payload.consumption_unit,
            renewable_procured=payload.renewable_procured,
            certificates=payload.certificates,
            obligation_category=payload.obligation_category,
        )
    )
    return RpoCalculationResponse(**result)


@router.get(
    "/targets",
    response_model=RpoTargetsResponse,
    summary="Configured, versioned RPO targets and their sources",
)
def targets() -> RpoTargetsResponse:
    return RpoTargetsResponse(
        policy=rpo_engine.policy_metadata(),
        years=rpo_engine.available_years(),
        entity_categories=list(rpo_engine.ENTITY_CATEGORIES),
        obligation_categories=dict(rpo_engine.OBLIGATION_CATEGORIES),
        targets=rpo_engine.load_policy()["targets"],
    )
