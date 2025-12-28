"""
Challenge database model for EVG Ultimate Team.

Represents challenges that participants can complete to earn points.
"""

from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


# =============================================================================
# Enums
# =============================================================================

class ChallengeType(str, enum.Enum):
    """
    Types of challenges available in the game.

    - INDIVIDUAL: Challenge for individual participants
    - TEAM: Challenge for teams (points shared among team members)
    - SECRET: Secret challenge revealed at specific times
    """
    INDIVIDUAL = "individual"
    TEAM = "team"
    SECRET = "secret"


class ChallengeStatus(str, enum.Enum):
    """
    Status of a challenge.

    - PENDING: Challenge available but not yet attempted
    - ACTIVE: Challenge is currently being attempted
    - COMPLETED: Challenge successfully completed and validated
    - FAILED: Challenge attempted but failed
    """
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"


# =============================================================================
# Association Tables (Many-to-Many Relationships)
# =============================================================================

# Association table for participants assigned to challenges
challenge_assignments = Table(
    "challenge_assignments",
    Base.metadata,
    Column(
        "challenge_id",
        Integer,
        ForeignKey("challenges.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Challenge ID"
    ),
    Column(
        "participant_id",
        Integer,
        ForeignKey("participants.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Participant ID assigned to the challenge"
    ),
    comment="Associates participants with challenges they're assigned to"
)

# Association table for participants who completed challenges
challenge_completions = Table(
    "challenge_completions",
    Base.metadata,
    Column(
        "challenge_id",
        Integer,
        ForeignKey("challenges.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Challenge ID"
    ),
    Column(
        "participant_id",
        Integer,
        ForeignKey("participants.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Participant ID who completed the challenge"
    ),
    comment="Associates participants with challenges they've completed"
)


# =============================================================================
# Challenge Model
# =============================================================================

class Challenge(Base):
    """
    Challenge model representing a task participants can complete for points.

    Challenges can be individual, team-based, or secret.
    Admins create challenges and validate completions.

    Attributes:
        id: Primary key, auto-incrementing
        title: Short title of the challenge
        description: Detailed description of what participants must do
        type: Type of challenge (individual, team, secret)
        points: Points awarded for completing the challenge
        status: Current status (pending, active, completed, failed)
        validated_by: ID of admin who validated the challenge completion
        created_at: Timestamp when challenge was created
        completed_at: Timestamp when challenge was completed (None if not completed)
        updated_at: Timestamp when challenge was last updated
    """

    __tablename__ = "challenges"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Basic Information
    title = Column(
        String(200),
        nullable=False,
        index=True,
        comment="Short title of the challenge"
    )

    description = Column(
        String(1000),
        nullable=False,
        comment="Detailed description of the challenge"
    )

    # Challenge Configuration
    type = Column(
        Enum(ChallengeType),
        nullable=False,
        default=ChallengeType.INDIVIDUAL,
        index=True,
        comment="Type of challenge (individual, team, secret)"
    )

    points = Column(
        Integer,
        nullable=False,
        default=20,
        comment="Points awarded for completing the challenge"
    )

    status = Column(
        Enum(ChallengeStatus),
        nullable=False,
        default=ChallengeStatus.PENDING,
        index=True,
        comment="Current status of the challenge"
    )

    # Validation
    validated_by = Column(
        Integer,
        nullable=True,
        comment="ID of admin who validated the challenge completion"
    )

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="Timestamp when challenge was created"
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp when challenge was completed"
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Timestamp when challenge was last updated"
    )

    # ==========================================================================
    # Relationships
    # ==========================================================================

    # Participants assigned to this challenge (many-to-many)
    assigned_participants = relationship(
        "Participant",
        secondary=challenge_assignments,
        backref="assigned_challenges",
        lazy="dynamic"
    )

    # Participants who completed this challenge (many-to-many)
    completed_by_participants = relationship(
        "Participant",
        secondary=challenge_completions,
        backref="completed_challenges",
        lazy="dynamic"
    )

    # ==========================================================================
    # Methods
    # ==========================================================================

    def assign_to_participant(self, participant) -> None:
        """
        Assign this challenge to a participant.

        Args:
            participant: Participant instance to assign the challenge to
        """
        if participant not in self.assigned_participants:
            self.assigned_participants.append(participant)

    def mark_as_active(self) -> None:
        """
        Mark challenge as active (being attempted).

        Raises:
            ValueError: If challenge is already completed or failed
        """
        if self.status in [ChallengeStatus.COMPLETED, ChallengeStatus.FAILED]:
            raise ValueError(f"Cannot activate a {self.status.value} challenge")
        self.status = ChallengeStatus.ACTIVE

    def mark_as_completed(self, participant, admin_id: int) -> None:
        """
        Mark challenge as completed by a participant.

        Args:
            participant: Participant who completed the challenge
            admin_id: ID of admin validating the completion

        Raises:
            ValueError: If challenge is already completed
        """
        if self.status == ChallengeStatus.COMPLETED:
            raise ValueError("Challenge is already completed")

        self.status = ChallengeStatus.COMPLETED
        self.completed_at = func.now()
        self.validated_by = admin_id

        # Add participant to completed_by list if not already there
        if participant not in self.completed_by_participants:
            self.completed_by_participants.append(participant)

    def mark_as_failed(self) -> None:
        """
        Mark challenge as failed.

        Raises:
            ValueError: If challenge is already completed
        """
        if self.status == ChallengeStatus.COMPLETED:
            raise ValueError("Cannot fail a completed challenge")
        self.status = ChallengeStatus.FAILED

    def get_assigned_participant_ids(self) -> list[int]:
        """
        Get list of participant IDs assigned to this challenge.

        Returns:
            List of participant IDs
        """
        return [p.id for p in self.assigned_participants.all()]

    def get_completed_participant_ids(self) -> list[int]:
        """
        Get list of participant IDs who completed this challenge.

        Returns:
            List of participant IDs
        """
        return [p.id for p in self.completed_by_participants.all()]

    def __repr__(self) -> str:
        """String representation of the challenge."""
        return (
            f"<Challenge(id={self.id}, title='{self.title}', "
            f"type={self.type.value}, points={self.points}, status={self.status.value})>"
        )

    def __str__(self) -> str:
        """Human-readable string representation."""
        return f"{self.title} ({self.type.value}) - {self.points} pts - {self.status.value}"
