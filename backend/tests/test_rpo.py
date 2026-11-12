import pytest

from app.services import rpo_engine
from app.services.exceptions import ServiceError


def _inputs(**overrides):
    base = dict(
        entity_name="Test DISCOM",
        entity_category="DISCOM",
        state="Rajasthan",
        year="2025-26",
        consumption=1000,
        consumption_unit="MWh",
        renewable_procured=0,
        certificates=0,
        obligation_category="total",
    )
    base.update(overrides)
    return rpo_engine.RpoInputs(**base)


def test_total_target_matches_notified_trajectory():
    target = rpo_engine.resolve_target("DISCOM", "2025-26", "total")
    assert target["percent"] == pytest.approx(33.01)
    assert target["verified"] is True
    assert "powermin.gov.in" in target["source"]["url"]


def test_shortfall_calculation():
    result = rpo_engine.calculate(
        _inputs(consumption=1000, renewable_procured=250)
    )
    assert result["target"]["required_mwh"] == pytest.approx(330.1, rel=1e-3)
    assert result["result"]["shortfall_mwh"] == pytest.approx(80.1, rel=1e-3)
    assert result["result"]["surplus_mwh"] == 0
    assert result["result"]["status"] == "shortfall"


def test_surplus_calculation():
    result = rpo_engine.calculate(
        _inputs(consumption=1000, renewable_procured=500)
    )
    assert result["result"]["surplus_mwh"] == pytest.approx(169.9, rel=1e-3)
    assert result["result"]["status"] == "surplus"


def test_exact_compliance():
    required = 1000 * 0.3301
    result = rpo_engine.calculate(
        _inputs(consumption=1000, renewable_procured=required)
    )
    assert result["result"]["status"] == "compliant"
    assert result["result"]["compliance_pct"] == pytest.approx(100.0, abs=0.01)


def test_certificates_are_capped_to_avoid_double_counting():
    result = rpo_engine.calculate(
        _inputs(consumption=1000, renewable_procured=100, certificates=900)
    )
    assert result["eligible"]["certificates_mwh"] == pytest.approx(230.1, rel=1e-3)
    assert result["eligible"]["certificates_capped_mwh"] == pytest.approx(669.9, rel=1e-3)
    assert result["result"]["compliance_pct"] == pytest.approx(100.0, abs=0.01)


def test_renewable_procurement_above_consumption_is_rejected():
    result = rpo_engine.calculate(
        _inputs(consumption=100, renewable_procured=150)
    )
    assert result["eligible"]["renewable_mwh"] == pytest.approx(100)
    assert result["eligible"]["renewable_rejected_mwh"] == pytest.approx(50)
    assert any("cannot exceed" in note for note in result["notes"])


def test_kwh_consumption_is_converted():
    result = rpo_engine.calculate(
        _inputs(consumption=1_000_000, consumption_unit="kWh")
    )
    assert result["inputs"]["consumption_mwh"] == pytest.approx(1000)
    assert result["target"]["required_mwh"] == pytest.approx(330.1, rel=1e-3)


def test_wind_sub_target_is_independent():
    target = rpo_engine.resolve_target("DISCOM", "2025-26", "wind")
    assert target["percent"] == pytest.approx(1.45)
    assert target["basis"] == "sub_target"


def test_captive_consumer_has_no_sub_targets():
    with pytest.raises(ServiceError) as error:
        rpo_engine.resolve_target("Captive Consumer", "2025-26", "wind")
    assert error.value.code == "rpo_sub_target_unavailable"


def test_unknown_year_reports_target_unavailable():
    with pytest.raises(ServiceError) as error:
        rpo_engine.resolve_target("DISCOM", "2035-36", "total")
    assert error.value.code == "rpo_target_unavailable"
    assert error.value.status_code == 422


def test_other_eligible_entity_has_no_invented_target():
    with pytest.raises(ServiceError) as error:
        rpo_engine.resolve_target("Other eligible entity", "2025-26", "total")
    assert error.value.code == "rpo_target_unavailable"


def test_zero_consumption_is_rejected():
    with pytest.raises(ServiceError):
        rpo_engine.calculate(_inputs(consumption=0))


def test_api_endpoint_returns_structured_result(client):
    response = client.post(
        "/api/v1/rpo/calculate",
        json={
            "entity_name": "Test DISCOM",
            "entity_category": "DISCOM",
            "state": "Rajasthan",
            "year": "2025-26",
            "consumption": 4200000,
            "consumption_unit": "MWh",
            "renewable_procured": 1310000,
            "certificates": 0,
            "obligation_category": "total",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["result"]["compliance_pct"] > 0
    assert body["target"]["source"]["url"].startswith("https://")


def test_api_rejects_unknown_year(client):
    response = client.post(
        "/api/v1/rpo/calculate",
        json={
            "year": "1999-00",
            "consumption": 100,
            "consumption_unit": "MWh",
            "entity_category": "DISCOM",
            "obligation_category": "total",
        },
    )
    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "rpo_target_unavailable"


def test_targets_endpoint_lists_policy_metadata(client):
    response = client.get("/api/v1/rpo/targets")
    assert response.status_code == 200
    body = response.json()
    assert body["policy"]["verified"] is True
    assert "2025-26" in body["years"]
    assert body["obligation_categories"]["total"]
