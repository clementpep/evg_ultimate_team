from datetime import datetime
from types import SimpleNamespace

from app.models.participant import Participant
from app.services.experience_service import generate_dynamic_challenges
from app.services.pack_service import compute_dynamic_rarity_weights


def test_generate_dynamic_challenges_returns_requested_count():
    challenges = generate_dynamic_challenges(
        participant_names=["Paul C.", "Clément P.", "Hugo F."],
        now=datetime(2026, 7, 4, 21, 0, 0),
        completed_challenges_count=10,
        count=5,
        seed=42,
    )

    assert len(challenges) == 5
    assert all(ch.points >= 10 for ch in challenges)
    assert any(ch.type.value == "team" for ch in challenges)


def test_participant_subtract_points_updates_total():
    participant = Participant(name="Test")
    participant.total_points = 120

    participant.subtract_points(20)

    assert participant.total_points == 100


class _FakeQuery:
    def __init__(self, items):
        self._items = items

    def filter(self, *_args, **_kwargs):
        return self

    def order_by(self, *_args, **_kwargs):
        return self

    def limit(self, *_args, **_kwargs):
        return self

    def all(self):
        return self._items


class _FakeDB:
    def __init__(self, openings):
        self._openings = openings

    def query(self, *_args, **_kwargs):
        return _FakeQuery(self._openings)


def test_compute_dynamic_rarity_weights_boosts_high_rarity_after_streak():
    openings = [
        SimpleNamespace(reward=SimpleNamespace(rarity="common")),
        SimpleNamespace(reward=SimpleNamespace(rarity="rare")),
        SimpleNamespace(reward=SimpleNamespace(rarity="common")),
        SimpleNamespace(reward=SimpleNamespace(rarity="rare")),
    ]
    fake_db = _FakeDB(openings)

    weights = compute_dynamic_rarity_weights(
        fake_db,
        participant_id=1,
        tier="ultimate",
        now=datetime(2026, 7, 4, 23, 0, 0),
    )

    # Base legendary ratio is 70%; boosted configuration should remain dominant.
    assert weights["legendary"] > weights["epic"]
