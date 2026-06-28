"""
Authentication routes for EVG Ultimate Team API.

Handles participant and admin login endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import ParticipantLogin, AdminLogin, AuthToken
from app.schemas.common import APIResponse
from app.services import auth_service
from app.utils.exceptions import EVGException, format_exception_response
from app.utils.logger import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=APIResponse[AuthToken])
def participant_login(
    login_data: ParticipantLogin,
    db: Session = Depends(get_db)
):
    """
    Participant login endpoint (simple username-only authentication).

    No password required for Phase 1 MVP. Just provide your name.

    **Request Body:**
    - `username`: Your full name (case-insensitive)

    **Returns:**
    - Access token for authenticated requests
    - User information (ID, username, is_groom status)

    **Example:**
    ```json
    {
        "username": "Paul C."
    }
    ```
    """
    try:
        token = auth_service.authenticate_participant(db, login_data)
        return APIResponse(
            success=True,
            data=token,
            message=f"Welcome, {token.username}!"
        )
    except EVGException as e:
        logger.error(f"Login failed: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.post("/admin-login", response_model=APIResponse[AuthToken])
def admin_login(
    login_data: AdminLogin,
    db: Session = Depends(get_db)
):
    """
    Admin login endpoint (requires the admin's participant name and password).

    Clément is a merged account: he logs in with his own participant name plus
    the admin password, and receives a combined token (he both plays and
    administrates).

    **Request Body:**
    - `username`: The admin participant's name (e.g. "Clément P.")
    - `password`: Admin password

    **Returns:**
    - Access token with admin privileges (carries his real participant id)
    - User information

    **Example:**
    ```json
    {
        "username": "Clément P.",
        "password": "<admin password>"
    }
    ```
    """
    try:
        token = auth_service.authenticate_admin(db, login_data)
        return APIResponse(
            success=True,
            data=token,
            message=f"Admin login successful. Welcome, {token.username}!"
        )
    except EVGException as e:
        logger.error(f"Admin login failed: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))
