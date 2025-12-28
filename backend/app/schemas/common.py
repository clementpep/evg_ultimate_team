"""
Common Pydantic schemas for EVG Ultimate Team API.

Contains reusable schemas for API responses and common data structures.
"""

from pydantic import BaseModel
from typing import Optional, Any, Generic, TypeVar


# =============================================================================
# Generic API Response Schemas
# =============================================================================

DataT = TypeVar('DataT')


class APIResponse(BaseModel, Generic[DataT]):
    """
    Standard API response wrapper.

    All API endpoints should return responses in this format for consistency.

    Attributes:
        success: Whether the operation was successful
        data: Response data (type varies by endpoint)
        message: Optional message for the user
        error: Optional error message (only present when success=False)
        detail: Optional detailed error information for debugging

    Example success response:
        {
            "success": true,
            "data": {"id": 1, "name": "Paul"},
            "message": "Participant retrieved successfully"
        }

    Example error response:
        {
            "success": false,
            "error": "Participant not found",
            "detail": "No participant with ID 999 exists"
        }
    """
    success: bool
    data: Optional[DataT] = None
    message: Optional[str] = None
    error: Optional[str] = None
    detail: Optional[str] = None

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {"id": 1},
                "message": "Operation completed successfully"
            }
        }


class SuccessResponse(BaseModel):
    """
    Simple success response without data.

    Used for operations that don't return data (e.g., DELETE operations).
    """
    success: bool = True
    message: str

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Resource deleted successfully"
            }
        }


class ErrorResponse(BaseModel):
    """
    Error response schema.

    Used when an operation fails.
    """
    success: bool = False
    error: str
    detail: Optional[str] = None

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "success": False,
                "error": "Invalid input",
                "detail": "Points must be a positive integer"
            }
        }


# =============================================================================
# Pagination Schemas
# =============================================================================

class PaginationParams(BaseModel):
    """
    Query parameters for pagination.

    Attributes:
        skip: Number of records to skip (default: 0)
        limit: Maximum number of records to return (default: 100)
    """
    skip: int = 0
    limit: int = 100

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "skip": 0,
                "limit": 50
            }
        }


class PaginatedResponse(BaseModel, Generic[DataT]):
    """
    Paginated response wrapper.

    Used for endpoints that return lists of items with pagination.

    Attributes:
        success: Whether the operation was successful
        data: List of items
        total: Total number of items available
        skip: Number of items skipped
        limit: Maximum number of items per page
    """
    success: bool = True
    data: list[DataT]
    total: int
    skip: int
    limit: int

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "success": True,
                "data": [{"id": 1}, {"id": 2}],
                "total": 100,
                "skip": 0,
                "limit": 50
            }
        }
