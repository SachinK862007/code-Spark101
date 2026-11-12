"""Forecasting and storage planning endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import rate_limit
from app.schemas.energy import BatteryRequest, ForecastRequest
from app.services import forecasting_service

router = APIRouter(prefix="/forecasting", tags=["Forecasting"])


@router.post(
    "/estimate",
    summary="Rule-based generation estimate for solar or wind",
    dependencies=[Depends(rate_limit("forecast", 30))],
)
async def estimate(payload: ForecastRequest) -> dict:
    return await forecasting_service.estimate(
        forecasting_service.ForecastInputs(
            location=payload.location,
            technology=payload.technology,
            capacity_mw=payload.capacity_mw,
            horizon_days=payload.horizon_days,
            latitude=payload.latitude,
            longitude=payload.longitude,
            state=payload.state,
        )
    )


@router.post(
    "/battery",
    summary="Battery capacity sizing estimate",
    dependencies=[Depends(rate_limit("forecast", 60))],
)
def battery(payload: BatteryRequest) -> dict:
    return forecasting_service.battery_sizing(
        daily_energy_kwh=payload.daily_energy_kwh,
        autonomy_days=payload.autonomy_days,
        depth_of_discharge=payload.depth_of_discharge,
        roundtrip_efficiency=payload.roundtrip_efficiency,
    )
