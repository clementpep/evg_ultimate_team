"""
Participant service for EVG Ultimate Team.

Handles all business logic related to participants.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Participant
from app.schemas.participant import ParticipantCreate, ParticipantUpdate
from app.utils.exceptions import ParticipantNotFoundError, DuplicateEntryError
from app.utils.logger import logger


# =============================================================================
# CRUD Operations
# =============================================================================

def get_all_participants(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[Participant]:
    """
    Get all participants with pagination.

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of Participant instances

    Example:
        >>> participants = get_all_participants(db, skip=0, limit=50)
        >>> for p in participants:
        >>>     print(p.name, p.total_points)
    """
    return db.query(Participant).offset(skip).limit(limit).all()


def get_participant_by_id(
    db: Session,
    participant_id: int
) -> Participant:
    """
    Get a participant by ID.

    Args:
        db: Database session
        participant_id: Participant ID

    Returns:
        Participant instance

    Raises:
        ParticipantNotFoundError: If participant not found

    Example:
        >>> participant = get_participant_by_id(db, 5)
        >>> print(participant.name)
    """
    participant = db.query(Participant).filter(
        Participant.id == participant_id
    ).first()

    if not participant:
        raise ParticipantNotFoundError(participant_id)

    return participant


def get_participant_by_name(
    db: Session,
    name: str
) -> Optional[Participant]:
    """
    Get a participant by name (case-insensitive).

    Args:
        db: Database session
        name: Participant name

    Returns:
        Participant instance or None if not found

    Example:
        >>> participant = get_participant_by_name(db, "Paul C.")
        >>> if participant:
        >>>     print(participant.id)
    """
    return db.query(Participant).filter(
        Participant.name.ilike(name)
    ).first()


def create_participant(
    db: Session,
    participant_data: ParticipantCreate
) -> Participant:
    """
    Create a new participant.

    Args:
        db: Database session
        participant_data: Participant creation data

    Returns:
        Created Participant instance

    Raises:
        DuplicateEntryError: If participant with same name already exists

    Example:
        >>> data = ParticipantCreate(name="New Participant", is_groom=False)
        >>> participant = create_participant(db, data)
        >>> print(participant.id)
    """
    # Check if participant with same name already exists
    existing = get_participant_by_name(db, participant_data.name)
    if existing:
        raise DuplicateEntryError(
            resource_type="Participant",
            field="name",
            value=participant_data.name
        )

    # Create new participant
    participant = Participant(
        name=participant_data.name,
        avatar_url=participant_data.avatar_url,
        is_groom=participant_data.is_groom,
        total_points=0,
        current_packs={"bronze": 0, "silver": 0, "gold": 0, "ultimate": 0}
    )

    db.add(participant)
    db.commit()
    db.refresh(participant)

    logger.info(
        f"Created participant: {participant.name}",
        extra={"participant_id": participant.id, "is_groom": participant.is_groom}
    )

    return participant


def update_participant(
    db: Session,
    participant_id: int,
    participant_data: ParticipantUpdate
) -> Participant:
    """
    Update a participant.

    Args:
        db: Database session
        participant_id: Participant ID to update
        participant_data: Participant update data

    Returns:
        Updated Participant instance

    Raises:
        ParticipantNotFoundError: If participant not found
        DuplicateEntryError: If new name conflicts with existing participant

    Example:
        >>> data = ParticipantUpdate(avatar_url="new_url.jpg")
        >>> participant = update_participant(db, 5, data)
    """
    # Get existing participant
    participant = get_participant_by_id(db, participant_id)

    # Check for name conflicts if name is being updated
    if participant_data.name:
        existing = get_participant_by_name(db, participant_data.name)
        if existing and existing.id != participant_id:
            raise DuplicateEntryError(
                resource_type="Participant",
                field="name",
                value=participant_data.name
            )

    # Update fields
    update_data = participant_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(participant, field, value)

    db.commit()
    db.refresh(participant)

    logger.info(
        f"Updated participant: {participant.name}",
        extra={"participant_id": participant.id}
    )

    return participant


def delete_participant(
    db: Session,
    participant_id: int
) -> None:
    """
    Delete a participant.

    WARNING: This will cascade delete all associated records
    (points transactions, challenge associations, etc.)

    Args:
        db: Database session
        participant_id: Participant ID to delete

    Raises:
        ParticipantNotFoundError: If participant not found

    Example:
        >>> delete_participant(db, 5)
    """
    participant = get_participant_by_id(db, participant_id)

    db.delete(participant)
    db.commit()

    logger.warning(
        f"Deleted participant: {participant.name}",
        extra={"participant_id": participant_id}
    )


# =============================================================================
# Special Queries
# =============================================================================

def get_groom(db: Session) -> Optional[Participant]:
    """
    Get the groom participant.

    Args:
        db: Database session

    Returns:
        Groom Participant instance or None if not found

    Example:
        >>> groom = get_groom(db)
        >>> if groom:
        >>>     print(f"The groom is {groom.name}")
    """
    return db.query(Participant).filter(Participant.is_groom == True).first()


def get_participant_count(db: Session) -> int:
    """
    Get total number of participants.

    Args:
        db: Database session

    Returns:
        Total participant count

    Example:
        >>> count = get_participant_count(db)
        >>> print(f"Total participants: {count}")
    """
    return db.query(Participant).count()


def get_top_participants(
    db: Session,
    limit: int = 3
) -> List[Participant]:
    """
    Get top participants by points.

    Args:
        db: Database session
        limit: Number of top participants to return

    Returns:
        List of top Participant instances

    Example:
        >>> top_3 = get_top_participants(db, limit=3)
        >>> for i, participant in enumerate(top_3, 1):
        >>>     print(f"{i}. {participant.name} - {participant.total_points} pts")
    """
    return db.query(Participant).order_by(
        Participant.total_points.desc()
    ).limit(limit).all()
