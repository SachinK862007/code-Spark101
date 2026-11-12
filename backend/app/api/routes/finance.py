"""Green finance endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.schemas.directory import FinanceResponse
from app.services import directory_service

router = APIRouter(prefix="/finance", tags=["Green Finance"])


@router.get("", response_model=FinanceResponse, summary="List green finance instruments")
def finance(
    q: str | None = Query(default=None, max_length=80),
    type: str | None = Query(default=None, max_length=80),
) -> FinanceResponse:
    return FinanceResponse(**directory_service.finance(query=q, product_type=type))
