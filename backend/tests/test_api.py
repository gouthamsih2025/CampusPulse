import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app.models.category import Category
from app.models.enums import TicketSeverity, TicketStatus

# Test SQLite in-memory database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_campuspulse.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Ensure test category exists
    cat = db.query(Category).filter(Category.name == "Air Conditioning (HVAC)").first()
    if not cat:
        db.add(Category(name="Air Conditioning (HVAC)", icon="Wind", description="AC repairs", sla_hours=12))
        db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_triage_preview_endpoint():
    payload = {
        "raw_text": "The AC in AB1-305 has been leaking water since morning and students are almost slipping."
    }
    response = client.post("/api/v1/tickets/triage-preview", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Air Conditioning" in data["category_name"]
    assert "AB1-305" in data["room"]
    assert data["severity"] in ["HIGH", "CRITICAL"]
    assert data["hazard_detected"] is True


def test_create_and_get_ticket():
    # 1. Get category ID
    cat_resp = client.get("/api/v1/categories")
    assert cat_resp.status_code == 200
    cat_id = cat_resp.json()[0]["id"]

    # 2. Create Ticket
    ticket_payload = {
        "title": "Water dripping in Lab",
        "description": "The AC in AB1-305 has been leaking water since morning and students are almost slipping.",
        "category_id": cat_id,
        "building": "Academic Block 1",
        "room": "AB1-305",
        "severity": "HIGH",
        "reporter_name": "Test Student",
        "reporter_email": "test@student.campus.edu",
        "auto_triage": True
    }
    create_resp = client.post("/api/v1/tickets", json=ticket_payload)
    assert create_resp.status_code == 201
    ticket = create_resp.json()
    assert ticket["ticket_code"].startswith("CP-")
    assert ticket["status"] == "OPEN"

    # 3. Retrieve ticket by code
    get_resp = client.get(f"/api/v1/tickets/{ticket['ticket_code']}")
    assert get_resp.status_code == 200
    detail = get_resp.json()
    assert detail["id"] == ticket["id"]
    assert len(detail["audit_logs"]) >= 1


def test_update_ticket_status_and_audit():
    # 1. Create
    cat_resp = client.get("/api/v1/categories")
    cat_id = cat_resp.json()[0]["id"]
    ticket_payload = {
        "title": "Broken Switchboard",
        "description": "Sparking switch in Room 102",
        "category_id": cat_id,
        "building": "Academic Block 2",
        "room": "Room 102",
        "severity": "CRITICAL",
        "reporter_name": "Faculty Member",
        "reporter_email": "faculty@campus.edu",
        "auto_triage": True
    }
    t = client.post("/api/v1/tickets", json=ticket_payload).json()

    # 2. Update status
    patch_resp = client.patch(f"/api/v1/tickets/{t['id']}", json={
        "status": "IN_PROGRESS",
        "admin_actor_name": "Lead Technician",
        "resolution_notes": "Assigned technician on site"
    })
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "IN_PROGRESS"

    # 3. Verify audit log & comment
    detail = client.get(f"/api/v1/tickets/{t['id']}").json()
    actions = [a["action"] for a in detail["audit_logs"]]
    assert "STATUS_CHANGED" in actions
