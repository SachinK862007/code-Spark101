"""Solar ROI endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import rate_limit
from app.schemas.solar import SolarCalculateRequest, SolarCalculationResponse
from app.services import solar_calculator

router = APIRouter(prefix="/solar", tags=["Solar ROI"])


@router.get(
    "/assumptions",
    summary="Configured solar assumptions and subsidy source",
)
def assumptions() -> dict:
    return solar_calculator.assumptions()


@router.post(
    "/calculate",
    response_model=SolarCalculationResponse,
    summary="Estimate rooftop solar sizing, subsidy, savings and payback",
    dependencies=[Depends(rate_limit("solar", 60))],
)
def calculate(payload: SolarCalculateRequest) -> SolarCalculationResponse:
    result = solar_calculator.calculate(
        solar_calculator.SolarInputs(
            state=payload.state,
            city=payload.city,
            monthly_bill=payload.monthly_bill,
            monthly_consumption_kwh=payload.monthly_consumption_kwh,
            tariff=payload.tariff,
            roof_area_sqft=payload.roof_area_sqft,
            system_capacity_kw=payload.system_capacity_kw,
            consumer_category=payload.consumer_category,
            system_type=payload.system_type,
        )
    )
    return SolarCalculationResponse(**result)
