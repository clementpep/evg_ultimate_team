"""
Seed script for pack rewards.

Creates initial pack rewards in the database based on the specification.
"""

import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.pack_reward import PackReward
from app.utils.logger import logger


# =============================================================================
# Pack Rewards Data
# =============================================================================

PACK_REWARDS = [
    # -------------------------------------------------------------------------
    # BRONZE PACK REWARDS (100 pts) - All Common
    # -------------------------------------------------------------------------
    {
        "tier": "bronze",
        "reward_name": "Shot offert",
        "reward_description": "Profite d'un shot gratuit !",
        "reward_type": "shot",
        "rarity": "common",
    },
    {
        "tier": "bronze",
        "reward_name": "Passe ton tour sur pénalité",
        "reward_description": "Évite la prochaine pénalité",
        "reward_type": "immunity",
        "rarity": "common",
    },
    {
        "tier": "bronze",
        "reward_name": "Choisis la musique 1h",
        "reward_description": "Contrôle la playlist pendant 1 heure",
        "reward_type": "power",
        "rarity": "common",
    },
    {
        "tier": "bronze",
        "reward_name": "Shot supplémentaire",
        "reward_description": "Encore un shot gratuit !",
        "reward_type": "shot",
        "rarity": "common",
    },
    {
        "tier": "bronze",
        "reward_name": "Évite une corvée",
        "reward_description": "Passe ton tour sur la prochaine corvée",
        "reward_type": "immunity",
        "rarity": "common",
    },

    # -------------------------------------------------------------------------
    # SILVER PACK REWARDS (200 pts) - 60% Common, 40% Rare
    # -------------------------------------------------------------------------
    # Common (60%)
    {
        "tier": "silver",
        "reward_name": "Désigne un gage",
        "reward_description": "Choisis un gage pour un autre participant",
        "reward_type": "power",
        "rarity": "common",
    },
    {
        "tier": "silver",
        "reward_name": "Double points prochain défi",
        "reward_description": "x2 points sur ton prochain défi complété",
        "reward_type": "power",
        "rarity": "common",
    },
    {
        "tier": "silver",
        "reward_name": "Paul te sert 2h",
        "reward_description": "Paul doit te servir tes boissons pendant 2 heures",
        "reward_type": "power",
        "rarity": "common",
    },

    # Rare (40%)
    {
        "tier": "silver",
        "reward_name": "Triple shot",
        "reward_description": "Distribue 3 shots à qui tu veux",
        "reward_type": "shot",
        "rarity": "rare",
    },
    {
        "tier": "silver",
        "reward_name": "Immunité totale 1h",
        "reward_description": "Immunisé contre tous les gages et pénalités pendant 1 heure",
        "reward_type": "immunity",
        "rarity": "rare",
    },

    # -------------------------------------------------------------------------
    # GOLD PACK REWARDS (300 pts) - 50% Rare, 50% Epic
    # -------------------------------------------------------------------------
    # Rare (50%)
    {
        "tier": "gold",
        "reward_name": "Immunité dimanche matin",
        "reward_description": "Pas de corvée dimanche matin - tu peux rester au lit !",
        "reward_type": "immunity",
        "rarity": "rare",
    },
    {
        "tier": "gold",
        "reward_name": "Choisis activité bonus",
        "reward_description": "Propose une activité bonus pour le groupe",
        "reward_type": "power",
        "rarity": "rare",
    },
    {
        "tier": "gold",
        "reward_name": "Paul fait ton lit",
        "reward_description": "Paul doit faire ton lit demain matin",
        "reward_type": "power",
        "rarity": "rare",
    },

    # Epic (50%)
    {
        "tier": "gold",
        "reward_name": "Bouteille premium",
        "reward_description": "Reçois une bouteille premium offerte par le groupe",
        "reward_type": "wildcard",
        "rarity": "epic",
    },
    {
        "tier": "gold",
        "reward_name": "Échange de points",
        "reward_description": "Échange tes points avec un autre participant",
        "reward_type": "wildcard",
        "rarity": "epic",
    },

    # -------------------------------------------------------------------------
    # ULTIMATE PACK REWARDS (500 pts) - 30% Epic, 70% Legendary
    # -------------------------------------------------------------------------
    # Epic (30%)
    {
        "tier": "ultimate",
        "reward_name": "Cadeau mystère premium",
        "reward_description": "Un cadeau de grande valeur t'attend !",
        "reward_type": "wildcard",
        "rarity": "epic",
    },
    {
        "tier": "ultimate",
        "reward_name": "Paul porte ton maillot 1h",
        "reward_description": "Paul doit porter ton maillot/accessoire pendant 1 heure",
        "reward_type": "power",
        "rarity": "epic",
    },

    # Legendary (70%)
    {
        "tier": "ultimate",
        "reward_name": "Wildcard annulation ultime",
        "reward_description": "Annule n'importe quel gage pour n'importe qui - pouvoir absolu !",
        "reward_type": "wildcard",
        "rarity": "legendary",
    },
    {
        "tier": "ultimate",
        "reward_name": "Carte cadeau 100€",
        "reward_description": "Une carte cadeau de 100€ à utiliser comme tu veux",
        "reward_type": "wildcard",
        "rarity": "legendary",
    },
    {
        "tier": "ultimate",
        "reward_name": "Trophée du champion",
        "reward_description": "Trophée collector + immunité permanente dimanche",
        "reward_type": "wildcard",
        "rarity": "legendary",
    },
]


