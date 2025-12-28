"""
Points Transaction database model for EVG Ultimate Team.

Tracks all point changes for participants, providing a complete audit trail.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PointsTransaction(Base):
    """
    Points transaction model for tracking all point changes.

    Every time a participant gains or loses points, a transaction record
    is created. This provides a complete audit trail and history.

    Attributes:
        id: Primary key, auto-incrementing
        participant_id: ID of participant whose points changed
        amount: Points amount (positive for gain, negative for loss)
        reason: Human-readable reason for the transaction
        challenge_id: Optional ID of challenge that caused this transaction
        event_id: Optional ID of event that caused this transaction (Phase 2)
        created_by: ID of admin who created the transaction (None for system)
        created_at: Timestamp when transaction was created
    """

    __tablename__ = "points_transactions"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Foreign Keys
    participant_id = Column(
        Integer,
        ForeignKey("participants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID of participant whose points changed"
    )

    challenge_id = Column(
        Integer,
        ForeignKey("challenges.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Optional ID of challenge that caused this transaction"
    )

    # Transaction Details
    amount = Column(
        Integer,
        nullable=False,
        comment="Points amount (positive for gain, negative for loss)"
    )

    reason = Column(
        String(500),
        nullable=False,
        comment="Human-readable reason for the transaction"
    )

    # Metadata
    created_by = Column(
        Integer,
        nullable=True,
        comment="ID of admin who created the transaction (None for system)"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="Timestamp when transaction was created"
    )

    # ==========================================================================
    # Relationships
    # ==========================================================================

    # Relationship to participant
    participant = relationship(
        "Participant",
        back_populates="points_transactions"
    )

    # Relationship to challenge (optional)
    challenge = relationship(
        "Challenge",
        backref="points_transactions",
        foreign_keys=[challenge_id]
    )

    # ==========================================================================
    # Class Methods
    # ==========================================================================

    @classmethod
    def create_challenge_transaction(
        cls,
        participant_id: int,
        challenge_id: int,
        points: int,
        admin_id: int
    ):
        """
        Create a transaction for completing a challenge.

        Args:
            participant_id: ID of participant earning points
            challenge_id: ID of completed challenge
            points: Points earned
            admin_id: ID of admin who validated the challenge

        Returns:
            New PointsTransaction instance
        """
        return cls(
            participant_id=participant_id,
            challenge_id=challenge_id,
            amount=points,
            reason=f"Completed challenge (ID: {challenge_id})",
            created_by=admin_id
        )

    @classmethod
    def create_manual_transaction(
        cls,
        participant_id: int,
        amount: int,
        reason: str,
        admin_id: int
    ):
        """
        Create a manual transaction (admin adjustment).

        Args:
            participant_id: ID of participant
            amount: Points to add/subtract
            reason: Reason for the adjustment
            admin_id: ID of admin making the adjustment

        Returns:
            New PointsTransaction instance
        """
        return cls(
            participant_id=participant_id,
            amount=amount,
            reason=reason,
            created_by=admin_id
        )

    @classmethod
    def create_penalty_transaction(
        cls,
        participant_id: int,
        penalty_amount: int,
        reason: str,
        admin_id: int = None
    ):
        """
        Create a penalty transaction (negative points).

        Args:
            participant_id: ID of participant being penalized
            penalty_amount: Penalty points (will be made negative)
            reason: Reason for the penalty
            admin_id: Optional ID of admin applying the penalty

        Returns:
            New PointsTransaction instance
        """
        return cls(
            participant_id=participant_id,
            amount=-abs(penalty_amount),  # Ensure it's negative
            reason=f"Penalty: {reason}",
            created_by=admin_id
        )

    # ==========================================================================
    # Instance Methods
    # ==========================================================================

    def is_positive(self) -> bool:
        """
        Check if this transaction added points.

        Returns:
            True if amount is positive, False otherwise
        """
        return self.amount > 0

    def is_negative(self) -> bool:
        """
        Check if this transaction subtracted points.

        Returns:
            True if amount is negative, False otherwise
        """
        return self.amount < 0

    def is_from_challenge(self) -> bool:
        """
        Check if this transaction is from a challenge completion.

        Returns:
            True if challenge_id is set, False otherwise
        """
        return self.challenge_id is not None

    def is_manual_adjustment(self) -> bool:
        """
        Check if this transaction is a manual adjustment by admin.

        Returns:
            True if there's no associated challenge, False otherwise
        """
        return self.challenge_id is None

    def __repr__(self) -> str:
        """String representation of the transaction."""
        sign = "+" if self.amount >= 0 else ""
        return (
            f"<PointsTransaction(id={self.id}, participant_id={self.participant_id}, "
            f"amount={sign}{self.amount}, reason='{self.reason}')>"
        )

    def __str__(self) -> str:
        """Human-readable string representation."""
        sign = "+" if self.amount >= 0 else ""
        return f"{sign}{self.amount} pts - {self.reason}"
