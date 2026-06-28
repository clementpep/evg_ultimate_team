"""
Authentication service for EVG Ultimate Team.

Handles participant and admin authentication logic.
"""

from sqlalchemy.orm import Session
from typing import Optional
from app.models import Participant
from app.schemas.auth import ParticipantLogin, AdminLogin, AuthToken
from app.utils.security import (
    verify_admin_password,
    create_access_token,
    create_participant_token_data,
)
from app.utils.exceptions import InvalidCredentialsError
from app.utils.logger import log_auth_attempt, logger


# =============================================================================
# Shared helpers
# =============================================================================

def _grant_welcome_pack_if_needed(db: Session, participant: Participant) -> None:
    """Give the one-time welcome pack (1 silver) on the participant's first login."""
    if not participant.has_received_welcome_pack:
        participant.add_pack("silver")
        participant.has_received_welcome_pack = True
        db.commit()
        logger.info(f"Welcome pack (1 silver) given to {participant.name} on first login")


# =============================================================================
# Participant Authentication
# =============================================================================

def authenticate_participant(
    db: Session,
    login_data: ParticipantLogin
) -> AuthToken:
    """
    Authenticate a participant using simple username-only login.

    For Phase 1, we use simple username matching (case-insensitive).
    No password is required for participants.

    Args:
        db: Database session
        login_data: Login request data with username

    Returns:
        AuthToken with access token and user information

    Raises:
        InvalidCredentialsError: If participant not found

    Example:
        >>> login = ParticipantLogin(username="Paul C.")
        >>> token = authenticate_participant(db, login)
        >>> print(token.access_token)
    """
    # Find participant by name (case-insensitive)
    participant = db.query(Participant).filter(
        Participant.name.ilike(login_data.username)
    ).first()

    if not participant:
        log_auth_attempt(login_data.username, success=False, is_admin=False)
        raise InvalidCredentialsError(
            detail=f"No participant found with username '{login_data.username}'"
        )

    # Give welcome pack (1 silver) on first login
    _grant_welcome_pack_if_needed(db, participant)

    # Create token data. Note: admin privileges are intentionally NOT granted
    # here — the name-only participant login is unauthenticated, so admin powers
    # require the password-gated admin login below (see authenticate_admin).
    token_data = create_participant_token_data(
        participant_id=participant.id,
        username=participant.name,
        is_groom=participant.is_groom,
    )

    # Generate access token
    access_token = create_access_token(token_data)

    # Log successful authentication
    log_auth_attempt(participant.name, success=True, is_admin=False)

    return AuthToken(
        access_token=access_token,
        token_type="bearer",
        user_id=participant.id,
        username=participant.name,
        is_admin=False,
        is_groom=participant.is_groom
    )


# =============================================================================
# Admin Authentication
# =============================================================================

def authenticate_admin(
    db: Session,
    login_data: AdminLogin
) -> AuthToken:
    """
    Authenticate the admin using his participant name and the admin password.

    The admin is a merged account: Clément is a regular participant flagged
    is_admin=True. He logs in with his own name ("Clément P.") plus the
    password-gated admin secret, and receives a combined token (participant type,
    real participant id, is_admin=True) so he both plays and administrates.

    Args:
        db: Database session
        login_data: Login request data with username and password

    Returns:
        AuthToken carrying the admin's real participant id and is_admin=True

    Raises:
        InvalidCredentialsError: If the participant is not an admin or the
            password is wrong

    Example:
        >>> login = AdminLogin(username="Clément P.", password="<admin password>")
        >>> token = authenticate_admin(db, login)
        >>> print(token.is_admin, token.user_id)
        True 2
    """
    # Find the participant by name (case-insensitive)
    participant = db.query(Participant).filter(
        Participant.name.ilike(login_data.username)
    ).first()

    # Generic error message — don't leak whether the name exists or is an admin
    if not participant or not participant.is_admin or not verify_admin_password(login_data.password):
        log_auth_attempt(login_data.username, success=False, is_admin=True)
        raise InvalidCredentialsError(
            detail="Invalid admin username or password"
        )

    # The admin plays too: grant his welcome pack on first login like everyone else
    _grant_welcome_pack_if_needed(db, participant)

    # Combined token: participant type + real id + admin privileges
    token_data = create_participant_token_data(
        participant_id=participant.id,
        username=participant.name,
        is_groom=participant.is_groom,
        is_admin=True,
    )

    # Generate access token
    access_token = create_access_token(token_data)

    # Log successful authentication
    log_auth_attempt(participant.name, success=True, is_admin=True)

    return AuthToken(
        access_token=access_token,
        token_type="bearer",
        user_id=participant.id,
        username=participant.name,
        is_admin=True,
        is_groom=participant.is_groom
    )


# =============================================================================
# Token Validation
# =============================================================================

def get_participant_by_id(db: Session, participant_id: int) -> Optional[Participant]:
    """
    Get a participant by ID.

    Helper function used by authentication middleware.

    Args:
        db: Database session
        participant_id: Participant ID from token

    Returns:
        Participant instance or None if not found

    Example:
        >>> participant = get_participant_by_id(db, 5)
        >>> if participant:
        >>>     print(participant.name)
    """
    return db.query(Participant).filter(Participant.id == participant_id).first()


# =============================================================================
# Username Availability
# =============================================================================

def is_username_available(db: Session, username: str) -> bool:
    """
    Check if a username is available (not taken by another participant).

    Useful for participant registration (not used in Phase 1).

    Args:
        db: Database session
        username: Username to check

    Returns:
        True if available, False if taken

    Example:
        >>> available = is_username_available(db, "New Participant")
        >>> if available:
        >>>     # Create new participant
        >>>     pass
    """
    existing = db.query(Participant).filter(
        Participant.name.ilike(username)
    ).first()
    return existing is None


# =============================================================================
# Logout (Client-Side Only)
# =============================================================================

# Note: In JWT-based authentication, logout is typically handled client-side
# by removing the token from storage. The server doesn't need to track active tokens.
# For enhanced security in production, you could implement token blacklisting,
# but it's not necessary for this MVP.
