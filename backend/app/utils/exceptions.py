"""
Custom exception classes for EVG Ultimate Team backend.

This module defines custom exceptions for different error scenarios,
making error handling more explicit and maintainable throughout the application.

All custom exceptions inherit from EVGException base class and include
HTTP status codes for API responses.
"""

from typing import Optional


class EVGException(Exception):
    """
    Base exception class for all EVG Ultimate Team exceptions.

    Attributes:
        message: Human-readable error message
        status_code: HTTP status code for API responses
        detail: Optional additional details for debugging
    """

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        detail: Optional[str] = None
    ):
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(self.message)


# =============================================================================
# Authentication Exceptions
# =============================================================================

class AuthenticationError(EVGException):
    """Raised when authentication fails."""

    def __init__(
        self,
        message: str = "Authentication failed",
        detail: Optional[str] = None
    ):
        super().__init__(message=message, status_code=401, detail=detail)


class InvalidCredentialsError(AuthenticationError):
    """Raised when login credentials are invalid."""

    def __init__(self, detail: Optional[str] = None):
        super().__init__(
            message="Invalid username or password",
            detail=detail
        )


class UnauthorizedError(EVGException):
    """Raised when user lacks permission for an action."""

    def __init__(
        self,
        message: str = "You don't have permission to perform this action",
        detail: Optional[str] = None
    ):
        super().__init__(message=message, status_code=403, detail=detail)


class AdminRequiredError(UnauthorizedError):
    """Raised when admin privileges are required but not present."""

    def __init__(self):
        super().__init__(
            message="Admin privileges required for this action",
            detail="Only administrators can perform this operation"
        )


# =============================================================================
# Resource Not Found Exceptions
# =============================================================================

class NotFoundError(EVGException):
    """Base class for resource not found errors."""

    def __init__(
        self,
        resource_type: str,
        resource_id: Optional[int] = None,
        detail: Optional[str] = None
    ):
        if resource_id:
            message = f"{resource_type} with ID {resource_id} not found"
        else:
            message = f"{resource_type} not found"

        super().__init__(message=message, status_code=404, detail=detail)


class ParticipantNotFoundError(NotFoundError):
    """Raised when a participant cannot be found."""

    def __init__(self, participant_id: Optional[int] = None):
        super().__init__(
            resource_type="Participant",
            resource_id=participant_id
        )


class ChallengeNotFoundError(NotFoundError):
    """Raised when a challenge cannot be found."""

    def __init__(self, challenge_id: Optional[int] = None):
        super().__init__(
            resource_type="Challenge",
            resource_id=challenge_id
        )


class PackNotFoundError(NotFoundError):
    """Raised when a pack cannot be found."""

    def __init__(self, pack_id: Optional[int] = None):
        super().__init__(
            resource_type="Pack",
            resource_id=pack_id
        )


class EventNotFoundError(NotFoundError):
    """Raised when an event card cannot be found."""

    def __init__(self, event_id: Optional[int] = None):
        super().__init__(
            resource_type="Event",
            resource_id=event_id
        )


# =============================================================================
# Validation Exceptions
# =============================================================================

class ValidationError(EVGException):
    """Raised when input validation fails."""

    def __init__(
        self,
        message: str = "Validation error",
        detail: Optional[str] = None
    ):
        super().__init__(message=message, status_code=422, detail=detail)


class InsufficientPointsError(ValidationError):
    """Raised when participant doesn't have enough points for an action."""

    def __init__(self, required_points: int, current_points: int):
        super().__init__(
            message="Insufficient points for this action",
            detail=f"Required: {required_points} points, Current: {current_points} points"
        )


class InvalidChallengeStatusError(ValidationError):
    """Raised when attempting an invalid challenge status transition."""

    def __init__(self, current_status: str, attempted_status: str):
        super().__init__(
            message="Invalid challenge status transition",
            detail=f"Cannot change from '{current_status}' to '{attempted_status}'"
        )


class DuplicateEntryError(ValidationError):
    """Raised when attempting to create a duplicate entry."""

    def __init__(
        self,
        resource_type: str,
        field: str,
        value: str
    ):
        super().__init__(
            message=f"Duplicate {resource_type} entry",
            detail=f"A {resource_type} with {field}='{value}' already exists"
        )


# =============================================================================
# Business Logic Exceptions
# =============================================================================

class BusinessLogicError(EVGException):
    """Base class for business logic violations."""

    def __init__(
        self,
        message: str = "Business logic error",
        detail: Optional[str] = None
    ):
        super().__init__(message=message, status_code=400, detail=detail)


class PackWindowClosedError(BusinessLogicError):
    """Raised when trying to open packs outside allowed time windows."""

    def __init__(self):
        super().__init__(
            message="Pack opening window is currently closed",
            detail="Wait for the next scheduled pack opening time"
        )


class ChallengeAlreadyCompletedError(BusinessLogicError):
    """Raised when trying to complete an already completed challenge."""

    def __init__(self, challenge_id: int):
        super().__init__(
            message="Challenge already completed",
            detail=f"Challenge {challenge_id} has already been completed"
        )


class NegativePointsError(BusinessLogicError):
    """Raised when an action would result in negative points."""

    def __init__(self):
        super().__init__(
            message="Points cannot be negative",
            detail="This action would result in a negative point balance"
        )


# =============================================================================
# Database Exceptions
# =============================================================================

class DatabaseError(EVGException):
    """Raised when a database operation fails."""

    def __init__(
        self,
        message: str = "Database operation failed",
        detail: Optional[str] = None
    ):
        super().__init__(message=message, status_code=500, detail=detail)


# =============================================================================
# Helper Functions
# =============================================================================

def format_exception_response(exc: EVGException) -> dict:
    """
    Format an exception into a JSON-serializable response.

    Args:
        exc: The exception to format

    Returns:
        Dictionary with error details suitable for API response

    Example:
        >>> exc = ParticipantNotFoundError(participant_id=123)
        >>> format_exception_response(exc)
        {
            "success": False,
            "error": "Participant with ID 123 not found",
            "detail": None,
            "status_code": 404
        }
    """
    return {
        "success": False,
        "error": exc.message,
        "detail": exc.detail,
        "status_code": exc.status_code
    }
