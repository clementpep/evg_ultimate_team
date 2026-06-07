import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
# Import models so they register on Base.metadata before create_all
from app.models import Participant, TeamComposition  # noqa: F401
from app.schemas.team import TeamCompositionUpdate
from app.services import team_service


@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = Session()
    # Seed 13 participants (ids 1..13), Paul C. as groom
    session.add(Participant(name="Paul C.", is_groom=True, total_points=0,
                            current_packs={"bronze": 0, "silver": 0, "gold": 0, "ultimate": 0}))
    for i in range(2, 14):
        session.add(Participant(name=f"Joueur {i}", is_groom=False, total_points=0,
                                current_packs={"bronze": 0, "silver": 0, "gold": 0, "ultimate": 0}))
    session.commit()
    try:
        yield session
    finally:
        session.close()


def test_get_composition_defaults_to_all_unplaced(db):
    comp = team_service.get_composition(db)
    assert comp.team_a == []
    assert comp.team_b == []
    assert comp.bench == []
    assert len(comp.unplaced) == 13
    assert comp.team_a_name == "Les Bleus"
    assert comp.team_b_name == "Les Rouges"


def test_update_composition_places_players(db):
    data = TeamCompositionUpdate(
        team_a=[1, 2, 3, 4, 5],
        team_b=[6, 7, 8, 9, 10],
        bench=[11, 12, 13],
        team_a_name="PSG",
    )
    comp = team_service.update_composition(db, data, editor_id=1)

    assert [p.id for p in comp.team_a] == [1, 2, 3, 4, 5]
    assert [p.id for p in comp.team_b] == [6, 7, 8, 9, 10]
    assert [p.id for p in comp.bench] == [11, 12, 13]
    assert comp.unplaced == []
    assert comp.team_a_name == "PSG"
    # Order within a team is preserved (slot order)
    assert comp.team_a[0].id == 1


def test_update_composition_rejects_duplicate_player(db):
    data = TeamCompositionUpdate(team_a=[1, 2], team_b=[2, 3])
    with pytest.raises(ValueError):
        team_service.update_composition(db, data)


def test_update_composition_rejects_oversized_team(db):
    data = TeamCompositionUpdate(team_a=[1, 2, 3, 4, 5, 6])
    with pytest.raises(ValueError):
        team_service.update_composition(db, data)


def test_update_composition_rejects_oversized_bench(db):
    data = TeamCompositionUpdate(bench=[1, 2, 3, 4])
    with pytest.raises(ValueError):
        team_service.update_composition(db, data)


def test_update_composition_rejects_unknown_player(db):
    data = TeamCompositionUpdate(team_a=[999])
    with pytest.raises(ValueError):
        team_service.update_composition(db, data)


def test_partial_composition_is_allowed(db):
    data = TeamCompositionUpdate(team_a=[1, 2], team_b=[3])
    comp = team_service.update_composition(db, data)
    assert len(comp.team_a) == 2
    assert len(comp.team_b) == 1
    assert len(comp.unplaced) == 10
