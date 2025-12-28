"""
Points routes for EVG Ultimate Team API.

Handles manual points adjustments and transaction history.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.points import (
    PointsAdd,
    PointsSubtract,
    PointsTransactionResponse,
    PointsHistory
)
from app.schemas.common import APIResponse
from app.services import points_service, participant_service
from app.utils.dependencies import require_admin, get_admin_id
from app.utils.exceptions import EVGException, format_exception_response
from app.utils.logger import logger

router = APIRouter(prefix="/points", tags=["Points"])


@router.post("/add", response_model=APIResponse[PointsTransactionResponse])
def add_points(
    points_data: PointsAdd,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Manually add points to a participant (admin only).

    **Requires:** Admin authentication

    **Request Body:**
    - `participant_id`: Participant to add points to
    - `amount`: Points to add (must be positive)
    - `reason`: Reason for adding points
    - `admin_id`: Admin ID making the adjustment

    **Returns:**
    - Created transaction details
    """
    try:
        transaction = points_service.add_points_to_participant(db, points_data)
        return APIResponse(
            success=True,
            data=transaction,
            message=f"Added {points_data.amount} points"
        )
    except EVGException as e:
        logger.error(f"Failed to add points: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.post("/subtract", response_model=APIResponse[PointsTransactionResponse])
def subtract_points(
    points_data: PointsSubtract,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Manually subtract points from a participant (admin only).

    **Requires:** Admin authentication

    **Request Body:**
    - `participant_id`: Participant to subtract points from
    - `amount`: Points to subtract (must be positive)
    - `reason`: Reason for subtracting points
    - `admin_id`: Admin ID making the adjustment

    **Returns:**
    - Created transaction details
    """
    try:
        transaction = points_service.subtract_points_from_participant(db, points_data)
        return APIResponse(
            success=True,
            data=transaction,
            message=f"Subtracted {points_data.amount} points"
        )
    except EVGException as e:
        logger.error(f"Failed to subtract points: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.get("/history/{participant_id}", response_model=APIResponse[PointsHistory])
def get_points_history(
    participant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get points transaction history for a participant.

    **Path Parameters:**
    - `participant_id`: Participant ID

    **Query Parameters:**
    - `skip`: Number of records to skip
    - `limit`: Maximum number of records to return

    **Returns:**
    - Participant info and their transaction history
    """
    try:
        participant = participant_service.get_participant_by_id(db, participant_id)
        transactions = points_service.get_participant_transactions(db, participant_id, skip, limit)
        total_transactions = points_service.get_transaction_count(db)

        history = PointsHistory(
            participant_id=participant.id,
            participant_name=participant.name,
            current_points=participant.total_points,
            transactions=transactions,
            total_transactions=total_transactions
        )

        return APIResponse(
            success=True,
            data=history,
            message=f"Retrieved {len(transactions)} transactions"
        )
    except EVGException as e:
        logger.error(f"Failed to get points history: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))


@router.get("/recent", response_model=APIResponse[List[PointsTransactionResponse]])
def get_recent_transactions(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get recent transactions across all participants.

    Useful for activity feed.

    **Query Parameters:**
    - `limit`: Maximum number of transactions to return (default: 10)

    **Returns:**
    - List of recent transactions
    """
    try:
        transactions = points_service.get_recent_transactions(db, limit)
        return APIResponse(
            success=True,
            data=transactions,
            message=f"Retrieved {len(transactions)} recent transactions"
        )
    except EVGException as e:
        logger.error(f"Failed to get recent transactions: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=format_exception_response(e))
