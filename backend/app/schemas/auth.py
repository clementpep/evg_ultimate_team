"""
Pydantic schemas for authentication.

Defines request and response schemas for authentication-related API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional


# =============================================================================
# Request Schemas
# =============================================================================

class ParticipantLogin(BaseModel):
    """
    Schema for participant login.

    Simple username-only authentication (no password required for Phase 1).
    Used in POST /api/auth/login
    """
    username: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Participant's name (case-insensitive)"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "username": "Paul C."
            }
        }


class AdminLogin(BaseModel):
    """
    Schema for admin login.

    Requires both username and password.
    Used in POST /api/auth/admin-login
    """
    username: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Admin username"
    )
    password: str = Field(
        ...,
        min_length=1,
        description="Admin password"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "username": "clement",
                "password": "evg2026_admin"
            }
        }


# =============================================================================
# Response Schemas
# =============================================================================

class AuthToken(BaseModel):
    """
    Schema for authentication token response.

    Contains access token and user information.
    """
    access_token: str = Field(
        ...,
        description="JWT access token for authenticated requests"
    )
    token_type: str = Field(
        default="bearer",
        description="Token type (always 'bearer')"
    )
    user_id: Optional[int] = Field(
        None,
        description="User ID (participant ID or admin ID)"
    )
    username: str = Field(
        ...,
        description="Username"
    )
    is_admin: bool = Field(
        default=False,
        description="Whether this user is an admin"
    )
    is_groom: bool = Field(
        default=False,
        description="Whether this participant is the groom (not applicable for admins)"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user_id": 5,
                "username": "Hugo F.",
                "is_admin": False,
                "is_groom": False
            }
        }


class CurrentUser(BaseModel):
    """
    Schema for current authenticated user information.

    Used in GET /api/auth/me
    """
    id: int = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    is_admin: bool = Field(..., description="Whether this user is an admin")
    is_groom: bool = Field(
        default=False,
        description="Whether this participant is the groom"
    )
    total_points: Optional[int] = Field(
        None,
        description="Total points (only for participants)"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "id": 5,
                "username": "Hugo F.",
                "is_admin": False,
                "is_groom": False,
                "total_points": 275
            }
        }
