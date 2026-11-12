"""Map API schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class MapCategory(BaseModel):
    id: str
    label: str
    group: str
    marker_color: str
    count: int


class MapCategoriesResponse(BaseModel):
    count: int
    categories: list[MapCategory]


class MapLocation(BaseModel):
    id: str
    name: str
    category: str
    address: str
    city: str
    state: str
    latitude: float
    longitude: float
    phone: str | None = None
    hours: str | None = None
    verified: bool
    data_status: str
    source_name: str
    source_url: str
    details: str | None = None


class MapLocationsResponse(BaseModel):
    count: int
    locations: list[MapLocation]
    attribution: str
    note: str
