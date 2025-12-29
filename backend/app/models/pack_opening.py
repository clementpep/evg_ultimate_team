"""
Pack opening history model for EVG Ultimate Team.

Tracks all pack openings by participants.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PackOpening(Base):
    """
    Pack opening history model.

    Records each pack opening event, including who opened it,
    what tier it was, what reward was received, and how many
    points were spent (0 if it was a free pack).
    """

    __tablename__ = "pack_openings"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    participant_id = Column(Integer, ForeignKey("participants.id"), nullable=False, index=True)
    reward_id = Column(Integer, ForeignKey("pack_rewards.id"), nullable=False)

    # Pack details
    pack_tier = Column(String, nullable=False, index=True)  # bronze/silver/gold/ultimate
    points_spent = Column(Integer, default=0, nullable=False)  # 0 if free pack

    # Timestamp
    opened_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    participant = relationship("Participant", back_populates="pack_openings")
    reward = relationship("PackReward")

    def __repr__(self) -> str:
        return f"<PackOpening(id={self.id}, participant_id={self.participant_id}, tier={self.pack_tier}, reward_id={self.reward_id})>"

    def to_dict(self) -> dict:
        """Convert pack opening to dictionary."""
        return {
            "id": self.id,
            "participant_id": self.participant_id,
            "pack_tier": self.pack_tier,
            "reward_name": self.reward.reward_name if self.reward else None,
            "reward_description": self.reward.reward_description if self.reward else None,
            "points_spent": self.points_spent,
            "opened_at": self.opened_at,
        }
