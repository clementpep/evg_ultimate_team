"""
Leaderboard routes for EVG Ultimate Team API.

Handles leaderboard and rankings.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.participant import ParticipantWithRank
from app.schemas.common import APIResponse
from app.services import leaderboard_service
from app.utils.exceptions import EVGException, format_exception_response
from app.utils.logger import logger

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("", response_model=APIResponse[List[ParticipantWithRank]])
def get_leaderboard(
    include_today: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get the current leaderboard with all participants ranked by points.

    **Query Parameters:**
    - `include_today`: Include points earned today (default: false)

    **Returns:**
    - List of participants ranked by total points
    """
    try:
        leaderboard = leaderboard_service.get_leaderboard(db, include_today_points=include_today)
        return APIResponse(
            success=True,
            data=leaderboard,
            message=f"Leaderboard with {len(leaderboard)} participants"
        )
    except EVGException as e:
        logger.error(f"Failed to get leaderboard: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.get("/top-3", response_model=APIResponse[List[ParticipantWithRank]])
def get_top_3(db: Session = Depends(get_db)):
    """
    Get the top 3 participants (podium).

    **Returns:**
    - Top 3 participants ranked by total points
    """
    try:
        podium = leaderboard_service.get_top_3(db)
        return APIResponse(
            success=True,
            data=podium,
            message="Top 3 participants"
        )
    except EVGException as e:
        logger.error(f"Failed to get top 3: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.get("/daily", response_model=APIResponse[ParticipantWithRank])
def get_daily_leader(db: Session = Depends(get_db)):
    """
    Get the current daily leader (participant with most points today).

    According to the event rules, the daily leader chooses the next day's aperitif theme.

    **Returns:**
    - Daily leader with today's points
    """
    try:
        daily_leader = leaderboard_service.get_daily_leader(db)
        return APIResponse(
            success=True,
            data=daily_leader,
            message=f"Today's leader: {daily_leader.name if daily_leader else 'No leader yet'}"
        )
    except EVGException as e:
        logger.error(f"Failed to get daily leader: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.get("/rank/{participant_id}", response_model=APIResponse[dict])
def get_participant_rank(
    participant_id: int,
    db: Session = Depends(get_db)
):
    """
    Get the current rank of a specific participant.

    **Path Parameters:**
    - `participant_id`: Participant ID

    **Returns:**
    - Current rank (1-based)
    """
    try:
        rank = leaderboard_service.get_participant_rank(db, participant_id)
        return APIResponse(
            success=True,
            data={"participant_id": participant_id, "rank": rank},
            message=f"Participant is ranked #{rank}"
        )
    except EVGException as e:
        logger.error(f"Failed to get participant rank: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.get("/stats", response_model=APIResponse[dict])
def get_leaderboard_stats(db: Session = Depends(get_db)):
    """
    Get statistics about the leaderboard.

    **Returns:**
    - Statistics including average points, highest/lowest points, etc.
    """
    try:
        stats = leaderboard_service.get_leaderboard_stats(db)
        return APIResponse(
            success=True,
            data=stats,
            message="Leaderboard statistics"
        )
    except EVGException as e:
        logger.error(f"Failed to get leaderboard stats: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))
