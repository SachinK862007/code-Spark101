"""Map endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.schemas.maps import MapCategoriesResponse, MapLocationsResponse
from app.services import map_service

router = APIRouter(prefix="/maps", tags=["Maps"])


@router.get(
    "/categories",
    response_model=MapCategoriesResponse,
    summary="Map categories with location counts",
)
def categories() -> MapCategoriesResponse:
    rows = map_service.categories()
    return MapCategoriesResponse(count=len(rows), categories=rows)


@router.get(
    "/locations",
    response_model=MapLocationsResponse,
    summary="Map locations filtered by category, group, state or free text",
)
def locations(
    category: list[str] | None = Query(default=None),
    group: list[str] | None = Query(default=None),
    q: str | None = Query(default=None, max_length=80),
    state: str | None = Query(default=None, max_length=80),
) -> MapLocationsResponse:
    return MapLocationsResponse(
        **map_service.locations(
            categories_filter=category, groups=group, query=q, state=state
        )
    )
