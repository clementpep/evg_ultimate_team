"""
Pack service for EVG Ultimate Team.

Handles all business logic for pack opening, rewards, and inventory management.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, Tuple
import random
from datetime import datetime

from app.models.participant import Participant
from app.models.pack_reward import PackReward
from app.models.pack_opening import PackOpening
from app.schemas.pack import (
    PackInventoryResponse,
    PackRewardResponse,
    PackOpenResponse,
    PackHistoryItem,
    PackCostsResponse
)
from app.utils.logger import logger


# =============================================================================
# Pack Configuration
# =============================================================================

PACK_COSTS = {
    "bronze": 100,
    "silver": 200,
    "gold": 300,
    "ultimate": 500,
}

RARITY_WEIGHTS = {
    "bronze": {"common": 100},  # 100% common
    "silver": {"common": 60, "rare": 40},  # 60% common, 40% rare
    "gold": {"rare": 50, "epic": 50},  # 50% rare, 50% epic
    "ultimate": {"epic": 30, "legendary": 70},  # 30% epic, 70% legendary
}

ANIMATION_DURATIONS = {
    "common": 7,  # 7 seconds total
    "rare": 8,
    "epic": 9,
    "legendary": 10,
}


# =============================================================================
# Pack Costs
# =============================================================================

def get_pack_costs() -> PackCostsResponse:
    """
    Get pack costs for all tiers.

    Returns:
        PackCostsResponse with costs for each tier

    Example:
        >>> costs = get_pack_costs()
        >>> print(costs.bronze)
        100
    """
    return PackCostsResponse(**PACK_COSTS)


# =============================================================================
# Pack Inventory
# =============================================================================

def get_pack_inventory(db: Session, participant_id: int) -> PackInventoryResponse:
    """
    Get participant's current pack inventory.

    Args:
        db: Database session
        participant_id: ID of the participant

    Returns:
        PackInventoryResponse with pack counts

    Raises:
        ValueError: If participant not found

    Example:
        >>> inventory = get_pack_inventory(db, 1)
        >>> print(inventory.bronze)
        3
    """
    participant = db.query(Participant).filter(Participant.id == participant_id).first()

    if not participant:
        raise ValueError(f"Participant with ID {participant_id} not found")

    # Return current pack inventory - convert to dict if needed
    packs = dict(participant.current_packs) if participant.current_packs else {"bronze": 0, "silver": 0, "gold": 0, "ultimate": 0}
    return PackInventoryResponse(**packs)


# =============================================================================
# Pack Validation
# =============================================================================

def can_open_pack(db: Session, participant_id: int, tier: str) -> Tuple[bool, str]:
    """
    Check if participant can open a pack of the specified tier.

    Args:
        db: Database session
        participant_id: ID of the participant
        tier: Pack tier (bronze/silver/gold/ultimate)

    Returns:
        Tuple of (can_open: bool, reason: str)

    Example:
        >>> can_open, reason = can_open_pack(db, 1, "bronze")
        >>> if not can_open:
        >>>     print(reason)
    """
    # Validate tier
    if tier not in PACK_COSTS:
        return False, f"Invalid pack tier: {tier}"

    # Get participant
    participant = db.query(Participant).filter(Participant.id == participant_id).first()

    if not participant:
        return False, f"Participant with ID {participant_id} not found"

    # Check if participant has packs of this tier
    pack_count = participant.current_packs.get(tier, 0)

    if pack_count <= 0:
        return False, f"No {tier} packs available"

    return True, "Pack can be opened"


# =============================================================================
# Pack Rewards
# =============================================================================

def get_rewards_by_tier(db: Session, tier: str) -> list[PackReward]:
    """
    Get all possible rewards for a pack tier.

    Args:
        db: Database session
        tier: Pack tier (bronze/silver/gold/ultimate)

    Returns:
        List of PackReward objects

    Example:
        >>> rewards = get_rewards_by_tier(db, "bronze")
        >>> for reward in rewards:
        >>>     print(reward.reward_name)
    """
    return db.query(PackReward).filter(
        and_(
            PackReward.tier == tier,
            PackReward.is_active == True
        )
    ).all()


def select_random_reward(db: Session, tier: str) -> PackReward:
    """
    Select a random reward from a pack tier based on rarity weights.

    Args:
        db: Database session
        tier: Pack tier (bronze/silver/gold/ultimate)

    Returns:
        Selected PackReward

    Raises:
        ValueError: If no rewards found for tier

    Example:
        >>> reward = select_random_reward(db, "bronze")
        >>> print(reward.reward_name, reward.rarity)
    """
    # Get rarity weights for this tier
    weights = RARITY_WEIGHTS.get(tier, {"common": 100})

    # Select rarity based on weights
    rarities = list(weights.keys())
    probabilities = list(weights.values())
    selected_rarity = random.choices(rarities, weights=probabilities, k=1)[0]

    # Get all rewards of this rarity for this tier
    rewards = db.query(PackReward).filter(
        and_(
            PackReward.tier == tier,
            PackReward.rarity == selected_rarity,
            PackReward.is_active == True
        )
    ).all()

    if not rewards:
        logger.error(f"No rewards found for tier={tier}, rarity={selected_rarity}")
        # Fallback to any reward for this tier
        rewards = get_rewards_by_tier(db, tier)
        if not rewards:
            raise ValueError(f"No rewards available for tier: {tier}")

    # Select random reward from filtered list
    return random.choice(rewards)


# =============================================================================
# Pack Opening
# =============================================================================

def open_pack(db: Session, participant_id: int, tier: str) -> PackOpenResponse:
    """
    Open a pack and return the reward.

    This is the main pack opening logic that:
    1. Validates pack availability
    2. Selects a random reward
    3. Removes pack from inventory
    4. Records opening in history
    5. Returns reward with animation metadata

    Args:
        db: Database session
        participant_id: ID of the participant
        tier: Pack tier to open (bronze/silver/gold/ultimate)

    Returns:
        PackOpenResponse with reward and updated inventory

    Raises:
        ValueError: If pack cannot be opened (no inventory, invalid tier, etc.)

    Example:
        >>> result = open_pack(db, 1, "bronze")
        >>> print(result.reward.name)
        >>> print(result.new_inventory.bronze)
    """
    # Validate pack can be opened
    can_open, reason = can_open_pack(db, participant_id, tier)
    if not can_open:
        logger.warning(f"Pack opening failed for participant {participant_id}: {reason}")
        raise ValueError(reason)

    # Get participant
    participant = db.query(Participant).filter(Participant.id == participant_id).first()

    # Select random reward
    reward = select_random_reward(db, tier)

    logger.info(f"Selected reward: {reward.reward_name} (rarity: {reward.rarity}) for participant {participant_id}")

    # Remove pack from inventory (raises ValueError if pack not available)
    participant.remove_pack(tier)

    # Record pack opening in history
    pack_opening = PackOpening(
        participant_id=participant_id,
        reward_id=reward.id,
        pack_tier=tier,
        points_spent=0,  # Free pack (points not deducted)
        opened_at=datetime.utcnow()
    )
    db.add(pack_opening)

    # Commit changes
    db.commit()
    db.refresh(participant)

    logger.info(f"Pack opened successfully: participant={participant_id}, tier={tier}, reward={reward.reward_name}")

    # Build response
    reward_response = PackRewardResponse(
        id=reward.id,
        name=reward.reward_name,
        description=reward.reward_description,
        type=reward.reward_type,
        rarity=reward.rarity
    )

    new_inventory = PackInventoryResponse(**dict(participant.current_packs))

    animation_data = {
        "duration": ANIMATION_DURATIONS.get(reward.rarity, 7),
        "rarity": reward.rarity,
        "effects": _get_animation_effects(reward.rarity)
    }

    return PackOpenResponse(
        success=True,
        reward=reward_response,
        new_inventory=new_inventory,
        animation_data=animation_data
    )


def _get_animation_effects(rarity: str) -> list[str]:
    """
    Get animation effects based on reward rarity.

    Args:
        rarity: Reward rarity (common/rare/epic/legendary)

    Returns:
        List of effect names
    """
    effects_map = {
        "common": ["pulse", "fade"],
        "rare": ["pulse", "particles", "glow"],
        "epic": ["pulse", "particles", "glow", "shake"],
        "legendary": ["pulse", "particles", "glow", "shake", "confetti", "screen_shake"],
    }

    return effects_map.get(rarity, ["pulse"])


# =============================================================================
# Pack Distribution
# =============================================================================

def purchase_pack(db: Session, participant_id: int, tier: str) -> None:
    """
    Purchase a pack using pack credits.

    Deducts credits from participant and adds pack to inventory.
    Note: This does NOT affect total_points, which never decrease.

    Args:
        db: Database session
        participant_id: ID of the participant
        tier: Pack tier to purchase (bronze/silver/gold/ultimate)

    Raises:
        ValueError: If participant not found, invalid tier, or insufficient credits

    Example:
        >>> purchase_pack(db, 1, "bronze")
        >>> # Deducts 100 credits and adds 1 bronze pack
    """
    participant = db.query(Participant).filter(Participant.id == participant_id).first()

    if not participant:
        raise ValueError(f"Participant with ID {participant_id} not found")

    if tier not in PACK_COSTS:
        raise ValueError(f"Invalid pack tier: {tier}")

    cost = PACK_COSTS[tier]

    # Check if participant has enough credits
    if participant.pack_credits < cost:
        raise ValueError(f"Insufficient credits. Need {cost} credits, have {participant.pack_credits}")

    # Deduct credits (NOT points - points never decrease)
    participant.subtract_credits(cost)

    # Add pack to inventory
    participant.add_pack(tier)

    db.commit()

    logger.info(f"Participant {participant_id} purchased {tier} pack for {cost} credits")


def add_free_pack(db: Session, participant_id: int, tier: str, count: int = 1) -> None:
    """
    Add free pack(s) to participant's inventory.

    Args:
        db: Database session
        participant_id: ID of the participant
        tier: Pack tier to add (bronze/silver/gold/ultimate)
        count: Number of packs to add (default: 1)

    Raises:
        ValueError: If participant not found or invalid tier

    Example:
        >>> add_free_pack(db, 1, "bronze", 2)
        >>> # Adds 2 bronze packs to participant 1
    """
    participant = db.query(Participant).filter(Participant.id == participant_id).first()

    if not participant:
        raise ValueError(f"Participant with ID {participant_id} not found")

    if tier not in PACK_COSTS:
        raise ValueError(f"Invalid pack tier: {tier}")

    # Add packs to inventory
    for _ in range(count):
        participant.add_pack(tier)

    db.commit()

    logger.info(f"Added {count} {tier} pack(s) to participant {participant_id}")


def distribute_free_packs_to_all(db: Session, pack_distribution: dict) -> int:
    """
    Distribute free packs to all participants.

    Args:
        db: Database session
        pack_distribution: Dictionary mapping tier to count
            Example: {"bronze": 2, "silver": 1}

    Returns:
        Number of participants who received packs

    Example:
        >>> count = distribute_free_packs_to_all(db, {"bronze": 2})
        >>> print(f"Distributed to {count} participants")
    """
    participants = db.query(Participant).all()

    for participant in participants:
        for tier, count in pack_distribution.items():
            if tier not in PACK_COSTS:
                logger.warning(f"Invalid tier '{tier}' in distribution, skipping")
                continue

            for _ in range(count):
                participant.add_pack(tier)

    db.commit()

    logger.info(f"Distributed {pack_distribution} to {len(participants)} participants")

    return len(participants)


# =============================================================================
# Pack History
# =============================================================================

def get_pack_history(db: Session, participant_id: int, limit: int = 50) -> list[PackHistoryItem]:
    """
    Get participant's pack opening history.

    Args:
        db: Database session
        participant_id: ID of the participant
        limit: Maximum number of items to return (default: 50)

    Returns:
        List of PackHistoryItem objects

    Example:
        >>> history = get_pack_history(db, 1, limit=10)
        >>> for item in history:
        >>>     print(item.reward_name, item.opened_at)
    """
    openings = db.query(PackOpening).filter(
        PackOpening.participant_id == participant_id
    ).order_by(PackOpening.opened_at.desc()).limit(limit).all()

    return [
        PackHistoryItem(
            id=opening.id,
            pack_tier=opening.pack_tier,
            reward_name=opening.reward.reward_name,
            reward_description=opening.reward.reward_description,
            opened_at=opening.opened_at,
            points_spent=opening.points_spent
        )
        for opening in openings
    ]
