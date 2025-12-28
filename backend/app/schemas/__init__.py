"""
Pydantic schemas for EVG Ultimate Team API.

This module exports all request and response schemas.
"""

# Common schemas
from app.schemas.common import (
    APIResponse,
    SuccessResponse,
    ErrorResponse,
    PaginationParams,
    PaginatedResponse
)

# Participant schemas
from app.schemas.participant import (
    ParticipantCreate,
    ParticipantUpdate,
    ParticipantResponse,
    ParticipantSummary,
    ParticipantWithRank
)

# Challenge schemas
from app.schemas.challenge import (
    ChallengeCreate,
    ChallengeUpdate,
    ChallengeAttempt,
    ChallengeValidation,
    ChallengeResponse,
    ChallengeSummary
)

# Points transaction schemas
from app.schemas.points import (
    PointsAdd,
    PointsSubtract,
    PointsTransactionResponse,
    PointsTransactionSummary,
    PointsHistory
)

# Authentication schemas
from app.schemas.auth import (
    ParticipantLogin,
    AdminLogin,
    AuthToken,
    CurrentUser
)

__all__ = [
    # Common
    "APIResponse",
    "SuccessResponse",
    "ErrorResponse",
    "PaginationParams",
    "PaginatedResponse",
    # Participant
    "ParticipantCreate",
    "ParticipantUpdate",
    "ParticipantResponse",
    "ParticipantSummary",
    "ParticipantWithRank",
    # Challenge
    "ChallengeCreate",
    "ChallengeUpdate",
    "ChallengeAttempt",
    "ChallengeValidation",
    "ChallengeResponse",
    "ChallengeSummary",
    # Points
    "PointsAdd",
    "PointsSubtract",
    "PointsTransactionResponse",
    "PointsTransactionSummary",
    "PointsHistory",
    # Auth
    "ParticipantLogin",
    "AdminLogin",
    "AuthToken",
    "CurrentUser",
]
