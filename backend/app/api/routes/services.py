"""Public services directory endpoints.

Transport/RTO and Passport services are deliberately absent from this module's
data and responses.
"""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.schemas.directory import ServiceRecord, ServicesResponse
from app.services import directory_service

router = APIRouter(prefix="/services", tags=["Public Services"])


@router.get("", response_model=ServicesResponse, summary="List public services")
def services(
    q: str | None = Query(default=None, max_length=80),
    category: str | None = Query(default=None, max_length=80),
    state: str | None = Query(default=None, max_length=80),
) -> ServicesResponse:
    return ServicesResponse(**directory_service.services(query=q, category=category, state=state))


@router.get(
    "/{service_id}",
    response_model=ServiceRecord,
    summary="Single public service record",
)
def service(service_id: str) -> ServiceRecord:
    return ServiceRecord(**directory_service.service(service_id))
