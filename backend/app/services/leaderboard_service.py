"""
Leaderboard service for EVG Ultimate Team.

Handles all business logic related to leaderboard and rankings.
"""

from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.models import Participant
from app.schemas.participant import ParticipantWithRank
from app.services.points_service import get_participant_points_today


def get_leaderboard(db: Session, include_today_points: bool = False) -> List[ParticipantWithRank]:
    """
    Get the current leaderboard with all participants ranked by points.

    Args:
        db: Database session
        include_today_points: Whether to include points earned today

    Returns:
        List of ParticipantWithRank instances, ordered by rank

    Example:
        >>> leaderboard = get_leaderboard(db, include_today_points=True)
        >>> for entry in leaderboard:
        >>>     print(f"{entry.rank}. {entry.name} - {entry.total_points} pts")
    """
    # Get all participants ordered by points (descending)
    participants = db.query(Participant).order_by(
        Participant.total_points.desc()
    ).all()

    # Build leaderboard with rankings
    leaderboard = []
    for rank, participant in enumerate(participants, start=1):
        # Get today's points if requested
        points_today = None
        if include_today_points:
            points_today = get_participant_points_today(db, participant.id)

        leaderboard_entry = ParticipantWithRank(
            id=participant.id,
            name=participant.name,
            avatar_url=participant.avatar_url,
            is_groom=participant.is_groom,
            total_points=participant.total_points,
            rank=rank,
            points_today=points_today
        )
        leaderboard.append(leaderboard_entry)

    return leaderboard


def get_top_3(db: Session) -> List[ParticipantWithRank]:
    """
    Get the top 3 participants (podium).

    Args:
        db: Database session

    Returns:
        List of top 3 ParticipantWithRank instances

    Example:
        >>> podium = get_top_3(db)
        >>> print(f"Winner: {podium[0].name}")
    """
    leaderboard = get_leaderboard(db, include_today_points=False)
    return leaderboard[:3]


def get_participant_rank(db: Session, participant_id: int) -> int:
    """
    Get the current rank of a specific participant.

    Args:
        db: Database session
        participant_id: Participant ID

    Returns:
        Current rank (1-based)

    Raises:
        ParticipantNotFoundError: If participant not found

    Example:
        >>> rank = get_participant_rank(db, 5)
        >>> print(f"You are ranked #{rank}")
    """
    from app.utils.exceptions import ParticipantNotFoundError

    participant = db.query(Participant).filter(
        Participant.id == participant_id
    ).first()

    if not participant:
        raise ParticipantNotFoundError(participant_id)

    # Count how many participants have more points
    higher_ranked = db.query(Participant).filter(
        Participant.total_points > participant.total_points
    ).count()

    # Rank is number of higher ranked participants + 1
    return higher_ranked + 1


def get_daily_leader(db: Session) -> ParticipantWithRank:
    """
    Get the current daily leader (participant with most points today).

    According to specs, the daily leader chooses the next day's aperitif theme.

    Args:
        db: Database session

    Returns:
        ParticipantWithRank instance of daily leader

    Example:
        >>> daily_leader = get_daily_leader(db)
        >>> print(f"Today's leader: {daily_leader.name}")
    """
    # Get all participants
    participants = db.query(Participant).all()

    # Calculate today's points for each participant
    daily_scores = []
    for participant in participants:
        points_today = get_participant_points_today(db, participant.id)
        daily_scores.append({
            "participant": participant,
            "points_today": points_today
        })

    # Sort by points today (descending)
    daily_scores.sort(key=lambda x: x["points_today"], reverse=True)

    # Get the leader
    if not daily_scores:
        return None

    leader_data = daily_scores[0]
    participant = leader_data["participant"]

    return ParticipantWithRank(
        id=participant.id,
        name=participant.name,
        avatar_url=participant.avatar_url,
        is_groom=participant.is_groom,
        total_points=participant.total_points,
        rank=get_participant_rank(db, participant.id),
        points_today=leader_data["points_today"]
    )


def get_leaderboard_stats(db: Session) -> dict:
    """
    Get statistics about the leaderboard.

    Args:
        db: Database session

    Returns:
        Dictionary with leaderboard statistics

    Example:
        >>> stats = get_leaderboard_stats(db)
        >>> print(f"Average points: {stats['average_points']}")
    """
    participants = db.query(Participant).all()

    if not participants:
        return {
            "total_participants": 0,
            "average_points": 0,
            "highest_points": 0,
            "lowest_points": 0,
            "total_points_distributed": 0
        }

    points_list = [p.total_points for p in participants]

    from app.services.points_service import get_total_points_distributed

    return {
        "total_participants": len(participants),
        "average_points": sum(points_list) / len(points_list),
        "highest_points": max(points_list),
        "lowest_points": min(points_list),
        "total_points_distributed": get_total_points_distributed(db)
    }


def get_participant_position_change(
    db: Session,
    participant_id: int,
    previous_leaderboard: List[ParticipantWithRank]
) -> int:
    """
    Calculate how much a participant's rank changed since the last leaderboard.

    Useful for showing "up 2 positions" or "down 1 position" in the UI.

    Args:
        db: Database session
        participant_id: Participant ID
        previous_leaderboard: Previous leaderboard state

    Returns:
        Position change (positive = moved up, negative = moved down, 0 = no change)

    Example:
        >>> change = get_participant_position_change(db, 5, old_leaderboard)
        >>> if change > 0:
        >>>     print(f"Moved up {change} positions!")
    """
    # Get current rank
    current_rank = get_participant_rank(db, participant_id)

    # Find previous rank
    previous_rank = None
    for entry in previous_leaderboard:
        if entry.id == participant_id:
            previous_rank = entry.rank
            break

    if previous_rank is None:
        return 0  # Participant wasn't in previous leaderboard

    # Calculate change (note: lower rank number = better position)
    # So if rank went from 5 to 3, that's +2 positions (improvement)
    return previous_rank - current_rank
