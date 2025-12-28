"""
Pydantic schemas for Points Transaction model.

Defines request and response schemas for points-related API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# =============================================================================
# Request Schemas
# =============================================================================

class PointsAdd(BaseModel):
    """
    Schema for manually adding points to a participant.

    Used in POST /api/points/add (admin only)
    """
    participant_id: int = Field(
        ...,
        description="ID of participant to add points to"
    )
    amount: int = Field(
        ...,
        gt=0,
        description="Amount of points to add (must be positive)"
    )
    reason: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Reason for adding points"
    )
    admin_id: int = Field(
        ...,
        description="ID of admin adding the points"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "participant_id": 5,
                "amount": 100,
                "reason": "Bonus for best costume",
                "admin_id": 1
            }
        }


class PointsSubtract(BaseModel):
    """
    Schema for manually subtracting points from a participant.

    Used in POST /api/points/subtract (admin only)
    """
    participant_id: int = Field(
        ...,
        description="ID of participant to subtract points from"
    )
    amount: int = Field(
        ...,
        gt=0,
        description="Amount of points to subtract (must be positive)"
    )
    reason: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Reason for subtracting points"
    )
    admin_id: int = Field(
        ...,
        description="ID of admin subtracting the points"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "participant_id": 7,
                "amount": 20,
                "reason": "Penalty for being last to wake up",
                "admin_id": 1
            }
        }


# =============================================================================
# Response Schemas
# =============================================================================

class PointsTransactionResponse(BaseModel):
    """
    Schema for points transaction responses.

    Includes all transaction data.
    Used in GET requests and as part of other responses.
    """
    id: int = Field(..., description="Unique transaction ID")
    participant_id: int = Field(..., description="ID of participant")
    amount: int = Field(..., description="Points amount (positive or negative)")
    reason: str = Field(..., description="Reason for the transaction")
    challenge_id: Optional[int] = Field(
        None,
        description="ID of challenge that caused this transaction"
    )
    created_by: Optional[int] = Field(
        None,
        description="ID of admin who created the transaction"
    )
    created_at: datetime = Field(..., description="Timestamp when transaction was created")

    class Config:
        """Pydantic configuration."""
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 42,
                "participant_id": 5,
                "amount": 50,
                "reason": "Completed challenge (ID: 12)",
                "challenge_id": 12,
                "created_by": 1,
                "created_at": "2026-06-05T16:30:00Z"
            }
        }


class PointsTransactionSummary(BaseModel):
    """
    Lightweight transaction schema for lists.

    Contains only essential fields.
    """
    id: int
    amount: int
    reason: str
    created_at: datetime

    class Config:
        """Pydantic configuration."""
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 42,
                "amount": 50,
                "reason": "Completed challenge",
                "created_at": "2026-06-05T16:30:00Z"
            }
        }


class PointsHistory(BaseModel):
    """
    Schema for participant's points history.

    Includes participant info and their transactions.
    """
    participant_id: int
    participant_name: str
    current_points: int
    transactions: list[PointsTransactionResponse]
    total_transactions: int

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "participant_id": 5,
                "participant_name": "Hugo F.",
                "current_points": 275,
                "transactions": [
                    {
                        "id": 42,
                        "participant_id": 5,
                        "amount": 50,
                        "reason": "Completed challenge (ID: 12)",
                        "challenge_id": 12,
                        "created_by": 1,
                        "created_at": "2026-06-05T16:30:00Z"
                    }
                ],
                "total_transactions": 8
            }
        }
