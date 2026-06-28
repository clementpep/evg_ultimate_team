"""
Seed (or re-seed) pack rewards.

The reward catalogue lives in ``app.seed.PACK_REWARDS`` (single source of truth,
also used by the startup auto-seed). This script lets you (re)apply it manually.

Usage:
    python scripts/seed_pack_rewards.py            # seed only if table is empty
    python scripts/seed_pack_rewards.py --force    # purge existing rewards, then reseed
"""

import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.pack_reward import PackReward
from app.seed import PACK_REWARDS, seed_rewards
from app.utils.logger import logger


def reseed_pack_rewards(force: bool = False) -> None:
    """
    Seed pack rewards into the database.

    Args:
        force: If True, delete all existing rewards before seeding.
               If False, skip seeding when rewards already exist.
    """
    db = SessionLocal()
    try:
        existing_count = db.query(PackReward).count()
        if existing_count > 0:
            if not force:
                logger.warning(
                    f"Pack rewards already exist ({existing_count}). "
                    "Use --force to purge and reseed."
                )
                return
            db.query(PackReward).delete()
            db.commit()
            logger.info(f"Purged {existing_count} existing pack rewards.")

        seed_rewards(db)

        for tier in ("bronze", "silver", "gold", "ultimate"):
            count = db.query(PackReward).filter(PackReward.tier == tier).count()
            logger.info(f"  - {tier.capitalize()}: {count} rewards")
    except Exception as e:
        logger.error(f"Failed to seed pack rewards: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    force = "--force" in sys.argv
    logger.info(f"Seeding {len(PACK_REWARDS)} pack rewards (force={force})...")
    reseed_pack_rewards(force=force)
    logger.info("Done.")
