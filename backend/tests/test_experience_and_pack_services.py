from app.models.participant import Participant


def test_participant_subtract_points_updates_total():
    participant = Participant(name="Test")
    participant.total_points = 120

    participant.subtract_points(20)

    assert participant.total_points == 100
