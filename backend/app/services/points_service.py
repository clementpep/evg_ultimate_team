"""
Points service for EVG Ultimate Team.

Handles all business logic related to points and transactions.
"""

from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.models import Participant, PointsTransaction, Challenge
from app.schemas.points import PointsAdd, PointsSubtract
from app.utils.exceptions import (
    ParticipantNotFoundError,
    InsufficientPointsError,
    NegativePointsError
)
from app.utils.logger import logger, log_points_transaction


def add_points_to_participant(
    db: Session,
    points_data: PointsAdd
) -> PointsTransaction:
    """
    Manually add points to a participant (admin action).

    Args:
        db: Database session
        points_data: Points addition data

    Returns:
        Created PointsTransaction instance

    Raises:
        ParticipantNotFoundError: If participant not found
    """
    # Get participant
    participant = db.query(Participant).filter(
        Participant.id == points_data.participant_id
    ).first()

    if not participant:
        raise ParticipantNotFoundError(points_data.participant_id)

    # Create transaction
    transaction = PointsTransaction.create_manual_transaction(
        participant_id=points_data.participant_id,
        amount=points_data.amount,
        reason=points_data.reason,
        admin_id=points_data.admin_id
    )

    # Update participant points
    participant.add_points(points_data.amount)

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    log_points_transaction(
        participant_id=points_data.participant_id,
        amount=points_data.amount,
        reason=points_data.reason,
        admin_id=points_data.admin_id
    )

    return transaction


def subtract_points_from_participant(
    db: Session,
    points_data: PointsSubtract
) -> PointsTransaction:
    """
    Manually subtract points from a participant (admin action).

    Args:
        db: Database session
        points_data: Points subtraction data

    Returns:
        Created PointsTransaction instance

    Raises:
        ParticipantNotFoundError: If participant not found
        InsufficientPointsError: If participant doesn't have enough points
    """
    # Get participant
    participant = db.query(Participant).filter(
        Participant.id == points_data.participant_id
    ).first()

    if not participant:
        raise ParticipantNotFoundError(points_data.participant_id)

    # Check if participant has enough points
    if participant.total_points < points_data.amount:
        raise InsufficientPointsError(
            required_points=points_data.amount,
            current_points=participant.total_points
        )

    # Create penalty transaction (negative amount)
    transaction = PointsTransaction.create_penalty_transaction(
        participant_id=points_data.participant_id,
        penalty_amount=points_data.amount,
        reason=points_data.reason,
        admin_id=points_data.admin_id
    )

    # Update participant points
    participant.subtract_points(points_data.amount)

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    log_points_transaction(
        participant_id=points_data.participant_id,
        amount=-points_data.amount,
        reason=points_data.reason,
        admin_id=points_data.admin_id
    )

    return transaction


def award_challenge_points(
    db: Session,
    participant_id: int,
    challenge_id: int,
    admin_id: int
) -> PointsTransaction:
    """
    Award points to a participant for completing a challenge.

    This is called after a challenge is validated as completed.

    Args:
        db: Database session
        participant_id: ID of participant who completed the challenge
        challenge_id: ID of completed challenge
        admin_id: ID of admin who validated the challenge

    Returns:
        Created PointsTransaction instance

    Raises:
        ParticipantNotFoundError: If participant not found
        ChallengeNotFoundError: If challenge not found
    """
    # Get participant
    participant = db.query(Participant).filter(
        Participant.id == participant_id
    ).first()

    if not participant:
        raise ParticipantNotFoundError(participant_id)

    # Get challenge
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()

    if not challenge:
        from app.utils.exceptions import ChallengeNotFoundError
        raise ChallengeNotFoundError(challenge_id)

    # Create transaction
    transaction = PointsTransaction.create_challenge_transaction(
        participant_id=participant_id,
        challenge_id=challenge_id,
        points=challenge.points,
        admin_id=admin_id
    )

    # Update participant points
    participant.add_points(challenge.points)

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    log_points_transaction(
        participant_id=participant_id,
        amount=challenge.points,
        reason=f"Completed challenge: {challenge.title}",
        admin_id=admin_id
    )

    return transaction


def get_participant_transactions(
    db: Session,
    participant_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[PointsTransaction]:
    """
    Get all transactions for a participant.

    Args:
        db: Database session
        participant_id: Participant ID
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of PointsTransaction instances

    Raises:
        ParticipantNotFoundError: If participant not found
    """
    # Verify participant exists
    participant = db.query(Participant).filter(
        Participant.id == participant_id
    ).first()

    if not participant:
        raise ParticipantNotFoundError(participant_id)

    # Get transactions ordered by most recent first
    return db.query(PointsTransaction).filter(
        PointsTransaction.participant_id == participant_id
    ).order_by(
        PointsTransaction.created_at.desc()
    ).offset(skip).limit(limit).all()


def get_participant_points_today(db: Session, participant_id: int) -> int:
    """
    Get points earned by a participant today.

    Args:
        db: Database session
        participant_id: Participant ID

    Returns:
        Total points earned today
    """
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    transactions = db.query(PointsTransaction).filter(
        PointsTransaction.participant_id == participant_id,
        PointsTransaction.created_at >= today_start,
        PointsTransaction.amount > 0  # Only positive transactions
    ).all()

    return sum(t.amount for t in transactions)


def get_total_points_distributed(db: Session) -> int:
    """
    Get total points distributed across all participants.

    Args:
        db: Database session

    Returns:
        Total points distributed
    """
    transactions = db.query(PointsTransaction).filter(
        PointsTransaction.amount > 0
    ).all()

    return sum(t.amount for t in transactions)


def get_transaction_count(db: Session) -> int:
    """
    Get total number of transactions.

    Args:
        db: Database session

    Returns:
        Total transaction count
    """
    return db.query(PointsTransaction).count()


def get_recent_transactions(db: Session, limit: int = 10) -> List[PointsTransaction]:
    """
    Get most recent transactions across all participants.

    Useful for activity feed.

    Args:
        db: Database session
        limit: Maximum number of transactions to return

    Returns:
        List of recent PointsTransaction instances
    """
    return db.query(PointsTransaction).order_by(
        PointsTransaction.created_at.desc()
    ).limit(limit).all()
