"""
Pack routes for EVG Ultimate Team API.

Handles pack opening, inventory, and history operations.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.pack import (
    PackInventoryResponse,
    PackOpenRequest,
    PackOpenResponse,
    PackHistoryItem,
    PackCostsResponse,
    PackRewardResponse
)
from app.schemas.common import APIResponse
from app.services import pack_service
from app.utils.dependencies import get_current_participant
from app.utils.exceptions import EVGException, format_exception_response
from app.utils.logger import logger

router = APIRouter(prefix="/packs", tags=["Packs"])


@router.get("/inventory", response_model=APIResponse[PackInventoryResponse])
def get_inventory(
    current_user = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """
    Get current pack inventory for the authenticated participant.

    **Returns:**
    - Pack counts for bronze, silver, gold, and ultimate tiers

    **Authentication:**
    - Requires valid participant JWT token
    """
    try:
        participant_id = current_user.id
        inventory = pack_service.get_pack_inventory(db, participant_id)

        return APIResponse(
            success=True,
            data=inventory,
            message="Pack inventory retrieved successfully"
        )
    except ValueError as e:
        logger.error(f"Failed to get pack inventory for participant {current_user.id}: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error getting pack inventory: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve pack inventory")


@router.get("/costs", response_model=APIResponse[PackCostsResponse])
def get_pack_costs():
    """
    Get pack costs for all tiers.

    **Returns:**
    - Point costs for each pack tier

    **Note:**
    - This endpoint does not require authentication
    """
    try:
        costs = pack_service.get_pack_costs()

        return APIResponse(
            success=True,
            data=costs,
            message="Pack costs retrieved successfully"
        )
    except Exception as e:
        logger.error(f"Unexpected error getting pack costs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve pack costs")


@router.post("/purchase", response_model=APIResponse[PackInventoryResponse])
def purchase_pack(
    request: PackOpenRequest,
    current_user = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """
    Purchase a pack with points.

    **Request Body:**
    - `tier`: Pack tier to purchase (bronze/silver/gold/ultimate)

    **Returns:**
    - Updated pack inventory

    **Authentication:**
    - Requires valid participant JWT token

    **Errors:**
    - 400: Invalid tier or insufficient points
    - 404: Participant not found
    """
    try:
        participant_id = current_user.id
        pack_service.purchase_pack(db, participant_id, request.tier)
        inventory = pack_service.get_pack_inventory(db, participant_id)

        logger.info(f"Pack purchased: participant={participant_id}, tier={request.tier}")

        return APIResponse(
            success=True,
            data=inventory,
            message=f"Purchased {request.tier} pack successfully!"
        )
    except ValueError as e:
        logger.warning(f"Pack purchase failed for participant {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error purchasing pack: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to purchase pack")


@router.post("/open", response_model=APIResponse[PackOpenResponse])
def open_pack(
    request: PackOpenRequest,
    current_user = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """
    Open a pack and receive a random reward.

    **Request Body:**
    - `tier`: Pack tier to open (bronze/silver/gold/ultimate)

    **Returns:**
    - Reward received
    - Updated pack inventory
    - Animation data for frontend

    **Authentication:**
    - Requires valid participant JWT token

    **Errors:**
    - 400: Invalid tier or no packs available
    - 404: Participant not found
    """
    try:
        participant_id = current_user.id
        result = pack_service.open_pack(db, participant_id, request.tier)

        logger.info(f"Pack opened: participant={participant_id}, tier={request.tier}, reward={result.reward.name}")

        return APIResponse(
            success=True,
            data=result,
            message=f"Opened {request.tier} pack successfully!"
        )
    except ValueError as e:
        logger.warning(f"Pack opening failed for participant {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error opening pack: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to open pack")


@router.get("/history", response_model=APIResponse[List[PackHistoryItem]])
def get_history(
    limit: int = 50,
    current_user = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """
    Get pack opening history for the authenticated participant.

    **Query Parameters:**
    - `limit`: Maximum number of items to return (default: 50)

    **Returns:**
    - List of pack openings with rewards and timestamps

    **Authentication:**
    - Requires valid participant JWT token
    """
    try:
        participant_id = current_user.id
        history = pack_service.get_pack_history(db, participant_id, limit)

        return APIResponse(
            success=True,
            data=history,
            message=f"Retrieved {len(history)} pack opening(s)"
        )
    except Exception as e:
        logger.error(f"Unexpected error getting pack history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve pack history")


@router.get("/rewards/{tier}", response_model=APIResponse[List[PackRewardResponse]])
def get_rewards_by_tier(
    tier: str,
    db: Session = Depends(get_db)
):
    """
    Get all possible rewards for a pack tier (preview).

    **Path Parameters:**
    - `tier`: Pack tier (bronze/silver/gold/ultimate)

    **Returns:**
    - List of possible rewards for the tier

    **Note:**
    - This endpoint does not require authentication
    - Shows what rewards can be obtained from each tier
    """
    try:
        # Validate tier
        if tier not in ["bronze", "silver", "gold", "ultimate"]:
            raise HTTPException(status_code=400, detail=f"Invalid pack tier: {tier}")

        rewards = pack_service.get_rewards_by_tier(db, tier)

        # Convert to response format
        reward_responses = [
            PackRewardResponse(
                id=reward.id,
                name=reward.reward_name,
                description=reward.reward_description,
                type=reward.reward_type,
                rarity=reward.rarity
            )
            for reward in rewards
        ]

        return APIResponse(
            success=True,
            data=reward_responses,
            message=f"Retrieved {len(reward_responses)} reward(s) for {tier} tier"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting rewards for tier {tier}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve rewards")
