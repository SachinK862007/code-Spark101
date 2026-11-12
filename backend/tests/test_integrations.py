def test_ask_reports_search_not_configured(client):
    response = client.post("/api/v1/ask", json={"question": "What is India's solar capacity?"})
    assert response.status_code == 503
    detail = response.json()["detail"]
    assert detail["code"] == "search_not_configured"
    assert "GOOGLE_SEARCH_API_KEY" in detail["message"]


def test_weather_status_is_explicit(client):
    body = client.get("/api/v1/weather/status").json()
    assert body["configured"] is False
    assert "OPENWEATHER_API_KEY" in body["message"]


def test_current_weather_reports_missing_key(client):
    response = client.get("/api/v1/weather/current", params={"city": "Bengaluru"})
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "weather_not_configured"


def test_forecast_reports_missing_key(client):
    response = client.get("/api/v1/weather/forecast", params={"city": "Pune"})
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "weather_not_configured"


def test_voice_status_explains_what_is_missing(client):
    body = client.get("/api/v1/voice/status").json()
    assert body["configured"] is False
    assert body["fallback"] == "browser_web_speech"
    assert len(body["supported_actions"]) >= 6


def test_voice_transcribe_without_credentials(client):
    response = client.post(
        "/api/v1/voice/transcribe",
        files={"audio": ("clip.webm", b"fake-audio", "audio/webm")},
        data={"language": "en-IN"},
    )
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "voice_not_configured"


def test_ask_rejects_validation_errors(client):
    response = client.post("/api/v1/ask", json={"question": ""})
    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "validation_error"


def test_forecast_estimate_falls_back_without_weather(client):
    response = client.post(
        "/api/v1/forecasting/estimate",
        json={
            "location": "Bengaluru",
            "technology": "solar",
            "capacity_mw": 10,
            "horizon_days": 2,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["method"]["kind"] == "rule_based_estimate"
    assert body["method"]["weather_used"] is False
    assert len(body["daily"]) == 2
    assert body["data_status"] == "estimate"


def test_battery_sizing(client):
    response = client.post(
        "/api/v1/forecasting/battery",
        json={"daily_energy_kwh": 100, "autonomy_days": 1},
    )
    body = response.json()
    assert body["result"]["required_capacity_kwh"] > 100


def test_history_is_scoped_and_empty(client):
    response = client.get("/api/v1/ask/history", headers={"X-Session-Id": "session-abc123"})
    assert response.status_code == 200
    assert response.json()["count"] == 0
