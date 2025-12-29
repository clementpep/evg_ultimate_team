"""
Main FastAPI application for EVG Ultimate Team.

This is the entry point for the backend API.
"""

from fastapi import FastAPI, Request, status, Depends, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.config import get_settings
from app.database import init_db, get_db
from app.routes import (
    auth_router,
    participants_router,
    challenges_router,
    points_router,
    leaderboard_router,
    packs_router
)
from app.websocket.leaderboard import leaderboard_websocket_endpoint
from app.tasks import start_scheduler, shutdown_scheduler
from app.utils.logger import logger
from app.utils.exceptions import EVGException, format_exception_response

# Get settings
settings = get_settings()


# =============================================================================
# Lifespan Events
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.

    Startup:
    - Initialize database (create tables if they don't exist)
    - Log application startup

    Shutdown:
    - Log application shutdown
    """
    # Startup
    logger.info("=" * 80)
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug mode: {settings.debug}")
    logger.info("=" * 80)

    # Initialize database
    init_db()
    logger.info("Database initialized")

    # Start pack scheduler
    start_scheduler()
    logger.info("Pack scheduler started")

    yield

    # Shutdown
    logger.info("Shutting down application")

    # Stop pack scheduler
    shutdown_scheduler()
    logger.info("Pack scheduler stopped")


# =============================================================================
# FastAPI Application
# =============================================================================

app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,  # Disable docs in production
    redoc_url="/redoc" if settings.debug else None,
)


# =============================================================================
# CORS Middleware
# =============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Exception Handlers
# =============================================================================

@app.exception_handler(EVGException)
async def evg_exception_handler(request: Request, exc: EVGException):
    """
    Global exception handler for custom EVG exceptions.

    Converts EVGException instances to properly formatted JSON responses.
    """
    logger.error(
        f"EVGException: {exc.message}",
        extra={"status_code": exc.status_code, "detail": exc.detail}
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=format_exception_response(exc)
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unexpected exceptions.

    Prevents server errors from exposing internal details.
    """
    logger.error(
        f"Unexpected exception: {str(exc)}",
        exc_info=True
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred"
        }
    )


# =============================================================================
# API Routes
# =============================================================================

# Include all API routers
app.include_router(auth_router, prefix="/api")
app.include_router(participants_router, prefix="/api")
app.include_router(challenges_router, prefix="/api")
app.include_router(points_router, prefix="/api")
app.include_router(leaderboard_router, prefix="/api")
app.include_router(packs_router, prefix="/api")


# =============================================================================
# WebSocket Routes
# =============================================================================

@app.websocket("/ws/leaderboard")
async def websocket_leaderboard(websocket: WebSocket):
    """WebSocket endpoint for real-time leaderboard updates."""
    await leaderboard_websocket_endpoint(websocket)


# =============================================================================
# Root Endpoint
# =============================================================================

@app.get("/")
async def root():
    """
    Root endpoint - API health check.

    Returns basic API information and status.
    """
    return {
        "success": True,
        "message": f"Welcome to {settings.app_name} API",
        "version": settings.app_version,
        "status": "online",
        "docs": "/docs" if settings.debug else "Documentation disabled in production"
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint.

    Used by monitoring systems to verify the API is running.
    """
    return {
        "success": True,
        "status": "healthy",
        "environment": settings.environment
    }


# =============================================================================
# Run Application (for development)
# =============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
