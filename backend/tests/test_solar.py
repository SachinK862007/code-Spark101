import pytest

from app.services import solar_calculator
from app.services.exceptions import ServiceError


def _inputs(**overrides):
    base = dict(
        state="Rajasthan",
        city="Jaipur",
        monthly_bill=4200,
        monthly_consumption_kwh=512,
        tariff=8.2,
        roof_area_sqft=620,
        system_capacity_kw=None,
        consumer_category="residential",
        system_type="ongrid",
    )
    base.update(overrides)
    return solar_calculator.SolarInputs(**base)


def test_residential_result_has_expected_shape():
    result = solar_calculator.calculate(_inputs())
    assert result["sizing"]["recommended_capacity_kw"] > 0
    assert result["returns"]["annual_generation_kwh"] > 0
    assert result["cost"]["net_investment_inr"] == (
        result["cost"]["install_cost_inr"] - result["cost"]["subsidy_estimate_inr"]
    )
    assert result["subsidy_source"]["source_url"].startswith("https://solarrooftop.gov.in")


def test_subsidy_is_capped():
    result = solar_calculator.calculate(_inputs(system_capacity_kw=10))
    assert result["cost"]["subsidy_estimate_inr"] == 78000


def test_commercial_gets_no_residential_subsidy():
    result = solar_calculator.calculate(
        _inputs(system_capacity_kw=10, consumer_category="commercial")
    )
    assert result["cost"]["subsidy_estimate_inr"] == 0
    assert "commercial" in result["cost"]["subsidy_note"].lower()


def test_roof_area_limits_system_size():
    small_roof = solar_calculator.calculate(
        _inputs(roof_area_sqft=100, system_capacity_kw=None)
    )
    assert small_roof["sizing"]["recommended_capacity_kw"] == pytest.approx(1.0)


def test_offgrid_costs_more_than_ongrid():
    ongrid = solar_calculator.calculate(_inputs(system_capacity_kw=5))
    offgrid = solar_calculator.calculate(_inputs(system_capacity_kw=5, system_type="offgrid"))
    assert offgrid["cost"]["install_cost_inr"] > ongrid["cost"]["install_cost_inr"]


def test_payback_is_positive():
    result = solar_calculator.calculate(_inputs())
    assert result["returns"]["payback_years"] > 0
    assert result["returns"]["lifetime_savings_inr"] > 0


def test_invalid_system_type_is_rejected():
    with pytest.raises(ServiceError):
        solar_calculator.calculate(_inputs(system_type="fusion"))


def test_insufficient_inputs_are_rejected():
    with pytest.raises(ServiceError) as error:
        solar_calculator.calculate(
            _inputs(monthly_consumption_kwh=None, monthly_bill=None, roof_area_sqft=None)
        )
    assert error.value.code == "insufficient_inputs"


def test_api_endpoint(client):
    response = client.post(
        "/api/v1/solar/calculate",
        json={
            "state": "Karnataka",
            "city": "Bengaluru",
            "monthly_bill": 3000,
            "monthly_consumption_kwh": 320,
            "tariff": 8.0,
            "roof_area_sqft": 400,
            "consumer_category": "residential",
            "system_type": "hybrid",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["returns"]["payback_years"] is not None
    assert body["sizing"]["recommended_capacity_kw"] > 0
