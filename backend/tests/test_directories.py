def test_services_exclude_transport_and_passport(client):
    body = client.get("/api/v1/services").json()
    names = {row["name"] for row in body["services"]}
    categories = {row["category"] for row in body["services"]}

    assert "Passport Seva Kendra" not in names
    assert "Driving Licence Renewal" not in names
    assert "Transport and RTO" not in categories
    assert "Passport services" not in categories
    assert "Rooftop Solar Subsidy" in names
    assert body["count"] == len(body["services"])


def test_services_category_filter(client):
    body = client.get("/api/v1/services", params={"category": "Healthcare"}).json()
    assert body["count"] >= 1
    assert all(row["category"] == "Healthcare" for row in body["services"])


def test_service_detail_and_404(client):
    assert client.get("/api/v1/services/rooftop-solar-subsidy").status_code == 200
    assert client.get("/api/v1/services/does-not-exist").status_code == 404


def test_map_locations_are_not_random(client):
    body = client.get("/api/v1/maps/locations").json()
    assert body["count"] >= 5
    for row in body["locations"]:
        assert row["source_url"].startswith("https://")
        assert -90 <= row["latitude"] <= 90
        assert -180 <= row["longitude"] <= 180
        assert "OpenStreetMap" in body["attribution"]


def test_map_renewable_group_filter(client):
    body = client.get("/api/v1/maps/locations", params={"group": "renewable"}).json()
    assert body["count"] >= 2
    assert all(row["category"] in {"solar", "wind", "hydro"} for row in body["locations"])


def test_map_rejects_unknown_category(client):
    response = client.get("/api/v1/maps/locations", params={"category": "teleport"})
    assert response.status_code == 422


def test_jobs_are_labelled_illustrative(client):
    body = client.get("/api/v1/jobs").json()
    assert body["data_status"] == "illustrative"
    assert "not live vacancies" in body["disclaimer"]


def test_finance_does_not_invent_rates(client):
    body = client.get("/api/v1/finance").json()
    assert all(product["interest_rate"] is None for product in body["products"])


def test_circularity_lists_official_registers(client):
    body = client.get("/api/v1/circularity").json()
    urls = {resource["url"] for resource in body["resources"]}
    assert any("cpcb.nic.in" in url for url in urls)


def test_data_sources_include_provenance(client):
    body = client.get("/api/v1/data-sources").json()
    assert body["count"] >= 6
    assert all("data_status" in row for row in body["sources"])
