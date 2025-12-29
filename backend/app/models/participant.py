"""
Participant database model for EVG Ultimate Team.

Represents a participant in the bachelor party event.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Participant(Base):
    """
    Participant model representing an event participant.

    Each participant can complete challenges, earn points, and open packs.
    Paul (the groom) is marked with is_groom=True for special handling.

    Attributes:
        id: Primary key, auto-incrementing
        name: Participant's full name
        avatar_url: URL or path to participant's avatar image
        is_groom: Whether this participant is the groom (Paul)
        total_points: Current total points accumulated
        current_packs: JSON object with pack counts {bronze: int, silver: int, gold: int, ultimate: int}
        created_at: Timestamp when participant was created
        updated_at: Timestamp when participant was last updated
    """

    __tablename__ = "participants"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Basic Information
    name = Column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
        comment="Participant's full name (used for login)"
    )

    avatar_url = Column(
        String(500),
        nullable=True,
        comment="URL or path to participant's avatar image"
    )

    is_groom = Column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        comment="True if this participant is the groom (Paul)"
    )

    has_received_welcome_pack = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="True if participant has received welcome pack (1 silver)"
    )

    # Points
    total_points = Column(
        Integer,
        default=0,
        nullable=False,
        index=True,
        comment="Current total points accumulated (never decreases)"
    )

    # Pack Credits - separate from points, used to purchase packs
    pack_credits = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Credits for purchasing packs (1 point earned = 1 credit)"
    )

    # Pack Inventory (Phase 2 feature, prepared for future use)
    current_packs = Column(
        JSON,
        default={"bronze": 0, "silver": 0, "gold": 0, "ultimate": 0},
        nullable=False,
        comment="Pack counts for each tier"
    )

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Timestamp when participant was created"
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Timestamp when participant was last updated"
    )

    # ==========================================================================
    # Relationships
    # ==========================================================================

    # Relationship to points transactions
    points_transactions = relationship(
        "PointsTransaction",
        back_populates="participant",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )

    # Relationship to challenges (many-to-many through association table)
    # This will be defined when we create the Challenge model

    # Relationship to pack openings
    pack_openings = relationship(
        "PackOpening",
        back_populates="participant",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )

    # ==========================================================================
    # Methods
    # ==========================================================================

    def add_points(self, amount: int) -> None:
        """
        Add points to the participant's total AND pack credits.

        Points are used for leaderboard ranking and never decrease.
        Pack credits are also added (1:1 ratio) and can be spent on packs.

        Args:
            amount: Points to add (positive integer)

        Raises:
            ValueError: If amount is negative
        """
        if amount < 0:
            raise ValueError("Cannot add negative points.")
        self.total_points += amount
        self.pack_credits += amount

    def subtract_credits(self, amount: int) -> None:
        """
        Subtract pack credits (used for purchasing packs).

        Note: This does NOT affect total_points, which never decrease.

        Args:
            amount: Credits to subtract (positive integer)

        Raises:
            ValueError: If amount is negative or insufficient credits
        """
        if amount < 0:
            raise ValueError("Cannot subtract negative credits.")
        if self.pack_credits < amount:
            raise ValueError(f"Insufficient credits. Need {amount}, have {self.pack_credits}")
        self.pack_credits -= amount

    def add_pack(self, pack_tier: str) -> None:
        """
        Add a pack to the participant's inventory.

        Args:
            pack_tier: Pack tier (bronze, silver, gold, ultimate)

        Raises:
            ValueError: If pack_tier is invalid
        """
        valid_tiers = ["bronze", "silver", "gold", "ultimate"]
        if pack_tier not in valid_tiers:
            raise ValueError(f"Invalid pack tier. Must be one of: {valid_tiers}")

        # SQLAlchemy doesn't track JSON mutations automatically
        # We need to create a new dict and reassign
        packs = dict(self.current_packs)
        packs[pack_tier] += 1
        self.current_packs = packs

    def remove_pack(self, pack_tier: str) -> None:
        """
        Remove a pack from the participant's inventory.

        Args:
            pack_tier: Pack tier (bronze, silver, gold, ultimate)

        Raises:
            ValueError: If pack_tier is invalid or participant has no packs of that tier
        """
        valid_tiers = ["bronze", "silver", "gold", "ultimate"]
        if pack_tier not in valid_tiers:
            raise ValueError(f"Invalid pack tier. Must be one of: {valid_tiers}")

        if self.current_packs[pack_tier] <= 0:
            raise ValueError(f"No {pack_tier} packs available to remove")

        # SQLAlchemy doesn't track JSON mutations automatically
        packs = dict(self.current_packs)
        packs[pack_tier] -= 1
        self.current_packs = packs

    def __repr__(self) -> str:
        """String representation of the participant."""
        groom_badge = " (GROOM)" if self.is_groom else ""
        return f"<Participant(id={self.id}, name='{self.name}', points={self.total_points}{groom_badge})>"

    def __str__(self) -> str:
        """Human-readable string representation."""
        return f"{self.name} - {self.total_points} pts"
