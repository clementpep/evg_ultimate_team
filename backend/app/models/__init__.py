"""
Database models for EVG Ultimate Team.

This module exports all SQLAlchemy models and related enums.
"""

from app.models.participant import Participant
from app.models.challenge import (
    Challenge,
    ChallengeType,
    ChallengeStatus,
    challenge_assignments,
    challenge_completions
)
from app.models.points_transaction import PointsTransaction
from app.models.pack_reward import PackReward
from app.models.pack_opening import PackOpening
from app.models.team_composition import TeamComposition

__all__ = [
    # Models
    "Participant",
    "Challenge",
    "PointsTransaction",
    "PackReward",
    "PackOpening",
    "TeamComposition",
    # Enums
    "ChallengeType",
    "ChallengeStatus",
    # Association tables
    "challenge_assignments",
    "challenge_completions",
]
