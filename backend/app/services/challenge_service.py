"""
Challenge service for EVG Ultimate Team.

Handles all business logic related to challenges.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models import Challenge, Participant, ChallengeStatus, ChallengeType
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate, ChallengeValidation
from app.utils.exceptions import (
    ChallengeNotFoundError,
    ParticipantNotFoundError,
    InvalidChallengeStatusError,
    ChallengeAlreadyCompletedError
)
from app.utils.logger import logger, log_challenge_validation


def get_all_challenges(db: Session, skip: int = 0, limit: int = 100) -> List[Challenge]:
    """Get all challenges with pagination."""
    return db.query(Challenge).offset(skip).limit(limit).all()


def get_challenge_by_id(db: Session, challenge_id: int) -> Challenge:
    """Get a challenge by ID."""
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise ChallengeNotFoundError(challenge_id)
    return challenge


def get_challenges_by_status(db: Session, status: ChallengeStatus) -> List[Challenge]:
    """Get all challenges with a specific status."""
    return db.query(Challenge).filter(Challenge.status == status).all()


def get_challenges_by_type(db: Session, challenge_type: ChallengeType) -> List[Challenge]:
    """Get all challenges of a specific type."""
    return db.query(Challenge).filter(Challenge.type == challenge_type).all()


def create_challenge(db: Session, challenge_data: ChallengeCreate, admin_id: int) -> Challenge:
    """Create a new challenge."""
    challenge = Challenge(
        title=challenge_data.title,
        description=challenge_data.description,
        type=challenge_data.type,
        points=challenge_data.points,
        status=ChallengeStatus.PENDING
    )

    db.add(challenge)
    db.flush()  # Get the challenge ID without committing

    # Assign to participants if specified
    if challenge_data.assigned_to:
        for participant_id in challenge_data.assigned_to:
            participant = db.query(Participant).filter(Participant.id == participant_id).first()
            if participant:
                challenge.assigned_participants.append(participant)

    db.commit()
    db.refresh(challenge)

    logger.info(
        f"Created challenge: {challenge.title}",
        extra={
            "challenge_id": challenge.id,
            "type": challenge.type.value,
            "points": challenge.points,
            "admin_id": admin_id
        }
    )

    return challenge


def update_challenge(db: Session, challenge_id: int, challenge_data: ChallengeUpdate, admin_id: int) -> Challenge:
    """Update a challenge."""
    challenge = get_challenge_by_id(db, challenge_id)

    update_data = challenge_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(challenge, field, value)

    db.commit()
    db.refresh(challenge)

    logger.info(
        f"Updated challenge: {challenge.title}",
        extra={"challenge_id": challenge.id, "admin_id": admin_id}
    )

    return challenge


def delete_challenge(db: Session, challenge_id: int, admin_id: int) -> None:
    """Delete a challenge."""
    challenge = get_challenge_by_id(db, challenge_id)

    db.delete(challenge)
    db.commit()

    logger.warning(
        f"Deleted challenge: {challenge.title}",
        extra={"challenge_id": challenge_id, "admin_id": admin_id}
    )


def assign_challenge_to_participant(db: Session, challenge_id: int, participant_id: int) -> Challenge:
    """Assign a challenge to a participant."""
    challenge = get_challenge_by_id(db, challenge_id)
    participant = db.query(Participant).filter(Participant.id == participant_id).first()

    if not participant:
        raise ParticipantNotFoundError(participant_id)

    if participant not in challenge.assigned_participants:
        challenge.assigned_participants.append(participant)
        db.commit()
        db.refresh(challenge)

        logger.info(
            f"Assigned challenge to participant",
            extra={
                "challenge_id": challenge_id,
                "participant_id": participant_id
            }
        )

    return challenge


def mark_challenge_active(db: Session, challenge_id: int, participant_id: int) -> Challenge:
    """Mark a challenge as active (being attempted)."""
    challenge = get_challenge_by_id(db, challenge_id)

    if challenge.status in [ChallengeStatus.COMPLETED, ChallengeStatus.FAILED]:
        raise InvalidChallengeStatusError(
            current_status=challenge.status.value,
            attempted_status="active"
        )

    challenge.status = ChallengeStatus.ACTIVE
    db.commit()
    db.refresh(challenge)

    logger.info(
        f"Challenge marked as active",
        extra={
            "challenge_id": challenge_id,
            "participant_id": participant_id
        }
    )

    return challenge


def validate_challenge_completion(
    db: Session,
    challenge_id: int,
    validation_data: ChallengeValidation
) -> Challenge:
    """
    Validate challenge completion and award points.

    This is called by admin to confirm a participant completed a challenge.
    Points are awarded in the points_service.
    """
    challenge = get_challenge_by_id(db, challenge_id)

    if challenge.status == ChallengeStatus.COMPLETED:
        raise ChallengeAlreadyCompletedError(challenge_id)

    # Update challenge status
    challenge.status = validation_data.status
    challenge.validated_by = validation_data.admin_id

    if validation_data.status == ChallengeStatus.COMPLETED:
        challenge.completed_at = datetime.utcnow()

        # Mark participants as having completed the challenge
        for participant_id in validation_data.participant_ids:
            participant = db.query(Participant).filter(Participant.id == participant_id).first()
            if participant:
                if participant not in challenge.completed_by_participants:
                    challenge.completed_by_participants.append(participant)

    db.commit()
    db.refresh(challenge)

    log_challenge_validation(
        challenge_id=challenge_id,
        participant_ids=validation_data.participant_ids,
        validated_by=validation_data.admin_id,
        status=validation_data.status.value
    )

    return challenge


def get_participant_challenges(db: Session, participant_id: int) -> dict:
    """Get all challenges for a participant, organized by status."""
    participant = db.query(Participant).filter(Participant.id == participant_id).first()

    if not participant:
        raise ParticipantNotFoundError(participant_id)

    return {
        "assigned": list(participant.assigned_challenges.all()),
        "completed": list(participant.completed_challenges.all())
    }


def get_challenge_count_by_status(db: Session) -> dict:
    """Get count of challenges by status."""
    return {
        "pending": db.query(Challenge).filter(Challenge.status == ChallengeStatus.PENDING).count(),
        "active": db.query(Challenge).filter(Challenge.status == ChallengeStatus.ACTIVE).count(),
        "completed": db.query(Challenge).filter(Challenge.status == ChallengeStatus.COMPLETED).count(),
        "failed": db.query(Challenge).filter(Challenge.status == ChallengeStatus.FAILED).count(),
    }
