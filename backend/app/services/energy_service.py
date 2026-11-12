"""Energy data service.

Capacity (MW) and generation (GWh) are kept in separate structures and never
mixed. Each response carries its provenance so the UI can label it honestly.
"""

from __future__ import annotations

from typing import Any

from app.services.exceptions import ServiceError
from app.utils.datasets import load_dataset

ENERGY_FILE = "energy_snapshot.json"

RENEWABLE_IDS = {"solar", "wind", "hydro", "biomass", "small_hydro", "other_re"}


def _snapshot() -> dict[str, Any]:
    return load_dataset(ENERGY_FILE)


def _metadata(snapshot: dict[str, Any]) -> dict[str, Any]:
    return {
        "status": snapshot["status"],
        "status_note": snapshot["status_note"],
        "source": snapshot["source"],
        "reporting_period": snapshot["reporting_period"],
        "last_updated": snapshot["last_updated"],
    }


def _with_shares(rows: list[dict[str, Any]], value_key: str) -> list[dict[str, Any]]:
    total = sum(row[value_key] for row in rows) or 1
    return [
        {
            **row,
            "share_pct": round(row[value_key] / total * 100, 2),
            "is_renewable": row["id"] in RENEWABLE_IDS,
        }
        for row in rows
    ]


def _group_share(rows: list[dict[str, Any]], value_key: str, predicate) -> float:
    total = sum(row[value_key] for row in rows) or 1
    return round(sum(row[value_key] for row in rows if predicate(row)) / total * 100, 2)


def capacity_mix() -> dict[str, Any]:
    snapshot = _snapshot()
    rows = _with_shares(snapshot["capacity"]["by_source"], "capacity_mw")
    return {
        "metric": "installed_capacity",
        "unit": "MW",
        "total_mw": snapshot["capacity"]["total_mw"],
        "sources": rows,
        "shares": {
            "renewable_pct": _group_share(rows, "capacity_mw", lambda r: r["is_renewable"]),
            "non_fossil_pct": _group_share(
                rows, "capacity_mw", lambda r: r["type"] != "fossil"
            ),
            "fossil_pct": _group_share(rows, "capacity_mw", lambda r: r["type"] == "fossil"),
        },
        "meta": _metadata(snapshot),
        "data_kind": "capacity",
    }


def generation_mix() -> dict[str, Any]:
    snapshot = _snapshot()
    rows = _with_shares(snapshot["generation"]["by_source"], "generation_gwh")
    return {
        "metric": "generation",
        "unit": "GWh",
        "total_gwh": snapshot["generation"]["total_gwh"],
        "sources": rows,
        "shares": {
            "renewable_pct": _group_share(
                rows, "generation_gwh", lambda r: r["is_renewable"]
            ),
            "non_fossil_pct": _group_share(
                rows, "generation_gwh", lambda r: r["type"] != "fossil"
            ),
            "fossil_pct": _group_share(
                rows, "generation_gwh", lambda r: r["type"] == "fossil"
            ),
        },
        "meta": _metadata(snapshot),
        "data_kind": "generation",
    }


def combined_mix() -> dict[str, Any]:
    """Both capacity and generation, clearly separated."""
    return {
        "capacity": capacity_mix(),
        "generation": generation_mix(),
    }


def states(state: str | None = None) -> dict[str, Any]:
    snapshot = _snapshot()
    rows = snapshot["states"]
    if state:
        needle = state.strip().lower()
        rows = [row for row in rows if row["state"].lower() == needle]
        if not rows:
            raise ServiceError(
                code="state_not_found",
                message=f"No state-level reference data is available for '{state}'.",
                status_code=404,
            )
    return {
        "unit_capacity": "MW",
        "states": rows,
        "meta": _metadata(snapshot),
    }


def capacity_history() -> dict[str, Any]:
    snapshot = _snapshot()
    return {
        "unit": "GW",
        "history": snapshot["capacity_history"],
        "meta": _metadata(snapshot),
    }


def summary() -> dict[str, Any]:
    """Compact national indicators used by dashboards and Ask URJA context."""
    capacity = capacity_mix()
    generation = generation_mix()
    return {
        "installed_capacity_gw": round(capacity["total_mw"] / 1000, 1),
        "renewable_capacity_share_pct": capacity["shares"]["renewable_pct"],
        "non_fossil_capacity_share_pct": capacity["shares"]["non_fossil_pct"],
        "generation_twh": round(generation["total_gwh"] / 1000, 1),
        "renewable_generation_share_pct": generation["shares"]["renewable_pct"],
        "meta": capacity["meta"],
    }
