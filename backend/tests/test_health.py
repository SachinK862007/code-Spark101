def test_health_reports_ok(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] == "ok"
    assert set(body["integrations"]) == {"google_search", "weather", "voice"}
    assert body["integrations"]["weather"] is False


def test_database_initialises_with_conversation_table(client):
    from sqlalchemy import inspect

    from app.database.session import engine

    tables = inspect(engine).get_table_names()
    assert "conversation_turns" in tables


def test_openapi_document_is_served(client):
    response = client.get("/openapi.json")
    assert response.status_code == 200
    paths = response.json()["paths"]
    assert "/api/v1/rpo/calculate" in paths
    assert "/api/v1/weather/current" in paths
