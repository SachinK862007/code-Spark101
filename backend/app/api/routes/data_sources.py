"""Data source provenance endpoint."""

from __future__ import annotations

from fastapi import APIRouter

from app.schemas.directory import DataSourcesResponse
from app.services import directory_service

router = APIRouter(prefix="/data-sources", tags=["Data Sources"])


@router.get("", response_model=DataSourcesResponse, summary="Dataset provenance catalogue")
def data_sources() -> DataSourcesResponse:
    return DataSourcesResponse(**directory_service.data_sources())
