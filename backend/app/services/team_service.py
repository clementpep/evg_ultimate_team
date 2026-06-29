"""
Team composition service for EVG Ultimate Team.

Handles the single shared 5v5 lineup: reading the resolved composition
and updating it with validation (unique players, team/bench size caps).
"""

from sqlalchemy.orm import Session
from typing import Optional

from app.models.participant import Participant
from app.models.team_composition import TeamComposition
from app.schemas.participant import ParticipantSummary
from app.schemas.team import (
    TeamCompositionUpdate,
    TeamCompositionResponse,
    TeamSlotAssignment,
    TEAM_ROLES,
    MAX_TEAM_SIZE,
    MAX_BENCH_SIZE,
    MAX_REFEREE_SIZE,
)
from app.utils.logger import logger

# Fixed primary key for the single shared composition row
COMPOSITION_ID = 1


def _get_or_create_row(db: Session) -> TeamComposition:
    """Return the single composition row, creating a default one if absent."""
    row = db.query(TeamComposition).filter(TeamComposition.id == COMPOSITION_ID).first()
    if row is None:
        row = TeamComposition(
            id=COMPOSITION_ID,
            team_a=[],
            team_b=[],
            bench=[],
            referee=[],
        )
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def _normalize_slots(ids: list[Optional[int]] | None) -> list[Optional[int]]:
    """Pad/truncate a starter list to the fixed five-a-side slot order."""
    slots = list(ids or [])[:MAX_TEAM_SIZE]
    return slots + [None] * (MAX_TEAM_SIZE - len(slots))


def _resolve(ids: list[Optional[int]], by_id: dict[int, Participant]) -> list[ParticipantSummary]:
    """Map an ordered list of IDs to participant summaries, skipping empty/unknown slots."""
    return [ParticipantSummary.model_validate(by_id[pid]) for pid in ids if pid is not None and pid in by_id]


def _resolve_slots(ids: list[Optional[int]], by_id: dict[int, Participant]) -> list[TeamSlotAssignment]:
    """Resolve the fixed five starter slots with their semantic roles."""
    normalized = _normalize_slots(ids)
    return [
        TeamSlotAssignment(
            role=role,
            participant=ParticipantSummary.model_validate(by_id[pid]) if pid is not None and pid in by_id else None,
        )
        for role, pid in zip(TEAM_ROLES, normalized)
    ]


def get_composition(db: Session) -> TeamCompositionResponse:
    """
    Get the shared lineup with participants resolved to summaries.

    Also computes ``unplaced``: every participant not currently assigned
    to a team or the bench.
    """
    row = _get_or_create_row(db)

    participants = db.query(Participant).order_by(Participant.total_points.desc()).all()
    by_id = {p.id: p for p in participants}

    team_a_ids = _normalize_slots(row.team_a)
    team_b_ids = _normalize_slots(row.team_b)
    bench_ids = list(row.bench or [])
    referee_ids = list(row.referee or [])
    placed = {pid for pid in team_a_ids + team_b_ids + bench_ids + referee_ids if pid is not None}

    unplaced = [ParticipantSummary.model_validate(p) for p in participants if p.id not in placed]

    return TeamCompositionResponse(
        team_a_name=row.team_a_name,
        team_b_name=row.team_b_name,
        team_a=_resolve(team_a_ids, by_id),
        team_b=_resolve(team_b_ids, by_id),
        team_a_slots=_resolve_slots(team_a_ids, by_id),
        team_b_slots=_resolve_slots(team_b_ids, by_id),
        bench=_resolve(bench_ids, by_id),
        referee=_resolve(referee_ids, by_id),
        unplaced=unplaced,
        updated_at=row.updated_at,
    )


def update_composition(
    db: Session,
    data: TeamCompositionUpdate,
    editor_id: Optional[int] = None,
) -> TeamCompositionResponse:
    """
    Replace the shared lineup after validation.

    Validations:
    - all IDs reference existing participants
    - no participant appears more than once across the three lists
    - team sizes <= 5, bench size <= 3

    Partial lineups (empty slots) are allowed so the groom can save WIP.

    Raises:
        ValueError: if any validation fails
    """
    if len(data.team_a) > MAX_TEAM_SIZE or len(data.team_b) > MAX_TEAM_SIZE:
        raise ValueError(f"Une équipe ne peut compter plus de {MAX_TEAM_SIZE} postes")
    if len(data.bench) > MAX_BENCH_SIZE:
        raise ValueError(f"Le banc ne peut compter plus de {MAX_BENCH_SIZE} joueurs")
    if len(data.referee) > MAX_REFEREE_SIZE:
        raise ValueError("Il ne peut y avoir qu'un seul arbitre")

    team_a_slots = _normalize_slots(data.team_a)
    team_b_slots = _normalize_slots(data.team_b)
    all_ids = [pid for pid in team_a_slots + team_b_slots + list(data.bench) + list(data.referee) if pid is not None]

    # Uniqueness across all three lists
    if len(all_ids) != len(set(all_ids)):
        raise ValueError("Un joueur ne peut être placé qu'une seule fois")

    # Existence check
    if all_ids:
        existing = {
            pid for (pid,) in db.query(Participant.id).filter(Participant.id.in_(all_ids)).all()
        }
        missing = set(all_ids) - existing
        if missing:
            raise ValueError(f"Joueur(s) introuvable(s): {sorted(missing)}")

    row = _get_or_create_row(db)
    row.team_a = team_a_slots
    row.team_b = team_b_slots
    row.bench = list(data.bench)
    row.referee = list(data.referee)
    if data.team_a_name is not None:
        row.team_a_name = data.team_a_name.strip() or row.team_a_name
    if data.team_b_name is not None:
        row.team_b_name = data.team_b_name.strip() or row.team_b_name
    row.updated_by = editor_id

    db.commit()
    db.refresh(row)

    logger.info(
        f"Team composition updated by {editor_id}: "
        f"A={len(row.team_a)} B={len(row.team_b)} bench={len(row.bench)} "
        f"referee={len(row.referee)}"
    )

    return get_composition(db)