# =============================================================================
# Seed Functions
# =============================================================================

def seed_pack_rewards():
    """
    Seed pack rewards into the database.

    Creates all predefined rewards for bronze, silver, gold, and ultimate packs.
    """
    db = SessionLocal()

    try:
        logger.info("Starting pack rewards seeding...")

        # Check if rewards already exist
        existing_count = db.query(PackReward).count()
        if existing_count > 0:
            logger.warning(f"Pack rewards already exist ({existing_count} rewards). Skipping seeding.")
            logger.warning("To re-seed, delete existing rewards first or drop the pack_rewards table.")
            return

        # Create all rewards
        rewards_created = 0

        for reward_data in PACK_REWARDS:
            reward = PackReward(**reward_data, is_active=True)
            db.add(reward)
            rewards_created += 1

        # Commit all rewards
        db.commit()

        logger.info(f"Successfully seeded {rewards_created} pack rewards!")

        # Log statistics
        bronze_count = db.query(PackReward).filter(PackReward.tier == "bronze").count()
        silver_count = db.query(PackReward).filter(PackReward.tier == "silver").count()
        gold_count = db.query(PackReward).filter(PackReward.tier == "gold").count()
        ultimate_count = db.query(PackReward).filter(PackReward.tier == "ultimate").count()

        logger.info("Pack rewards by tier:")
        logger.info(f"  - Bronze: {bronze_count} rewards")
        logger.info(f"  - Silver: {silver_count} rewards")
        logger.info(f"  - Gold: {gold_count} rewards")
        logger.info(f"  - Ultimate: {ultimate_count} rewards")

        # Log rarity distribution
        common_count = db.query(PackReward).filter(PackReward.rarity == "common").count()
        rare_count = db.query(PackReward).filter(PackReward.rarity == "rare").count()
        epic_count = db.query(PackReward).filter(PackReward.rarity == "epic").count()
        legendary_count = db.query(PackReward).filter(PackReward.rarity == "legendary").count()

        logger.info("Pack rewards by rarity:")
        logger.info(f"  - Common: {common_count} rewards")
        logger.info(f"  - Rare: {rare_count} rewards")
        logger.info(f"  - Epic: {epic_count} rewards")
        logger.info(f"  - Legendary: {legendary_count} rewards")

    except Exception as e:
        logger.error(f"Failed to seed pack rewards: {str(e)}")
        db.rollback()
        raise

    finally:
        db.close()


# =============================================================================
# Main Script
# =============================================================================

if __name__ == "__main__":
    logger.info("=" * 80)
    logger.info("EVG ULTIMATE TEAM - Pack Rewards Seeding Script")
    logger.info("=" * 80)

    try:
        seed_pack_rewards()
        logger.info("=" * 80)
        logger.info("Seeding completed successfully!")
        logger.info("=" * 80)

    except Exception as e:
        logger.error("=" * 80)
        logger.error(f"Seeding failed: {str(e)}")
        logger.error("=" * 80)
        sys.exit(1)
