"""
Pydantic schemas for Challenge model.

Defines request and response schemas for challenge-related API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.challenge import ChallengeType, ChallengeStatus


# =============================================================================
# Base Schemas
# =============================================================================

class ChallengeBase(BaseModel):
    """
    Base schema with common challenge fields.

    Used as a base for other challenge schemas.
    """
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Short title of the challenge",
        examples=["Win a 1v1 FIFA match against Paul"]
    )
    description: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Detailed description of the challenge"
    )
    type: ChallengeType = Field(
        ...,
        description="Type of challenge (individual, team, secret)"
    )
    points: int = Field(
        ...,
        ge=1,
        description="Points awarded for completing the challenge",
        examples=[50]
    )


# =============================================================================
# Request Schemas
# =============================================================================

class ChallengeCreate(ChallengeBase):
    """
    Schema for creating a new challenge.

    Used in POST /api/challenges (admin only)
    """
    assigned_to: Optional[list[int]] = Field(
        default=None,
        description="List of participant IDs to assign this challenge to"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "Win a 1v1 FIFA match against Paul",
                "description": "Challenge Paul to a FIFA match and win. Best of 3 games.",
                "type": "individual",
                "points": 50,
                "assigned_to": [2, 3, 4]
            }
        }


class ChallengeUpdate(BaseModel):
    """
    Schema for updating a challenge.

    All fields are optional to allow partial updates.
    Used in PUT /api/challenges/{id} (admin only)
    """
    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Short title of the challenge"
    )
    description: Optional[str] = Field(
        None,
        min_length=1,
        max_length=1000,
        description="Detailed description of the challenge"
    )
    type: Optional[ChallengeType] = Field(
        None,
        description="Type of challenge (individual, team, secret)"
    )
    points: Optional[int] = Field(
        None,
        ge=1,
        description="Points awarded for completing the challenge"
    )
    status: Optional[ChallengeStatus] = Field(
        None,
        description="Challenge status (pending, active, completed, failed)"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "points": 75,
                "status": "active"
            }
        }


class ChallengeAttempt(BaseModel):
    """
    Schema for marking a challenge as being attempted.

    Used in POST /api/challenges/{id}/attempt
    """
    participant_id: int = Field(
        ...,
        description="ID of participant attempting the challenge"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "participant_id": 5
            }
        }


class ChallengeValidation(BaseModel):
    """
    Schema for validating a challenge completion.

    Used in POST /api/challenges/{id}/validate (admin only)
    """
    participant_ids: list[int] = Field(
        ...,
        min_length=1,
        description="List of participant IDs who completed the challenge"
    )
    status: ChallengeStatus = Field(
        ...,
        description="Validation result (completed or failed)"
    )
    admin_id: int = Field(
        ...,
        description="ID of admin validating the challenge"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "participant_ids": [5],
                "status": "completed",
                "admin_id": 1
            }
        }


# =============================================================================
# Response Schemas
# =============================================================================

class ChallengeResponse(ChallengeBase):
    """
    Schema for challenge responses.

    Includes all challenge data.
    Used in GET requests and as part of other responses.
    """
    id: int = Field(..., description="Unique challenge ID")
    status: ChallengeStatus = Field(..., description="Current challenge status")
    assigned_to: list[int] = Field(
        ...,
        description="List of participant IDs assigned to this challenge"
    )
    completed_by: list[int] = Field(
        ...,
        description="List of participant IDs who completed this challenge"
    )
    validated_by: Optional[int] = Field(
        None,
        description="ID of admin who validated the completion"
    )
    created_at: datetime = Field(..., description="Timestamp when challenge was created")
    completed_at: Optional[datetime] = Field(
        None,
        description="Timestamp when challenge was completed"
    )
    updated_at: datetime = Field(..., description="Timestamp when challenge was last updated")

    class Config:
        """Pydantic configuration."""
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Win a 1v1 FIFA match against Paul",
                "description": "Challenge Paul to a FIFA match and win. Best of 3 games.",
                "type": "individual",
                "points": 50,
                "status": "completed",
                "assigned_to": [2, 3, 4, 5],
                "completed_by": [5],
                "validated_by": 1,
                "created_at": "2026-06-04T18:00:00Z",
                "completed_at": "2026-06-05T16:30:00Z",
                "updated_at": "2026-06-05T16:30:00Z"
            }
        }


class ChallengeSummary(BaseModel):
    """
    Lightweight challenge schema for lists and summaries.

    Contains only essential fields.
    """
    id: int
    title: str
    type: ChallengeType
    points: int
    status: ChallengeStatus

    class Config:
        """Pydantic configuration."""
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Win a 1v1 FIFA match against Paul",
                "type": "individual",
                "points": 50,
                "status": "completed"
            }
        }
