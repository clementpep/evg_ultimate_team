"""
Database connection and session management for EVG Ultimate Team.

This module sets up SQLAlchemy database engine, session factory,
and base model class for all database models.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.config import get_settings
from app.utils.logger import logger

# Get settings
settings = get_settings()

# =============================================================================
# Database Engine Setup
# =============================================================================

# Create SQLAlchemy engine
# For SQLite: connect_args with check_same_thread=False allows multiple threads
# For production PostgreSQL, remove connect_args
if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        echo=False  # Disable SQL query logging (too verbose)
    )

    # Enable foreign key constraints for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        """
        Enable foreign key constraints for SQLite.

        SQLite doesn't enforce foreign keys by default, so we need to
        enable them explicitly for each connection.
        """
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    engine = create_engine(
        settings.database_url,
        echo=False,  # Disable SQL query logging (too verbose)
        pool_pre_ping=True  # Verify connections before using them
    )

# =============================================================================
# Session Factory
# =============================================================================

# Create session factory
# autocommit=False: Transactions must be explicitly committed
# autoflush=False: Manual control over when data is flushed to DB
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# =============================================================================
# Base Model Class
# =============================================================================

# Create base class for all models
# All model classes will inherit from this
Base = declarative_base()

# =============================================================================
# Database Dependency
# =============================================================================

def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency for FastAPI routes.

    Yields a database session and ensures it's properly closed after use.
    This function is used as a dependency in FastAPI route handlers.

    Yields:
        SQLAlchemy database session

    Example:
        >>> from fastapi import Depends
        >>> @app.get("/participants")
        >>> def get_participants(db: Session = Depends(get_db)):
        >>>     return db.query(Participant).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =============================================================================
# Database Initialization
# =============================================================================

def init_db() -> None:
    """
    Initialize the database by creating all tables.

    This function should be called once when the application starts.
    It creates all tables defined in the models if they don't exist.

    Note:
        In production, use Alembic migrations instead of this function.
        This is primarily for development and testing.
    """
    logger.info("Initializing database...")
    try:
        # Import all models to ensure they're registered with Base
        from app.models import participant, challenge, points_transaction

        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

def drop_all_tables() -> None:
    """
    Drop all tables from the database.

    WARNING: This will delete all data! Only use in development/testing.
    """
    logger.warning("Dropping all database tables...")
    try:
        Base.metadata.drop_all(bind=engine)
        logger.warning("All tables dropped successfully")
    except Exception as e:
        logger.error(f"Failed to drop tables: {str(e)}")
        raise

def reset_db() -> None:
    """
    Reset the database by dropping and recreating all tables.

    WARNING: This will delete all data! Only use in development/testing.
    """
    logger.warning("Resetting database...")
    drop_all_tables()
    init_db()
    logger.info("Database reset completed")
