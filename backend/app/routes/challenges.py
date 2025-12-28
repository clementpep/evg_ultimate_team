"""
Challenge routes for EVG Ultimate Team API.

Handles challenge CRUD operations and validation.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.challenge import (
    ChallengeResponse,
    ChallengeCreate,
    ChallengeUpdate,
    ChallengeAttempt,
    ChallengeValidation
)
from app.schemas.common import APIResponse, SuccessResponse
from app.services import challenge_service, points_service
from app.utils.dependencies import require_admin, get_current_user_payload, get_admin_id
from app.utils.exceptions import EVGException, format_exception_response
from app.utils.logger import logger
from app.models.challenge import ChallengeStatus

router = APIRouter(prefix="/challenges", tags=["Challenges"])


def _serialize_challenge(challenge) -> dict:
    """
    Convert a Challenge ORM model to a dictionary with relationship IDs.

    Args:
        challenge: Challenge ORM instance

    Returns:
        Dictionary with all challenge fields including serialized relationships
    """
    return {
        "id": challenge.id,
        "title": challenge.title,
        "description": challenge.description,
        "type": challenge.type,
        "points": challenge.points,
        "status": challenge.status,
        "assigned_to": [p.id for p in challenge.assigned_participants],
        "completed_by": [p.id for p in challenge.completed_by_participants],
        "validated_by": challenge.validated_by,
        "created_at": challenge.created_at,
        "completed_at": challenge.completed_at,
        "updated_at": challenge.updated_at
    }


@router.get("", response_model=APIResponse[List[ChallengeResponse]])
def list_challenges(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all challenges.

    **Query Parameters:**
    - `skip`: Number of records to skip (pagination)
    - `limit`: Maximum number of records to return

    **Returns:**
    - List of all challenges
    """
    try:
        challenges = challenge_service.get_all_challenges(db, skip, limit)
        challenge_responses = [_serialize_challenge(c) for c in challenges]

        return APIResponse(
            success=True,
            data=challenge_responses,
            message=f"Retrieved {len(challenges)} challenges"
        )
    except EVGException as e:
        logger.error(f"Failed to list challenges: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.get("/{challenge_id}", response_model=APIResponse[ChallengeResponse])
def get_challenge(
    challenge_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific challenge by ID.

    **Path Parameters:**
    - `challenge_id`: Challenge ID

    **Returns:**
    - Challenge details
    """
    try:
        challenge = challenge_service.get_challenge_by_id(db, challenge_id)
        return APIResponse(
            success=True,
            data=_serialize_challenge(challenge),
            message=f"Challenge retrieved: {challenge.title}"
        )
    except EVGException as e:
        logger.error(f"Failed to get challenge {challenge_id}: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.post("", response_model=APIResponse[ChallengeResponse])
def create_challenge(
    challenge_data: ChallengeCreate,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_admin_id)
):
    """
    Create a new challenge (admin only).

    **Requires:** Admin authentication

    **Request Body:**
    - `title`: Challenge title
    - `description`: Detailed description
    - `type`: Challenge type (individual, team, secret)
    - `points`: Points awarded for completion
    - `assigned_to`: Optional list of participant IDs

    **Returns:**
    - Created challenge details
    """
    try:
        challenge = challenge_service.create_challenge(db, challenge_data, admin_id)
        return APIResponse(
            success=True,
            data=_serialize_challenge(challenge),
            message=f"Challenge created: {challenge.title}"
        )
    except EVGException as e:
        logger.error(f"Failed to create challenge: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.put("/{challenge_id}", response_model=APIResponse[ChallengeResponse])
def update_challenge(
    challenge_id: int,
    challenge_data: ChallengeUpdate,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_admin_id)
):
    """
    Update a challenge (admin only).

    **Requires:** Admin authentication

    **Path Parameters:**
    - `challenge_id`: Challenge ID to update

    **Request Body:**
    - Any field from ChallengeUpdate (all optional)

    **Returns:**
    - Updated challenge details
    """
    try:
        challenge = challenge_service.update_challenge(db, challenge_id, challenge_data, admin_id)
        return APIResponse(
            success=True,
            data=_serialize_challenge(challenge),
            message=f"Challenge updated: {challenge.title}"
        )
    except EVGException as e:
        logger.error(f"Failed to update challenge {challenge_id}: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.delete("/{challenge_id}", response_model=SuccessResponse)
def delete_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(get_admin_id)
):
    """
    Delete a challenge (admin only).

    **Requires:** Admin authentication

    **Path Parameters:**
    - `challenge_id`: Challenge ID to delete

    **Returns:**
    - Success confirmation
    """
    try:
        challenge_service.delete_challenge(db, challenge_id, admin_id)
        return SuccessResponse(
            success=True,
            message=f"Challenge {challenge_id} deleted successfully"
        )
    except EVGException as e:
        logger.error(f"Failed to delete challenge {challenge_id}: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.post("/{challenge_id}/attempt", response_model=APIResponse[ChallengeResponse])
def attempt_challenge(
    challenge_id: int,
    attempt_data: ChallengeAttempt,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_payload)
):
    """
    Mark a challenge as being attempted.

    Changes challenge status to 'active'.

    **Path Parameters:**
    - `challenge_id`: Challenge ID

    **Request Body:**
    - `participant_id`: ID of participant attempting the challenge

    **Returns:**
    - Updated challenge details
    """
    try:
        challenge = challenge_service.mark_challenge_active(
            db,
            challenge_id,
            attempt_data.participant_id
        )
        return APIResponse(
            success=True,
            data=_serialize_challenge(challenge),
            message=f"Challenge marked as active: {challenge.title}"
        )
    except EVGException as e:
        logger.error(f"Failed to attempt challenge {challenge_id}: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.post("/{challenge_id}/validate", response_model=APIResponse[ChallengeResponse])
def validate_challenge(
    challenge_id: int,
    validation_data: ChallengeValidation,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Validate challenge completion (admin only).

    Marks challenge as completed/failed and awards points if completed.

    **Requires:** Admin authentication

    **Path Parameters:**
    - `challenge_id`: Challenge ID

    **Request Body:**
    - `participant_ids`: List of participant IDs who completed the challenge
    - `status`: Validation result (completed or failed)
    - `admin_id`: Admin ID validating the challenge

    **Returns:**
    - Updated challenge details
    """
    try:
        # Validate the challenge
        challenge = challenge_service.validate_challenge_completion(
            db,
            challenge_id,
            validation_data
        )

        # If completed, award points to participants
        if validation_data.status == ChallengeStatus.COMPLETED:
            for participant_id in validation_data.participant_ids:
                points_service.award_challenge_points(
                    db,
                    participant_id,
                    challenge_id,
                    validation_data.admin_id
                )

        return APIResponse(
            success=True,
            data=_serialize_challenge(challenge),
            message=f"Challenge validated as {validation_data.status.value}: {challenge.title}"
        )
    except EVGException as e:
        logger.error(f"Failed to validate challenge {challenge_id}: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.get("/participant/{participant_id}", response_model=APIResponse[dict])
def get_participant_challenges(
    participant_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all challenges for a specific participant.

    **Path Parameters:**
    - `participant_id`: Participant ID

    **Returns:**
    - Dictionary with 'assigned' and 'completed' challenge lists
    """
    try:
        challenges = challenge_service.get_participant_challenges(db, participant_id)
        # Serialize the challenge lists
        serialized_challenges = {
            "assigned": [_serialize_challenge(c) for c in challenges["assigned"]],
            "completed": [_serialize_challenge(c) for c in challenges["completed"]]
        }
        return APIResponse(
            success=True,
            data=serialized_challenges,
            message=f"Retrieved challenges for participant {participant_id}"
        )
    except EVGException as e:
        logger.error(f"Failed to get challenges for participant {participant_id}: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))
