"""
Security utilities for EVG Ultimate Team.

Provides functions for password hashing, token generation, and authentication.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import get_settings

settings = get_settings()

# =============================================================================
# Password Hashing
# =============================================================================

# Password context for hashing and verification
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        Hashed password string

    Example:
        >>> hashed = hash_password("my_password")
        >>> print(hashed)
        $2b$12$...
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hashed password.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against

    Returns:
        True if password matches, False otherwise

    Example:
        >>> hashed = hash_password("my_password")
        >>> verify_password("my_password", hashed)
        True
        >>> verify_password("wrong_password", hashed)
        False
    """
    return pwd_context.verify(plain_password, hashed_password)


# =============================================================================
# JWT Token Generation and Verification
# =============================================================================

# Algorithm for JWT encoding/decoding
ALGORITHM = "HS256"

# Token expiration time (7 days for this event)
ACCESS_TOKEN_EXPIRE_DAYS = 7


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.

    Args:
        data: Dictionary of data to encode in the token
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string

    Example:
        >>> token = create_access_token({"sub": "user_5", "is_admin": False})
        >>> print(token)
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    """
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)

    to_encode.update({"exp": expire})

    # Encode and return token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT access token.

    Args:
        token: JWT token string to decode

    Returns:
        Decoded token data as dictionary, or None if invalid

    Example:
        >>> token = create_access_token({"sub": "user_5"})
        >>> payload = decode_access_token(token)
        >>> print(payload["sub"])
        user_5
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def verify_token(token: str) -> dict:
    """
    Verify a JWT access token and return payload.

    Args:
        token: JWT token string to verify

    Returns:
        Decoded token data as dictionary

    Raises:
        JWTError: If token is invalid or expired

    Example:
        >>> token = create_access_token({"sub": "user_5"})
        >>> payload = verify_token(token)
        >>> print(payload["sub"])
        user_5
    """
    payload = jwt.decode(
        token,
        settings.secret_key,
        algorithms=[ALGORITHM]
    )
    return payload


# =============================================================================
# Admin Authentication
# =============================================================================

def verify_admin_credentials(username: str, password: str) -> bool:
    """
    Verify admin credentials against environment configuration.

    Args:
        username: Admin username
        password: Admin password

    Returns:
        True if credentials are valid, False otherwise

    Example:
        >>> verify_admin_credentials("clement", "evg2026_admin")
        True
        >>> verify_admin_credentials("clement", "wrong_password")
        False
    """
    return (
        username.lower() == settings.admin_username.lower() and
        password == settings.admin_password
    )


# =============================================================================
# Token Payload Helpers
# =============================================================================

def create_participant_token_data(participant_id: int, username: str, is_groom: bool = False) -> dict:
    """
    Create token payload for a participant.

    Args:
        participant_id: Participant's ID
        username: Participant's username
        is_groom: Whether participant is the groom

    Returns:
        Dictionary with token payload data

    Example:
        >>> data = create_participant_token_data(5, "Hugo F.")
        >>> token = create_access_token(data)
    """
    return {
        "sub": f"participant_{participant_id}",
        "user_id": participant_id,
        "username": username,
        "is_admin": False,
        "is_groom": is_groom,
        "type": "participant"
    }


def create_admin_token_data(admin_id: int, username: str) -> dict:
    """
    Create token payload for an admin.

    Args:
        admin_id: Admin's ID (can be 0 for the main admin)
        username: Admin's username

    Returns:
        Dictionary with token payload data

    Example:
        >>> data = create_admin_token_data(0, "clement")
        >>> token = create_access_token(data)
    """
    return {
        "sub": f"admin_{admin_id}",
        "user_id": admin_id,
        "username": username,
        "is_admin": True,
        "is_groom": False,
        "type": "admin"
    }


def extract_user_id_from_payload(payload: dict) -> Optional[int]:
    """
    Extract user ID from token payload.

    Args:
        payload: Decoded JWT payload

    Returns:
        User ID if present, None otherwise

    Example:
        >>> payload = {"user_id": 5}
        >>> extract_user_id_from_payload(payload)
        5
    """
    return payload.get("user_id")


def is_admin_token(payload: dict) -> bool:
    """
    Check if token payload represents an admin user.

    Args:
        payload: Decoded JWT payload

    Returns:
        True if admin, False otherwise

    Example:
        >>> payload = {"is_admin": True}
        >>> is_admin_token(payload)
        True
    """
    return payload.get("is_admin", False)
