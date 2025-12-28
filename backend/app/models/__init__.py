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

__all__ = [
    # Models
    "Participant",
    "Challenge",
    "PointsTransaction",
    # Enums
    "ChallengeType",
    "ChallengeStatus",
    # Association tables
    "challenge_assignments",
    "challenge_completions",
]
