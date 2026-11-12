"""Rooftop solar ROI calculator.

Every assumption is read from `app/data/solar_assumptions.json` so the numbers
can be updated without touching code. Results are planning estimates; the
subsidy is reported as an *estimate subject to approval*, never as a guarantee.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.services.exceptions import ServiceError
from app.utils.datasets import load_dataset

ASSUMPTIONS_FILE = "solar_assumptions.json"

CONSUMER_CATEGORIES = ("residential", "commercial")
SYSTEM_TYPES = ("ongrid", "offgrid", "hybrid")
REFERENCE_PERFORMANCE_RATIO = 0.78


@dataclass(frozen=True)
class SolarInputs:
    state: str
    city: str | None
    monthly_bill: float | None
    monthly_consumption_kwh: float | None
    tariff: float | None
    roof_area_sqft: float | None
    system_capacity_kw: float | None
    consumer_category: str
    system_type: str


def assumptions() -> dict[str, Any]:
    return load_dataset(ASSUMPTIONS_FILE)


def _subsidy_for(
    capacity_kw: float, install_cost: float, consumer_category: str
) -> tuple[float, str]:
    config = assumptions()["subsidy"]
    if consumer_category != "residential":
        return 0.0, (
            "No residential capital subsidy is applied to commercial systems. "
            "Other incentives may exist but are not assumed here."
        )

    rules = config["residential"]
    first_slab = min(capacity_kw, 2.0) * rules["first_2kw_per_kw"]
    third_slab = max(min(capacity_kw, 3.0) - 2.0, 0.0) * rules["third_kw_per_kw"]
    raw = first_slab + third_slab
    subsidy = min(raw, rules["cap"])
    note = (
        f"Estimated under {config['scheme']}: {raw:,.0f} before the "
        f"{rules['cap']:,.0f} cap. Disbursal depends on DISCOM approval, "
        "vendor registration and inspection."
    )
    return subsidy, note


def calculate(inputs: SolarInputs) -> dict[str, Any]:
    if inputs.consumer_category not in CONSUMER_CATEGORIES:
        raise ServiceError(
            code="invalid_consumer_category",
            message=f"consumer_category must be one of {', '.join(CONSUMER_CATEGORIES)}.",
            status_code=422,
        )
    if inputs.system_type not in SYSTEM_TYPES:
        raise ServiceError(
            code="invalid_system_type",
            message=f"system_type must be one of {', '.join(SYSTEM_TYPES)}.",
            status_code=422,
        )

    config = assumptions()
    system = config["system"]
    tariff = inputs.tariff or 8.0
    monthly_consumption = inputs.monthly_consumption_kwh or 0.0

    if not monthly_consumption and inputs.monthly_bill:
        monthly_consumption = inputs.monthly_bill / tariff
    if monthly_consumption <= 0 and not inputs.roof_area_sqft and not inputs.system_capacity_kw:
        raise ServiceError(
            code="insufficient_inputs",
            message=(
                "Provide monthly consumption (or a monthly bill), available roof area, "
                "or a known system capacity so the system can be sized."
            ),
            status_code=422,
        )

    specific_yield = config["yield_kwh_per_kwp_by_state"].get(
        inputs.state, config["default_yield_kwh_per_kwp"]
    )
    performance_ratio = system["performance_ratio"]
    yield_at_reference_pr = specific_yield * (
        performance_ratio / REFERENCE_PERFORMANCE_RATIO
    )
    type_factor = system["system_type_factor"][inputs.system_type]

    consumption_capacity = (
        (monthly_consumption * 12) / yield_at_reference_pr
        if monthly_consumption and yield_at_reference_pr > 0
        else None
    )
    roof_capacity = (
        inputs.roof_area_sqft / system["area_sqft_per_kw"]
        if inputs.roof_area_sqft
        else None
    )

    if inputs.system_capacity_kw:
        capacity = inputs.system_capacity_kw
        sizing_basis = "user_supplied_capacity"
    elif consumption_capacity and roof_capacity:
        capacity = min(consumption_capacity, roof_capacity)
        sizing_basis = "lower_of_consumption_and_roof_area"
    else:
        capacity = consumption_capacity or roof_capacity or 0.0
        sizing_basis = "consumption" if consumption_capacity else "roof_area"

    capacity = max(0.5, round(capacity * 2) / 2)
    annual_generation = capacity * yield_at_reference_pr * type_factor

    cost_per_kw = system["cost_per_kw"][inputs.consumer_category]
    install_cost = capacity * cost_per_kw * type_factor
    subsidy, subsidy_note = _subsidy_for(capacity, install_cost, inputs.consumer_category)
    net_investment = max(install_cost - subsidy, 0.0)

    annual_consumption = monthly_consumption * 12 if monthly_consumption else 0.0
    self_consumed = (
        min(annual_generation, annual_consumption) if annual_consumption else annual_generation
    )
    exported = max(annual_generation - self_consumed, 0.0)
    annual_savings = self_consumed * tariff + exported * tariff * 0.25

    payback_years = net_investment / annual_savings if annual_savings > 0 else None

    lifetime = int(system["lifetime_years"])
    degradation = float(system["degradation_per_year"])
    escalation = float(system["tariff_escalation"])
    maintenance = float(system["annual_maintenance_inr"])
    maintenance_escalation = float(system["maintenance_escalation"])

    lifetime_savings = 0.0
    lifetime_generation = 0.0
    for year in range(lifetime):
        factor = (1 - degradation) ** year
        generation = annual_generation * factor
        lifetime_generation += generation
        savings = savings_for_year(
            generation=generation,
            annual_consumption=annual_consumption,
            tariff=tariff,
            escalation=escalation,
            year=year,
            exported_rate=0.25,
        )
        lifetime_savings += savings - maintenance * ((1 + maintenance_escalation) ** year)

    co2_avoided_kg_per_year = annual_generation * float(system["co2_kg_per_kwh"])

    return {
        "inputs": {
            "state": inputs.state,
            "city": inputs.city,
            "monthly_bill": inputs.monthly_bill,
            "monthly_consumption_kwh": round(monthly_consumption, 1),
            "tariff": tariff,
            "roof_area_sqft": inputs.roof_area_sqft,
            "system_capacity_kw": inputs.system_capacity_kw,
            "consumer_category": inputs.consumer_category,
            "system_type": inputs.system_type,
        },
        "sizing": {
            "recommended_capacity_kw": round(capacity, 2),
            "basis": sizing_basis,
            "specific_yield_kwh_per_kwp": round(yield_at_reference_pr, 1),
            "performance_ratio": performance_ratio,
            "system_type_factor": type_factor,
        },
        "cost": {
            "install_cost_inr": round(install_cost),
            "subsidy_estimate_inr": round(subsidy),
            "net_investment_inr": round(net_investment),
            "cost_per_kw_inr": cost_per_kw,
            "subsidy_note": subsidy_note,
        },
        "returns": {
            "annual_generation_kwh": round(annual_generation),
            "self_consumed_kwh": round(self_consumed),
            "exported_kwh": round(exported),
            "annual_savings_inr": round(annual_savings),
            "monthly_savings_inr": round(annual_savings / 12),
            "payback_years": round(payback_years, 2) if payback_years else None,
            "lifetime_years": lifetime,
            "lifetime_savings_inr": round(lifetime_savings),
            "lifetime_generation_kwh": round(lifetime_generation),
            "co2_avoided_kg_per_year": round(co2_avoided_kg_per_year),
            "co2_avoided_tonnes_per_year": round(co2_avoided_kg_per_year / 1000, 2),
        },
        "assumptions": {
            "cost_per_kw_inr": cost_per_kw,
            "degradation_per_year": degradation,
            "tariff_escalation": escalation,
            "annual_maintenance_inr": maintenance,
            "export_credit_rate_fraction": 0.25,
            "co2_kg_per_kwh": system["co2_kg_per_kwh"],
        },
        "subsidy_source": {
            "scheme": config["subsidy"]["scheme"],
            "source_name": config["subsidy"]["source_name"],
            "source_url": config["subsidy"]["source_url"],
            "last_verified": config["subsidy"]["last_verified"],
        },
        "disclaimer": (
            "All outputs are planning estimates based on configurable assumptions, "
            "not a quotation. Subsidy eligibility and installation cost must be "
            "confirmed with the national portal, your DISCOM and a registered vendor."
        ),
    }


def savings_for_year(
    *,
    generation: float,
    annual_consumption: float,
    tariff: float,
    escalation: float,
    year: int,
    exported_rate: float,
) -> float:
    year_tariff = tariff * ((1 + escalation) ** year)
    self_consumed = (
        min(generation, annual_consumption) if annual_consumption else generation
    )
    exported = max(generation - self_consumed, 0.0)
    return self_consumed * year_tariff + exported * year_tariff * exported_rate
