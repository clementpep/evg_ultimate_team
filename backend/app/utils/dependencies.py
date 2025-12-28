"""
FastAPI dependencies for EVG Ultimate Team.

Provides reusable dependency functions for route handlers.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Participant
from app.utils.security import decode_access_token, is_admin_token
from app.utils.logger import logger

# Security scheme for JWT tokens
security = HTTPBearer()


# =============================================================================
# Authentication Dependencies
# =============================================================================

def get_current_user_payload(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Extract and validate the current user from the JWT token.

    Args:
        credentials: HTTP Authorization credentials containing the JWT token

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid or expired

    Example:
        >>> @app.get("/profile")
        >>> def get_profile(payload: dict = Depends(get_current_user_payload)):
        >>>     user_id = payload["user_id"]
        >>>     return {"user_id": user_id}
    """
    token = credentials.credentials

    # Decode and verify token
    payload = decode_access_token(token)

    if payload is None:
        logger.warning(f"Invalid or expired token attempted")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


def get_current_participant(
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
) -> Participant:
    """
    Get the current authenticated participant from the database.

    Args:
        payload: Decoded JWT token payload
        db: Database session

    Returns:
        Participant model instance

    Raises:
        HTTPException: If participant not found or token is for an admin

    Example:
        >>> @app.get("/my-points")
        >>> def get_my_points(participant: Participant = Depends(get_current_participant)):
        >>>     return {"points": participant.total_points}
    """
    # Check if token is for a participant (not admin)
    if payload.get("type") != "participant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for participants only"
        )

    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    # Get participant from database
    participant = db.query(Participant).filter(Participant.id == user_id).first()

    if participant is None:
        logger.warning(f"Participant {user_id} not found for valid token")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )

    return participant


def require_admin(
    payload: dict = Depends(get_current_user_payload)
) -> dict:
    """
    Require that the current user is an admin.

    Args:
        payload: Decoded JWT token payload

    Returns:
        Token payload if user is admin

    Raises:
        HTTPException: If user is not an admin

    Example:
        >>> @app.post("/admin/challenges")
        >>> def create_challenge(
        >>>     admin: dict = Depends(require_admin),
        >>>     challenge: ChallengeCreate = ...
        >>> ):
        >>>     # Only admins can access this endpoint
        >>>     pass
    """
    if not is_admin_token(payload):
        logger.warning(
            f"Non-admin user attempted to access admin endpoint",
            extra={"user_id": payload.get("user_id")}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )

    return payload


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict]:
    """
    Get the current user if authenticated, otherwise None.

    Useful for endpoints that work with or without authentication.

    Args:
        credentials: Optional HTTP Authorization credentials

    Returns:
        Decoded token payload if authenticated, None otherwise

    Example:
        >>> @app.get("/challenges")
        >>> def list_challenges(user: Optional[dict] = Depends(get_optional_current_user)):
        >>>     # Show all challenges, but mark completed ones if user is authenticated
        >>>     pass
    """
    if credentials is None:
        return None

    token = credentials.credentials
    return decode_access_token(token)


# =============================================================================
# Helper Dependencies
# =============================================================================

def get_current_user_id(
    payload: dict = Depends(get_current_user_payload)
) -> int:
    """
    Get the current user's ID from the token.

    Args:
        payload: Decoded JWT token payload

    Returns:
        User ID

    Raises:
        HTTPException: If user_id is not in payload

    Example:
        >>> @app.get("/my-data")
        >>> def get_my_data(user_id: int = Depends(get_current_user_id)):
        >>>     return {"user_id": user_id}
    """
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user_id"
        )
    return user_id


def get_admin_id(
    admin_payload: dict = Depends(require_admin)
) -> int:
    """
    Get the current admin's ID.

    Args:
        admin_payload: Decoded admin JWT token payload

    Returns:
        Admin user ID

    Example:
        >>> @app.post("/admin/points/add")
        >>> def add_points(admin_id: int = Depends(get_admin_id)):
        >>>     # admin_id can be used to track who made the change
        >>>     pass
    """
    return admin_payload.get("user_id", 0)
