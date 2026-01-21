"""
Pack reward model for EVG Ultimate Team.

Defines predefined rewards that can be obtained from packs.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class PackReward(Base):
    """
    Pack reward model.

    Represents a possible reward that can be obtained from opening a pack.
    Each reward has a tier (bronze/silver/gold/ultimate) and rarity
    (common/rare/epic/legendary) that determines its probability.
    """

    __tablename__ = "pack_rewards"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Reward details
    tier = Column(String(20), nullable=False, index=True)  # bronze/silver/gold/ultimate
    reward_name = Column(String(200), nullable=False)
    reward_description = Column(String(500), nullable=False)
    reward_type = Column(String(50), nullable=False)  # shot/immunity/power/wildcard
    rarity = Column(String(20), nullable=False, index=True)  # common/rare/epic/legendary

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<PackReward(id={self.id}, tier={self.tier}, name={self.reward_name}, rarity={self.rarity})>"

    def to_dict(self) -> dict:
        """Convert reward to dictionary."""
        return {
            "id": self.id,
            "tier": self.tier,
            "name": self.reward_name,
            "description": self.reward_description,
            "type": self.reward_type,
            "rarity": self.rarity,
            "is_active": self.is_active,
            "created_at": self.created_at,
        }
