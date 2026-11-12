"""Directory API schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ServiceCategory(BaseModel):
    id: str
    label: str
    icon: str
    count: int


class ServiceRecord(BaseModel):
    id: str
    name: str
    department: str
    category: str
    location: str
    city: str
    state: str
    contact: str
    availability: str
    status: str
    official_url: str
    source_name: str
    updated_at: str
    description: str


class ServicesResponse(BaseModel):
    count: int
    services: list[ServiceRecord]
    categories: list[ServiceCategory]
    states: list[str]
    disclaimer: str


class JobsResponse(BaseModel):
    count: int
    jobs: list[dict[str, Any]]
    categories: list[str]
    states: list[str]
    data_status: str
    disclaimer: str


class FinanceResponse(BaseModel):
    count: int
    products: list[dict[str, Any]]
    types: list[str]
    data_status: str
    disclaimer: str


class CircularityResponse(BaseModel):
    streams: list[dict[str, Any]]
    resources: list[dict[str, Any]]
    data_status: str
    disclaimer: str


class EnvironmentResponse(BaseModel):
    regions: list[dict[str, Any]]
    source: dict[str, Any]
    data_status: str
    air_quality_note: str


class DataSourceRecord(BaseModel):
    id: str
    dataset_name: str
    provider: str
    source_url: str
    reporting_period: str | None = None
    collected_at: str | None = None
    last_updated: str | None = None
    unit: str | None = None
    data_status: str
    processing_notes: str | None = None
    used_by: list[str] = Field(default_factory=list)


class DataSourcesResponse(BaseModel):
    count: int
    sources: list[DataSourceRecord]
