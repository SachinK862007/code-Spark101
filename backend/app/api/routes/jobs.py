"""Green jobs endpoint (illustrative records, clearly labelled)."""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.schemas.directory import JobsResponse
from app.services import directory_service

router = APIRouter(prefix="/jobs", tags=["Green Jobs"])


@router.get("", response_model=JobsResponse, summary="Search illustrative green job records")
def jobs(
    q: str | None = Query(default=None, max_length=80),
    category: str | None = Query(default=None, max_length=80),
    state: str | None = Query(default=None, max_length=80),
) -> JobsResponse:
    return JobsResponse(
        **directory_service.jobs(query=q, category=category, state=state)
    )
