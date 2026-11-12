"""Read-only directory services backed by the bundled reference datasets."""

from __future__ import annotations

from typing import Any

from app.services.exceptions import ServiceError
from app.utils.datasets import load_dataset

REMOVED_SERVICE_CATEGORIES = {"transport and rto", "passport services"}


def _filter(rows: list[dict[str, Any]], query: str | None, fields: tuple[str, ...]) -> list[dict[str, Any]]:
    if not query:
        return rows
    needle = query.strip().lower()
    return [
        row
        for row in rows
        if any(needle in str(row.get(field, "")).lower() for field in fields)
    ]


# ---------------------------------------------------------------- services


def services(
    *, query: str | None = None, category: str | None = None, state: str | None = None
) -> dict[str, Any]:
    data = load_dataset("services.json")
    rows = [
        row
        for row in data["services"]
        if row["category"].strip().lower() not in REMOVED_SERVICE_CATEGORIES
    ]
    rows = _filter(rows, query, ("name", "department", "location", "description"))
    if category and category.lower() != "all categories":
        rows = [row for row in rows if row["category"].lower() == category.lower()]
    if state and state.lower() not in {"all states", "national"}:
        rows = [
            row
            for row in rows
            if row["state"].lower() == state.lower() or row["state"] == "National"
        ]

    all_rows = [
        row
        for row in data["services"]
        if row["category"].strip().lower() not in REMOVED_SERVICE_CATEGORIES
    ]
    categories = [
        {
            **category_row,
            "count": sum(1 for row in all_rows if row["category"] == category_row["label"]),
        }
        for category_row in data["categories"]
    ]
    return {
        "count": len(rows),
        "services": rows,
        "categories": categories,
        "states": sorted({row["state"] for row in all_rows if row["state"]}),
        "disclaimer": data["disclaimer"],
    }


def service(service_id: str) -> dict[str, Any]:
    data = load_dataset("services.json")
    for row in data["services"]:
        if row["id"] == service_id:
            if row["category"].strip().lower() in REMOVED_SERVICE_CATEGORIES:
                break
            return row
    raise ServiceError(
        code="service_not_found",
        message=f"No service with id '{service_id}'.",
        status_code=404,
    )


# -------------------------------------------------------------------- jobs


def jobs(
    *, query: str | None = None, category: str | None = None, state: str | None = None
) -> dict[str, Any]:
    data = load_dataset("green_jobs.json")
    rows = _filter(
        data["jobs"], query, ("title", "organisation", "description", "location")
    )
    if category and category.lower() != "all categories":
        rows = [row for row in rows if row["category"].lower() == category.lower()]
    if state and state.lower() not in {"all states", "all locations"}:
        rows = [row for row in rows if row["state"].lower() == state.lower()]
    return {
        "count": len(rows),
        "jobs": rows,
        "categories": sorted({row["category"] for row in data["jobs"]}),
        "states": sorted({row["state"] for row in data["jobs"]}),
        "data_status": data["data_status"],
        "disclaimer": data["disclaimer"],
    }


# ----------------------------------------------------------------- finance


def finance(*, query: str | None = None, product_type: str | None = None) -> dict[str, Any]:
    data = load_dataset("green_finance.json")
    rows = _filter(data["products"], query, ("name", "provider", "eligible_for", "type"))
    if product_type and product_type.lower() != "all types":
        rows = [row for row in rows if row["type"].lower() == product_type.lower()]
    return {
        "count": len(rows),
        "products": rows,
        "types": sorted({row["type"] for row in data["products"]}),
        "data_status": data["data_status"],
        "disclaimer": data["disclaimer"],
    }


# -------------------------------------------------------------- circularity


def circularity(*, query: str | None = None) -> dict[str, Any]:
    data = load_dataset("circularity.json")
    return {
        "streams": _filter(data["streams"], query, ("name", "handling", "do_not")),
        "resources": _filter(
            data["recycling_resources"], query, ("name", "description")
        ),
        "data_status": data["data_status"],
        "disclaimer": data["disclaimer"],
    }


# -------------------------------------------------------------- environment


def environment(*, region: str | None = None) -> dict[str, Any]:
    data = load_dataset("environment.json")
    rows = data["regional_indicators"]
    if region:
        rows = [row for row in rows if row["region"].lower() == region.lower()]
        if not rows:
            raise ServiceError(
                code="region_not_found",
                message=f"No environmental reference data for '{region}'.",
                status_code=404,
            )
    return {
        "regions": rows,
        "source": data["source"],
        "data_status": data["data_status"],
        "air_quality_note": (
            "Regional air-quality values are illustrative reference indicators, not live "
            "CPCB readings. Configure an approved air-quality provider for measured data."
        ),
    }


# ------------------------------------------------------------- data sources


def data_sources() -> dict[str, Any]:
    data = load_dataset("data_sources.json")
    return {"count": len(data["sources"]), "sources": data["sources"]}
