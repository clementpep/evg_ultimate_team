"""
Participant routes for EVG Ultimate Team API.

Handles participant CRUD operations.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.participant import ParticipantResponse, ParticipantCreate, ParticipantUpdate
from app.schemas.common import APIResponse, SuccessResponse
from app.services import participant_service
from app.utils.dependencies import require_admin, get_current_participant
from app.utils.exceptions import EVGException, format_exception_response
from app.utils.logger import logger

router = APIRouter(prefix="/participants", tags=["Participants"])


@router.get("", response_model=APIResponse[List[ParticipantResponse]])
def list_participants(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all participants.

    **Query Parameters:**
    - `skip`: Number of records to skip (pagination)
    - `limit`: Maximum number of records to return

    **Returns:**
    - List of all participants with their points and stats
    """
    try:
        participants = participant_service.get_all_participants(db, skip, limit)
        return APIResponse(
            success=True,
            data=participants,
            message=f"Retrieved {len(participants)} participants"
        )
    except EVGException as e:
        logger.error(f"Failed to list participants: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.get("/{participant_id}", response_model=APIResponse[ParticipantResponse])
def get_participant(
    participant_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific participant by ID.

    **Path Parameters:**
    - `participant_id`: Participant ID

    **Returns:**
    - Participant details including points, packs, and timestamps
    """
    try:
        participant = participant_service.get_participant_by_id(db, participant_id)
        return APIResponse(
            success=True,
            data=participant,
            message=f"Participant retrieved: {participant.name}"
        )
    except EVGException as e:
        logger.error(f"Failed to get participant {participant_id}: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.get("/me/profile", response_model=APIResponse[ParticipantResponse])
def get_my_profile(
    current_participant = Depends(get_current_participant)
):
    """
    Get the current authenticated participant's profile.

    **Requires:** Valid participant authentication token

    **Returns:**
    - Current participant's details
    """
    return APIResponse(
        success=True,
        data=current_participant,
        message=f"Your profile: {current_participant.name}"
    )


@router.post("", response_model=APIResponse[ParticipantResponse])
def create_participant(
    participant_data: ParticipantCreate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Create a new participant (admin only).

    **Requires:** Admin authentication

    **Request Body:**
    - `name`: Participant's full name (unique)
    - `avatar_url`: Optional avatar image URL
    - `is_groom`: Whether this participant is the groom (default: false)

    **Returns:**
    - Created participant details
    """
    try:
        participant = participant_service.create_participant(db, participant_data)
        return APIResponse(
            success=True,
            data=participant,
            message=f"Participant created: {participant.name}"
        )
    except EVGException as e:
        logger.error(f"Failed to create participant: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.put("/{participant_id}", response_model=APIResponse[ParticipantResponse])
def update_participant(
    participant_id: int,
    participant_data: ParticipantUpdate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Update a participant (admin only).

    **Requires:** Admin authentication

    **Path Parameters:**
    - `participant_id`: Participant ID to update

    **Request Body:**
    - Any field from ParticipantUpdate (all optional)

    **Returns:**
    - Updated participant details
    """
    try:
        participant = participant_service.update_participant(db, participant_id, participant_data)
        return APIResponse(
            success=True,
            data=participant,
            message=f"Participant updated: {participant.name}"
        )
    except EVGException as e:
        logger.error(f"Failed to update participant {participant_id}: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.delete("/{participant_id}", response_model=SuccessResponse)
def delete_participant(
    participant_id: int,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Delete a participant (admin only).

    **WARNING:** This will cascade delete all associated data
    (points transactions, challenge associations, etc.)

    **Requires:** Admin authentication

    **Path Parameters:**
    - `participant_id`: Participant ID to delete

    **Returns:**
    - Success confirmation
    """
    try:
        participant_service.delete_participant(db, participant_id)
        return SuccessResponse(
            success=True,
            message=f"Participant {participant_id} deleted successfully"
        )
    except EVGException as e:
        logger.error(f"Failed to delete participant {participant_id}: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))
