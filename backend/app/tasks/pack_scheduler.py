"""
Pack scheduler for EVG Ultimate Team.

Handles scheduled distribution of free packs to all participants.
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.database import SessionLocal
from app.services import pack_service
from app.utils.logger import logger

# Create scheduler instance
scheduler = AsyncIOScheduler()


async def morning_pack_distribution():
    """
    Distribute free packs at 9:00 AM (morning).

    Distribution:
    - 2 bronze packs to all participants

    This function is called automatically by the scheduler.
    """
    logger.info("Starting morning pack distribution (9:00 AM)")

    db = SessionLocal()
    try:
        # Distribute 2 bronze packs to all participants
        pack_distribution = {"bronze": 2}

        count = pack_service.distribute_free_packs_to_all(db, pack_distribution)

        logger.info(f"Morning pack distribution completed: {count} participants received {pack_distribution}")

        # TODO: Broadcast WebSocket notification
        # await manager.broadcast({
        #     "type": "pack_distribution",
        #     "data": {
        #         "tier": "bronze",
        #         "count": 2,
        #         "message": "Free packs available! 2 Bronze packs added to your inventory."
        #     }
        # }, connection_type="leaderboard")

    except Exception as e:
        logger.error(f"Failed to distribute morning packs: {str(e)}")
        raise
    finally:
        db.close()


async def evening_pack_distribution():
    """
    Distribute free packs at 6:00 PM (apéro time).

    Distribution:
    - 1 bronze pack to all participants
    - 1 silver pack to all participants

    This function is called automatically by the scheduler.
    """
    logger.info("Starting evening pack distribution (6:00 PM - apéro)")

    db = SessionLocal()
    try:
        # Distribute 1 bronze + 1 silver pack to all participants
        pack_distribution = {"bronze": 1, "silver": 1}

        count = pack_service.distribute_free_packs_to_all(db, pack_distribution)

        logger.info(f"Evening pack distribution completed: {count} participants received {pack_distribution}")

        # TODO: Broadcast WebSocket notification
        # await manager.broadcast({
        #     "type": "pack_distribution",
        #     "data": {
        #         "tier": "mixed",
        #         "count": 2,
        #         "message": "Apéro time! 1 Bronze pack and 1 Silver pack added to your inventory."
        #     }
        # }, connection_type="leaderboard")

    except Exception as e:
        logger.error(f"Failed to distribute evening packs: {str(e)}")
        raise
    finally:
        db.close()


def start_scheduler():
    """
    Start the pack distribution scheduler.

    Schedules:
    - Morning distribution at 9:00 AM (UTC+1 for France)
    - Evening distribution at 6:00 PM (UTC+1 for France)

    Note: APScheduler uses the system timezone by default.
    For the bachelor party in France, ensure the server timezone is set to Europe/Paris
    or manually specify timezone in CronTrigger.

    Example:
        >>> start_scheduler()
        >>> # Scheduler is now running in the background
    """
    try:
        # Add morning distribution job (9:00 AM)
        scheduler.add_job(
            morning_pack_distribution,
            trigger=CronTrigger(hour=9, minute=0, timezone="Europe/Paris"),
            id="morning_pack_distribution",
            name="Morning Pack Distribution (9:00 AM)",
            replace_existing=True,
            misfire_grace_time=3600,  # Allow up to 1 hour delay if system was down
        )

        # Add evening distribution job (6:00 PM)
        scheduler.add_job(
            evening_pack_distribution,
            trigger=CronTrigger(hour=18, minute=0, timezone="Europe/Paris"),
            id="evening_pack_distribution",
            name="Evening Pack Distribution (6:00 PM)",
            replace_existing=True,
            misfire_grace_time=3600,
        )

        # Start the scheduler
        scheduler.start()

        logger.info("Pack scheduler started successfully")
        logger.info("Scheduled jobs:")
        logger.info("  - Morning distribution: 9:00 AM (Europe/Paris)")
        logger.info("  - Evening distribution: 6:00 PM (Europe/Paris)")

    except Exception as e:
        logger.error(f"Failed to start pack scheduler: {str(e)}")
        raise


def shutdown_scheduler():
    """
    Shutdown the pack distribution scheduler.

    This should be called during application shutdown to ensure
    scheduled jobs are properly cancelled.

    Example:
        >>> shutdown_scheduler()
        >>> # Scheduler is now stopped
    """
    try:
        if scheduler.running:
            scheduler.shutdown(wait=True)
            logger.info("Pack scheduler shut down successfully")
        else:
            logger.info("Pack scheduler was not running")
    except Exception as e:
        logger.error(f"Error shutting down pack scheduler: {str(e)}")
        raise
