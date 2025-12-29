"""
API routes for EVG Ultimate Team.

This module exports all route routers.
"""

from app.routes.auth import router as auth_router
from app.routes.participants import router as participants_router
from app.routes.challenges import router as challenges_router
from app.routes.points import router as points_router
from app.routes.leaderboard import router as leaderboard_router
from app.routes.packs import router as packs_router

__all__ = [
    "auth_router",
    "participants_router",
    "challenges_router",
    "points_router",
    "leaderboard_router",
    "packs_router",
]
