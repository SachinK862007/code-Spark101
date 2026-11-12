"""Map data service.

Locations are reference coordinates compiled from public institutional pages.
Each record states whether it is a verified facility marker, a directory pointer
or an approximate position — never a randomly generated facility.
"""

from __future__ import annotations

from typing import Any

from app.services.exceptions import ServiceError
from app.utils.datasets import load_dataset

MAP_FILE = "map_locations.json"
RENEWABLE_CATEGORIES = {"solar", "wind", "hydro"}


def _data() -> dict[str, Any]:
    return load_dataset(MAP_FILE)


def categories() -> list[dict[str, Any]]:
    rows = []
    for category in _data()["categories"]:
        rows.append(
            {
                **category,
                "count": sum(
                    1
                    for location in _data()["locations"]
                    if location["category"] == category["id"]
                ),
            }
        )
    return rows


def filter_group(category_id: str) -> str:
    for category in _data()["categories"]:
        if category["id"] == category_id:
            return category["group"]
    raise ServiceError(
        code="invalid_category",
        message=f"Unknown map category '{category_id}'.",
        status_code=422,
    )


def locations(
    *,
    categories_filter: list[str] | None = None,
    groups: list[str] | None = None,
    query: str | None = None,
    state: str | None = None,
) -> dict[str, Any]:
    rows = _data()["locations"]

    if categories_filter:
        allowed = set(categories_filter)
        unknown = allowed - {category["id"] for category in _data()["categories"]}
        if unknown:
            raise ServiceError(
                code="invalid_category",
                message=f"Unknown map categories: {', '.join(sorted(unknown))}.",
                status_code=422,
            )
        rows = [row for row in rows if row["category"] in allowed]

    if groups:
        wanted = set(groups)
        if "renewable" in wanted:
            wanted |= RENEWABLE_CATEGORIES
        rows = [row for row in rows if filter_group(row["category"]) in wanted or row["category"] in wanted]

    if state:
        needles = state.lower()
        rows = [row for row in rows if row["state"].lower() == needles]

    if query:
        needle = query.strip().lower()
        rows = [
            row
            for row in rows
            if needle in row["name"].lower()
            or needle in row["address"].lower()
            or needle in row["city"].lower()
            or needle in (row.get("details") or "").lower()
        ]

    return {
        "count": len(rows),
        "locations": rows,
        "attribution": "Map tiles © OpenStreetMap contributors",
        "note": (
            "Marker positions are approximate. Records flagged data_status "
            "'directory' point at an official register rather than a specific facility."
        ),
    }
