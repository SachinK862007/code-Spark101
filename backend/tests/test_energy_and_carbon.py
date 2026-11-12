import pytest

from app.services import carbon_service, energy_service
from app.services.exceptions import ServiceError


def test_capacity_and_generation_are_separate(client):
    capacity = client.get("/api/v1/energy/capacity").json()
    generation = client.get("/api/v1/energy/generation").json()

    assert capacity["unit"] == "MW"
    assert generation["unit"] == "GWh"
    assert capacity["data_kind"] == "capacity"
    assert generation["data_kind"] == "generation"
    assert capacity["meta"]["status"] == "reference"


def test_mix_endpoint_returns_both_metrics(client):
    body = client.get("/api/v1/energy/mix").json()
    assert "capacity" in body and "generation" in body
    assert body["capacity"]["total_mw"] > body["generation"]["total_gwh"] / 1e6


def test_renewable_share_is_computed_from_generation():
    generation = energy_service.generation_mix()
    assert 0 < generation["shares"]["renewable_pct"] < 100
    assert generation["shares"]["fossil_pct"] > 0


def test_renewable_contribution_calculation(client):
    response = client.post(
        "/api/v1/energy/calculate",
        json={"total_mwh": 1000, "renewable_mwh": 350, "non_fossil_mwh": 400},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["result"]["renewable_share_pct"] == pytest.approx(35.0)


def test_renewable_share_cannot_exceed_total():
    with pytest.raises(ServiceError):
        carbon_service.renewable_contribution(total_mwh=100, renewable_mwh=150)


def test_requirement_calculation(client):
    response = client.post(
        "/api/v1/energy/requirement",
        json={"total_mwh": 1000, "target_pct": 30, "existing_renewable_mwh": 100},
    )
    body = response.json()
    assert body["result"]["required_renewable_mwh"] == pytest.approx(300)
    assert body["result"]["remaining_requirement_mwh"] == pytest.approx(200)
    assert body["result"]["met"] is False


def test_carbon_avoidance(client):
    response = client.post(
        "/api/v1/environment/carbon-calculate",
        json={"energy_mwh": 1000, "unit": "MWh", "emission_factor_source": "grid"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["result"]["co2_avoided_kg"] == pytest.approx(710000)
    assert body["result"]["co2_avoided_tonnes"] == pytest.approx(710)


def test_carbon_rejects_unknown_factor_source(client):
    response = client.post(
        "/api/v1/environment/carbon-calculate",
        json={"energy_mwh": 10, "unit": "MWh", "emission_factor_source": "wood"},
    )
    assert response.status_code == 422


def test_environment_endpoint_labels_reference_data(client):
    body = client.get("/api/v1/environment").json()
    assert body["data_status"] == "reference"
    assert "not live CPCB" in body["air_quality_note"]
