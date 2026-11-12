"""Renewable Purchase Obligation (RPO / RCO) calculation engine.

The engine is intentionally independent of FastAPI. Targets come from the
versioned policy file `app/data/rpo_targets.json`; a target that is not present
there is reported as unavailable instead of being guessed.

Double counting rule
--------------------
Renewable electricity is counted first (capped at applicable consumption so a
consumer cannot claim more than it consumed). Certificates are then counted
only up to the remaining requirement, because a certificate that is already
backed by the same renewable energy would otherwise be counted twice. The
amount of certificates ignored by this rule is returned as
``certificates_capped_mwh`` so the result stays auditable.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.services.exceptions import ServiceError
from app.utils.datasets import load_dataset
from app.utils.units import to_mwh

POLICY_FILE = "rpo_targets.json"

ENTITY_CATEGORIES = (
    "DISCOM",
    "Captive Consumer",
    "Open Access Consumer",
    "Other eligible entity",
)

# obligation key -> human label
OBLIGATION_CATEGORIES = {
    "total": "Total renewable (combined)",
    "wind": "Wind",
    "hydro": "Hydro",
    "distributed_re": "Distributed renewable energy",
    "other": "Other renewable",
}

ENERGY_UNITS = ("kWh", "MWh")

_STATUS_TOLERANCE_MWH = 0.01


@dataclass(frozen=True)
class RpoInputs:
    entity_name: str
    entity_category: str
    state: str
    year: str
    consumption: float
    consumption_unit: str
    renewable_procured: float
    certificates: float
    obligation_category: str


def load_policy() -> dict[str, Any]:
    return load_dataset(POLICY_FILE)


def policy_metadata() -> dict[str, Any]:
    policy = load_policy()
    return {
        "version": policy["version"],
        "framework": policy["framework"],
        "verified": policy.get("verified", False),
        "updated_at": policy.get("updated_at"),
        "source": policy.get("source", {}),
        "notes": policy.get("notes", []),
    }


def available_years() -> list[str]:
    years = {target["year"] for target in load_policy()["targets"]}
    return sorted(years)


def _target_for(category: str, year: str) -> dict[str, Any] | None:
    for target in load_policy()["targets"]:
        if target["year"] == year and target["category"] == category:
            return target
    return None


def resolve_target(
    entity_category: str, year: str, obligation_category: str
) -> dict[str, Any]:
    """Return the notified target for the selection or raise ``target_unavailable``."""
    if entity_category not in ENTITY_CATEGORIES:
        raise ServiceError(
            code="invalid_entity_category",
            message=(
                f"Unknown entity category '{entity_category}'. "
                f"Supported categories: {', '.join(ENTITY_CATEGORIES)}."
            ),
            status_code=422,
        )
    if obligation_category not in OBLIGATION_CATEGORIES:
        raise ServiceError(
            code="invalid_obligation_category",
            message=(
                f"Unknown obligation category '{obligation_category}'. "
                f"Supported categories: {', '.join(OBLIGATION_CATEGORIES)}."
            ),
            status_code=422,
        )

    if entity_category == "Other eligible entity":
        raise ServiceError(
            code="rpo_target_unavailable",
            message=(
                "No verified RPO target is configured for 'Other eligible entity'. "
                "Add the applicable regulator order to app/data/rpo_targets.json "
                "with its source before calculating compliance."
            ),
            status_code=422,
            details={"entity_category": entity_category, "year": year},
        )

    target = _target_for(entity_category, year)
    if target is None:
        raise ServiceError(
            code="rpo_target_unavailable",
            message=(
                f"No verified RPO target is configured for {entity_category} in "
                f"FY {year}. Available years: {', '.join(available_years())}."
            ),
            status_code=422,
            details={"entity_category": entity_category, "year": year},
        )

    sub_targets = target.get("sub_targets") or {}
    if obligation_category == "total":
        percent = float(target["total"])
        basis = "total"
    else:
        if not sub_targets:
            raise ServiceError(
                code="rpo_sub_target_unavailable",
                message=(
                    f"The notified target for {entity_category} in FY {year} is a single "
                    "total obligation; it is not split into wind/hydro/distributed/other "
                    "sub-targets. Select the total obligation category."
                ),
                status_code=422,
                details={
                    "entity_category": entity_category,
                    "year": year,
                    "available_obligations": ["total"],
                },
            )
        if obligation_category not in sub_targets:
            raise ServiceError(
                code="rpo_sub_target_unavailable",
                message=(
                    f"No {OBLIGATION_CATEGORIES[obligation_category]} sub-target is "
                    f"notified for {entity_category} in FY {year}."
                ),
                status_code=422,
                details={
                    "entity_category": entity_category,
                    "year": year,
                    "available_obligations": ["total", *sub_targets.keys()],
                },
            )
        percent = float(sub_targets[obligation_category])
        basis = "sub_target"

    policy = load_policy()
    return {
        "percent": percent,
        "basis": basis,
        "entity_category": entity_category,
        "obligation_category": obligation_category,
        "obligation_label": OBLIGATION_CATEGORIES[obligation_category],
        "year": year,
        "effective_from": target.get("effective_from"),
        "effective_to": target.get("effective_to"),
        "sub_targets": sub_targets or None,
        "framework": policy["framework"],
        "policy_version": policy["version"],
        "verified": policy.get("verified", False),
        "source": policy.get("source", {}),
    }


def calculate(inputs: RpoInputs) -> dict[str, Any]:
    if inputs.consumption_unit not in ENERGY_UNITS:
        raise ServiceError(
            code="invalid_unit",
            message=f"consumption_unit must be one of {', '.join(ENERGY_UNITS)}.",
            status_code=422,
        )

    consumption_mwh = to_mwh(inputs.consumption, inputs.consumption_unit)
    if consumption_mwh <= 0:
        raise ServiceError(
            code="invalid_consumption",
            message="Applicable electricity consumption must be greater than zero.",
            status_code=422,
        )
    if inputs.renewable_procured < 0 or inputs.certificates < 0:
        raise ServiceError(
            code="invalid_procurement",
            message="Renewable procurement and certificates cannot be negative.",
            status_code=422,
        )

    target = resolve_target(
        inputs.entity_category, inputs.year, inputs.obligation_category
    )

    required_mwh = consumption_mwh * target["percent"] / 100.0

    renewable_mwh = min(inputs.renewable_procured, consumption_mwh)
    renewable_rejected = max(inputs.renewable_procured - renewable_mwh, 0.0)
    remaining_after_re = max(required_mwh - renewable_mwh, 0.0)
    certificates_counted = min(inputs.certificates, remaining_after_re)
    certificates_capped = max(inputs.certificates - certificates_counted, 0.0)

    eligible_mwh = renewable_mwh + certificates_counted
    compliance_pct = (eligible_mwh / required_mwh * 100.0) if required_mwh > 0 else 0.0
    gap = eligible_mwh - required_mwh
    shortfall = max(-gap, 0.0)
    surplus = max(gap, 0.0)

    if abs(gap) <= _STATUS_TOLERANCE_MWH:
        status = "compliant"
    elif gap < 0:
        status = "shortfall"
    else:
        status = "surplus"

    notes: list[str] = []
    if renewable_rejected > 0:
        notes.append(
            "Renewable electricity above the applicable consumption was ignored; "
            "procurement cannot exceed the consumption it is measured against."
        )
    if certificates_capped > 0:
        notes.append(
            "Part of the declared certificates exceeded the remaining requirement "
            "and was not counted, to avoid double counting."
        )
    if target.get("basis") == "total" and target.get("sub_targets"):
        notes.append(
            "This compliance is measured against the total obligation. The notified "
            "order also sets wind, hydro, distributed and other sub-targets; use those "
            "categories to check each one independently."
        )

    return {
        "policy": {
            "version": target["policy_version"],
            "framework": target["framework"],
            "verified": target["verified"],
            "source": target["source"],
        },
        "inputs": {
            "entity_name": inputs.entity_name,
            "entity_category": inputs.entity_category,
            "state": inputs.state,
            "year": inputs.year,
            "consumption_mwh": round(consumption_mwh, 3),
            "consumption_unit": inputs.consumption_unit,
            "renewable_procured_mwh": round(inputs.renewable_procured, 3),
            "certificates_mwh": round(inputs.certificates, 3),
            "obligation_category": inputs.obligation_category,
        },
        "target": {
            **target,
            "required_mwh": round(required_mwh, 3),
            "required_kwh": round(required_mwh * 1000, 3),
        },
        "eligible": {
            "renewable_mwh": round(renewable_mwh, 3),
            "certificates_mwh": round(certificates_counted, 3),
            "certificates_capped_mwh": round(certificates_capped, 3),
            "renewable_rejected_mwh": round(renewable_rejected, 3),
            "total_mwh": round(eligible_mwh, 3),
        },
        "result": {
            "compliance_pct": round(compliance_pct, 2),
            "shortfall_mwh": round(shortfall, 3),
            "surplus_mwh": round(surplus, 3),
            "status": status,
        },
        "notes": notes,
    }
