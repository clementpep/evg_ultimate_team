"""
Main FastAPI application for EVG Ultimate Team.

This is the entry point for the backend API.
"""

from fastapi import FastAPI, Request, status, Depends, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path
from app.config import get_settings
from app.database import init_db, get_db, SessionLocal
from app.seed import auto_seed_if_empty
from app.routes import (
    auth_router,
    participants_router,
    challenges_router,
    points_router,
    leaderboard_router,
    packs_router,
    admin_router
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

    # Auto-seed database if empty
    db = SessionLocal()
    try:
        auto_seed_if_empty(db)
    finally:
        db.close()

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
app.include_router(admin_router, prefix="/api")


# =============================================================================
# WebSocket Routes
# =============================================================================

@app.websocket("/ws/leaderboard")
async def websocket_leaderboard(websocket: WebSocket):
    """WebSocket endpoint for real-time leaderboard updates."""
    await leaderboard_websocket_endpoint(websocket)


# =============================================================================
# Static Files (Frontend) - For Single Container Deployment
# =============================================================================

# Path to frontend build directory
FRONTEND_DIST = Path(__file__).parent.parent.parent / "frontend" / "dist"

# Mount static files if dist directory exists (production mode)
if FRONTEND_DIST.exists():
    logger.info(f"Serving frontend static files from {FRONTEND_DIST}")

    # Serve static assets (JS, CSS, images, etc.)
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="static-assets")

    # Serve other static files (favicon, manifest, etc.)
    @app.get("/favicon.ico")
    async def favicon():
        """Serve favicon."""
        favicon_path = FRONTEND_DIST / "favicon.ico"
        if favicon_path.exists():
            return FileResponse(favicon_path)
        return {"success": False, "error": "Favicon not found"}

    @app.get("/vite.svg")
    async def vite_svg():
        """Serve vite SVG."""
        vite_path = FRONTEND_DIST / "vite.svg"
        if vite_path.exists():
            return FileResponse(vite_path)
        return {"success": False, "error": "Vite SVG not found"}
else:
    logger.warning(f"Frontend dist directory not found at {FRONTEND_DIST}")
    logger.warning("Frontend will not be served. Run 'npm run build' in frontend directory.")


# =============================================================================
# Root Endpoint & SPA Catch-All
# =============================================================================

@app.get("/api")
async def api_root():
    """
    API root endpoint - API health check.

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


@app.get("/debug/images")
async def debug_images():
    """
    Debug endpoint to list all PNG files and their sizes.

    Helps diagnose LFS pointer files vs real images.
    """
    import os

    images_info = []

    if FRONTEND_DIST.exists():
        # List all PNG files in dist directory
        for file in FRONTEND_DIST.glob("*.png"):
            size_bytes = file.stat().st_size
            # Read first 50 bytes to check if it's an LFS pointer
            with open(file, 'rb') as f:
                header = f.read(50)

            is_lfs_pointer = b'version https://git-lfs.github.com' in header

            images_info.append({
                "filename": file.name,
                "size_bytes": size_bytes,
                "size_kb": round(size_bytes / 1024, 2),
                "size_mb": round(size_bytes / (1024 * 1024), 2),
                "is_lfs_pointer": is_lfs_pointer,
                "path": str(file.relative_to(FRONTEND_DIST))
            })

    return {
        "success": True,
        "dist_path": str(FRONTEND_DIST),
        "dist_exists": FRONTEND_DIST.exists(),
        "total_images": len(images_info),
        "images": sorted(images_info, key=lambda x: x["filename"])
    }


# Catch-all route for SPA (must be last!)
# Serves index.html for all routes not matched above (for React Router)
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """
    Catch-all route to serve the React SPA.

    This must be the LAST route defined to avoid conflicting with API routes.
    Returns index.html for all non-API routes to support client-side routing.
    """
    # If frontend dist exists, serve index.html
    if FRONTEND_DIST.exists():
        index_path = FRONTEND_DIST / "index.html"
        if index_path.exists():
            return FileResponse(index_path)

    # Fallback if frontend not built
    return {
        "success": False,
        "error": "Frontend not found",
        "message": "Please build the frontend first: cd frontend && npm run build"
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
