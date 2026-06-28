"""
Team composition model for EVG Ultimate Team.

Stores the single shared 5v5 lineup arranged by the groom (Paul):
two teams of up to 5 starters plus a bench of up to 3 substitutes.
Only one row ever exists (id=1); it is visible to everyone and editable
by the groom or the admin.
"""

from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base


class TeamComposition(Base):
    """
    Single-row model holding the shared five-a-side lineup.

    team_a / team_b are ordered lists of participant IDs (max 5 each),
    bench is a list of participant IDs (max 3). A participant ID appears
    in at most one of the three lists.
    """

    __tablename__ = "team_composition"

    id = Column(Integer, primary_key=True, index=True)

    team_a_name = Column(String(50), default="Les Bleus", nullable=False)
    team_b_name = Column(String(50), default="Les Rouges", nullable=False)

    team_a = Column(JSON, default=list, nullable=False)
    team_b = Column(JSON, default=list, nullable=False)
    bench = Column(JSON, default=list, nullable=False)
    referee = Column(JSON, default=list, nullable=False)  # at most 1 participant id

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    updated_by = Column(Integer, nullable=True, comment="Participant/admin id of last editor")

    def __repr__(self) -> str:
        return (
            f"<TeamComposition(a={len(self.team_a or [])}, "
            f"b={len(self.team_b or [])}, bench={len(self.bench or [])}, "
            f"referee={len(self.referee or [])})>"
        )
