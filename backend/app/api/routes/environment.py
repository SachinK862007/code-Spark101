"""Environmental impact endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.security import rate_limit
from app.schemas.directory import EnvironmentResponse
from app.schemas.energy import CarbonRequest, CarbonResponse
from app.services import carbon_service, directory_service

router = APIRouter(prefix="/environment", tags=["Environmental Impact"])


@router.get("", response_model=EnvironmentResponse, summary="Regional environmental indicators")
def environment(
    region: str | None = Query(default=None, max_length=80),
) -> EnvironmentResponse:
    return EnvironmentResponse(**directory_service.environment(region=region))


@router.post(
    "/carbon-calculate",
    response_model=CarbonResponse,
    summary="Estimate CO2 emissions avoided for a clean-energy quantity",
    dependencies=[Depends(rate_limit("carbon", 60))],
)
def carbon_calculate(payload: CarbonRequest) -> CarbonResponse:
    return CarbonResponse(
        **carbon_service.calculate_avoided_emissions(
            carbon_service.CarbonInputs(
                energy_mwh=payload.energy_mwh,
                unit=payload.unit,
                emission_factor_source=payload.emission_factor_source,
            )
        )
    )
