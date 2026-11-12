"""Circular economy endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.schemas.directory import CircularityResponse
from app.services import directory_service

router = APIRouter(prefix="/circularity", tags=["Circular Economy"])


@router.get("", response_model=CircularityResponse, summary="Circular economy reference content")
def circularity(q: str | None = Query(default=None, max_length=80)) -> CircularityResponse:
    return CircularityResponse(**directory_service.circularity(query=q))
