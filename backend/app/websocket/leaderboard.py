"""
WebSocket handler for real-time leaderboard updates.

Provides WebSocket endpoint for live leaderboard updates.
"""

from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import Optional
from app.database import SessionLocal
from app.services import leaderboard_service
from app.websocket.manager import manager
from app.utils.logger import logger
from app.utils.security import verify_token


async def leaderboard_websocket_endpoint(
    websocket: WebSocket
):
    """
    WebSocket endpoint for real-time leaderboard updates.

    Clients connect to this endpoint to receive live leaderboard updates
    whenever points change.

    **Connection:** ws://localhost:8000/ws/leaderboard?token=<jwt_token>

    **Query Parameters:**
    - `token`: JWT authentication token (required)

    **Message Format (from server):**
    ```json
    {
        "type": "leaderboard_update",
        "data": [
            {
                "id": 1,
                "name": "Paul C.",
                "total_points": 350,
                "rank": 1,
                ...
            },
            ...
        ],
        "timestamp": "2026-06-05T16:30:00Z"
    }
    ```
    """
    # Accept the WebSocket connection first
    await websocket.accept()

    # Extract token from query parameters
    query_params = dict(websocket.query_params)
    token = query_params.get("token")

    # Verify authentication token
    if not token:
        await websocket.close(code=1008, reason="Missing authentication token")
        logger.warning("WebSocket connection rejected: missing token")
        return

    try:
        payload = verify_token(token)
        logger.info(f"WebSocket authenticated: user_id={payload.get('user_id')}, is_admin={payload.get('is_admin')}")
    except Exception as e:
        await websocket.close(code=1008, reason="Invalid authentication token")
        logger.warning(f"WebSocket connection rejected: invalid token - {str(e)}")
        return

    # Register the connection with the manager
    manager.active_connections.setdefault("leaderboard", []).append(websocket)

    try:
        # Send initial leaderboard data
        # Create a new DB session for this operation only
        db = SessionLocal()
        try:
            leaderboard = leaderboard_service.get_leaderboard(db, include_today_points=True)
            await manager.send_personal_message(
                {
                    "type": "leaderboard_initial",
                    "data": [entry.model_dump() for entry in leaderboard],
                    "message": "Connected to leaderboard updates"
                },
                websocket
            )
        finally:
            db.close()

        # Keep connection alive and handle incoming messages
        while True:
            # Wait for messages from client (ping/pong for connection keep-alive)
            data = await websocket.receive_text()

            # Handle different message types
            if data == "ping":
                await websocket.send_text("pong")
            elif data == "refresh":
                # Client requested a leaderboard refresh
                # Create a new DB session for this operation only
                db = SessionLocal()
                try:
                    leaderboard = leaderboard_service.get_leaderboard(db, include_today_points=True)
                    await manager.send_personal_message(
                        {
                            "type": "leaderboard_update",
                            "data": [entry.model_dump() for entry in leaderboard]
                        },
                        websocket
                    )
                finally:
                    db.close()

    except WebSocketDisconnect:
        manager.disconnect(websocket, "leaderboard")
        logger.info("Leaderboard WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket, "leaderboard")


async def broadcast_leaderboard_update(db: Session):
    """
    Broadcast updated leaderboard to all connected clients.

    This function should be called whenever points change
    (after challenge validation, manual points adjustment, etc.)

    Args:
        db: Database session

    Example:
        >>> # After awarding points
        >>> await broadcast_leaderboard_update(db)
    """
    from datetime import datetime

    try:
        leaderboard = leaderboard_service.get_leaderboard(db, include_today_points=True)

        await manager.broadcast(
            {
                "type": "leaderboard_update",
                "data": [entry.model_dump() for entry in leaderboard],
                "timestamp": datetime.utcnow().isoformat()
            },
            connection_type="leaderboard"
        )

        logger.info("Broadcasted leaderboard update to all clients")

    except Exception as e:
        logger.error(f"Failed to broadcast leaderboard update: {str(e)}")
