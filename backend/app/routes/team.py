"""
Team composition routes for EVG Ultimate Team API.

Exposes the shared 5v5 lineup: readable by any participant, editable
only by the groom (Paul) or the admin.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.common import APIResponse
from app.schemas.team import TeamCompositionUpdate, TeamCompositionResponse
from app.services import team_service
from app.utils.dependencies import get_current_user_payload, require_groom_or_admin
from app.utils.logger import logger

router = APIRouter(prefix="/team", tags=["Team"])


@router.get("/composition", response_model=APIResponse[TeamCompositionResponse])
def get_team_composition(
    _payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db),
):
    """
    Get the shared 5v5 lineup (teams resolved to participant summaries).

    **Authentication:** any valid token (participant or admin).
    """
    try:
        composition = team_service.get_composition(db)
        return APIResponse(
            success=True,
            data=composition,
            message="Team composition retrieved successfully",
        )
    except Exception as e:
        logger.error(f"Failed to get team composition: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve team composition")


@router.put("/composition", response_model=APIResponse[TeamCompositionResponse])
def update_team_composition(
    request: TeamCompositionUpdate,
    payload: dict = Depends(require_groom_or_admin),
    db: Session = Depends(get_db),
):
    """
    Replace the shared 5v5 lineup.

    **Authentication:** groom (Paul) or admin only.

    **Errors:**
    - 400: duplicate player, unknown player, or team/bench over capacity
    - 403: caller is neither groom nor admin
    """
    try:
        composition = team_service.update_composition(
            db, request, editor_id=payload.get("user_id")
        )
        return APIResponse(
            success=True,
            data=composition,
            message="Composition enregistrée !",
        )
    except ValueError as e:
        logger.warning(f"Team composition update rejected: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error updating team composition: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update team composition")
