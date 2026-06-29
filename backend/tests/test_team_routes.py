"""
Route-level tests for the team composition endpoints.

Uses an in-memory DB via dependency override and real JWT tokens to exercise
the groom/admin guard end-to-end. TestClient is created WITHOUT a context
manager so the app lifespan (which would seed the real dev DB) does not run.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import Participant, TeamComposition  # noqa: F401
from app.utils.security import (
    create_access_token,
    create_participant_token_data,
    create_admin_token_data,
)


@pytest.fixture
def client():
    # StaticPool shares a single in-memory connection across threads so the
    # TestClient worker thread sees the same schema/data created here.
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = Session()
    session.add(Participant(name="Paul C.", is_groom=True, total_points=0,
                            current_packs={"bronze": 0, "silver": 0, "gold": 0, "ultimate": 0}))
    for i in range(2, 14):
        session.add(Participant(name=f"Joueur {i}", is_groom=False, total_points=0,
                                current_packs={"bronze": 0, "silver": 0, "gold": 0, "ultimate": 0}))
    session.commit()

    def _override_get_db():
        try:
            yield session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()
        session.close()


def _auth(token_data: dict) -> dict:
    return {"Authorization": f"Bearer {create_access_token(token_data)}"}


def test_get_composition_any_participant(client):
    headers = _auth(create_participant_token_data(2, "Joueur 2", is_groom=False))
    res = client.get("/api/team/composition", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert len(body["data"]["unplaced"]) == 13


def test_put_composition_as_groom(client):
    headers = _auth(create_participant_token_data(1, "Paul C.", is_groom=True))
    payload = {"team_a": [1, None, 3], "team_b": [4, 5], "bench": [6]}
    res = client.put("/api/team/composition", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert [p["id"] for p in data["team_a"]] == [1, 3]
    assert data["team_a_slots"][1]["participant"] is None
    assert data["team_a_slots"][2]["participant"]["id"] == 3
    assert len(data["unplaced"]) == 13 - 5


def test_put_composition_as_admin(client):
    headers = _auth(create_admin_token_data(0, "clement"))
    res = client.put("/api/team/composition", json={"team_a": [1]}, headers=headers)
    assert res.status_code == 200


def test_put_composition_forbidden_for_regular_participant(client):
    headers = _auth(create_participant_token_data(2, "Joueur 2", is_groom=False))
    res = client.put("/api/team/composition", json={"team_a": [2]}, headers=headers)
    assert res.status_code == 403


def test_put_composition_rejects_duplicate(client):
    headers = _auth(create_participant_token_data(1, "Paul C.", is_groom=True))
    res = client.put("/api/team/composition", json={"team_a": [1], "bench": [1]}, headers=headers)
    assert res.status_code == 400
