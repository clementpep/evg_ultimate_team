"""
Pydantic schemas for the shared 5v5 team composition.

Defines the request payload for updating the lineup and the resolved
response (participants expanded to summaries) exposed to the frontend.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

from app.schemas.participant import ParticipantSummary


# Limits for the five-a-side format (2x5 starters + 1 referee + bench of 3)
MAX_TEAM_SIZE = 5
MAX_BENCH_SIZE = 3
MAX_REFEREE_SIZE = 1
TeamRole = Literal["goalkeeper", "defender", "left_wing", "right_wing", "striker"]
TEAM_ROLES: list[TeamRole] = ["goalkeeper", "defender", "left_wing", "right_wing", "striker"]


class TeamSlotAssignment(BaseModel):
    """Resolved slot for one fixed five-a-side role."""
    role: TeamRole
    participant: Optional[ParticipantSummary] = None


class TeamCompositionUpdate(BaseModel):
    """
    Request schema to update the shared lineup.

    Lists contain participant IDs. Partial lineups are allowed so the
    groom can save work in progress. A participant ID may appear in at
    most one list.
    """
    team_a: list[Optional[int]] = Field(default_factory=list, description="Team A starter IDs by slot order: GK, DEF, LW, RW, ST")
    team_b: list[Optional[int]] = Field(default_factory=list, description="Team B starter IDs by slot order: GK, DEF, LW, RW, ST")
    bench: list[int] = Field(default_factory=list, description="Bench substitute IDs (max 3)")
    referee: list[int] = Field(default_factory=list, description="Referee ID (max 1)")
    team_a_name: Optional[str] = Field(None, max_length=50, description="Team A display name")
    team_b_name: Optional[str] = Field(None, max_length=50, description="Team B display name")

    class Config:
        json_schema_extra = {
            "example": {
                "team_a": [1, 3, 5, 7, 9],
                "team_b": [2, 4, 6, 8, 10],
                "bench": [11, 12],
                "referee": [13],
                "team_a_name": "Les Bleus",
                "team_b_name": "Les Rouges",
            }
        }


class TeamCompositionResponse(BaseModel):
    """Resolved lineup returned to the frontend (IDs expanded to summaries)."""
    team_a_name: str
    team_b_name: str
    team_a: list[ParticipantSummary]
    team_b: list[ParticipantSummary]
    team_a_slots: list[TeamSlotAssignment]
    team_b_slots: list[TeamSlotAssignment]
    bench: list[ParticipantSummary]
    referee: list[ParticipantSummary]
    unplaced: list[ParticipantSummary] = Field(
        ..., description="Participants not yet placed in a team, on the bench or as referee"
    )
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
