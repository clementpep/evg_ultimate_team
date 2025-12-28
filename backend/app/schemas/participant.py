"""
Pydantic schemas for Participant model.

Defines request and response schemas for participant-related API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# =============================================================================
# Base Schemas
# =============================================================================

class ParticipantBase(BaseModel):
    """
    Base schema with common participant fields.

    Used as a base for other participant schemas.
    """
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Participant's full name",
        examples=["Paul C."]
    )
    avatar_url: Optional[str] = Field(
        None,
        max_length=500,
        description="URL or path to participant's avatar image"
    )
    is_groom: bool = Field(
        default=False,
        description="Whether this participant is the groom"
    )


# =============================================================================
# Request Schemas
# =============================================================================

class ParticipantCreate(ParticipantBase):
    """
    Schema for creating a new participant.

    Used in POST /api/participants
    """
    pass

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "name": "Paul C.",
                "avatar_url": "https://example.com/avatars/paul.jpg",
                "is_groom": True
            }
        }


class ParticipantUpdate(BaseModel):
    """
    Schema for updating a participant.

    All fields are optional to allow partial updates.
    Used in PUT /api/participants/{id}
    """
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Participant's full name"
    )
    avatar_url: Optional[str] = Field(
        None,
        max_length=500,
        description="URL or path to participant's avatar image"
    )
    is_groom: Optional[bool] = Field(
        None,
        description="Whether this participant is the groom"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "avatar_url": "https://example.com/avatars/paul_new.jpg"
            }
        }


# =============================================================================
# Response Schemas
# =============================================================================

class ParticipantResponse(ParticipantBase):
    """
    Schema for participant responses.

    Includes all participant data including calculated fields.
    Used in GET requests and as part of other responses.
    """
    id: int = Field(..., description="Unique participant ID")
    total_points: int = Field(..., description="Current total points")
    current_packs: dict = Field(
        ...,
        description="Pack counts for each tier (bronze, silver, gold, ultimate)"
    )
    created_at: datetime = Field(..., description="Timestamp when participant was created")
    updated_at: datetime = Field(..., description="Timestamp when participant was last updated")

    class Config:
        """Pydantic configuration."""
        from_attributes = True  # Allows creation from ORM models
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Paul C.",
                "avatar_url": "https://example.com/avatars/paul.jpg",
                "is_groom": True,
                "total_points": 350,
                "current_packs": {
                    "bronze": 2,
                    "silver": 1,
                    "gold": 0,
                    "ultimate": 0
                },
                "created_at": "2026-06-04T18:00:00Z",
                "updated_at": "2026-06-05T14:30:00Z"
            }
        }


class ParticipantSummary(BaseModel):
    """
    Lightweight participant schema for lists and summaries.

    Contains only essential fields, used when full details aren't needed.
    """
    id: int
    name: str
    avatar_url: Optional[str] = None
    is_groom: bool
    total_points: int

    class Config:
        """Pydantic configuration."""
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Paul C.",
                "avatar_url": "https://example.com/avatars/paul.jpg",
                "is_groom": True,
                "total_points": 350
            }
        }


class ParticipantWithRank(ParticipantSummary):
    """
    Participant schema with ranking information.

    Used for leaderboard displays.
    """
    rank: int = Field(..., description="Current ranking position (1-based)")
    points_today: Optional[int] = Field(
        None,
        description="Points earned today (optional)"
    )

    class Config:
        """Pydantic configuration."""
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Paul C.",
                "avatar_url": "https://example.com/avatars/paul.jpg",
                "is_groom": True,
                "total_points": 350,
                "rank": 1,
                "points_today": 75
            }
        }
