"""
Admin routes for EVG Ultimate Team API.

Handles admin-only operations like database reset, bulk operations, etc.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal, engine, Base
from app.seed import auto_seed_if_empty
from app.schemas.common import SuccessResponse
from app.utils.dependencies import require_admin
from app.utils.logger import logger

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/reset-database", response_model=SuccessResponse)
def reset_database(
    admin = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    **DANGER ZONE**: Completely resets the database.

    This endpoint will:
    1. Drop all existing tables
    2. Recreate all tables with fresh schema
    3. Re-seed with initial data (participants, challenges, rewards)

    **WARNING**: This action is IRREVERSIBLE. All data will be lost:
    - All participants' points
    - All challenge completions
    - All pack opening history
    - All points transactions

    **Authentication**: Requires admin token.

    **Returns**:
    - Success message with confirmation

    **Example Response**:
    ```json
    {
        "success": true,
        "message": "Database reset successfully. 13 participants, 18 challenges, and 26 rewards created."
    }
    ```
    """
    try:
        logger.warning(f"Database reset initiated by admin: {admin.get('username', 'unknown')}")

        # Close current session
        db.close()

        # Drop all tables
        logger.info("Dropping all database tables...")
        Base.metadata.drop_all(bind=engine)

        # Recreate all tables
        logger.info("Recreating database schema...")
        Base.metadata.create_all(bind=engine)

        # Create new session for seeding
        new_db = SessionLocal()
        try:
            # Re-seed with initial data
            logger.info("Seeding database with initial data...")
            auto_seed_if_empty(new_db)

            logger.info("✅ Database reset completed successfully!")

            return SuccessResponse(
                success=True,
                message="Database reset successfully. 13 participants, 18 challenges, and 26 rewards created."
            )
        finally:
            new_db.close()

    except Exception as e:
        logger.error(f"Database reset failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reset database: {str(e)}"
        )
