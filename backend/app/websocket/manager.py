"""
WebSocket connection manager for EVG Ultimate Team.

Manages WebSocket connections for real-time features.
"""

from fastapi import WebSocket
from typing import List, Dict
from app.utils.logger import logger


class ConnectionManager:
    """
    Manages WebSocket connections for real-time communication.

    Supports multiple connection types (leaderboard, notifications, etc.)
    and allows broadcasting messages to all connected clients or specific groups.
    """

    def __init__(self):
        """Initialize the connection manager with empty connection lists."""
        # Store active connections by type
        self.active_connections: Dict[str, List[WebSocket]] = {
            "leaderboard": [],
            "notifications": []
        }

    async def connect(self, websocket: WebSocket, connection_type: str = "leaderboard"):
        """
        Accept a new WebSocket connection and add it to the active connections.

        Args:
            websocket: WebSocket connection to accept
            connection_type: Type of connection (leaderboard, notifications, etc.)
        """
        await websocket.accept()

        if connection_type not in self.active_connections:
            self.active_connections[connection_type] = []

        self.active_connections[connection_type].append(websocket)

        logger.info(
            f"WebSocket connected",
            extra={
                "connection_type": connection_type,
                "active_count": len(self.active_connections[connection_type])
            }
        )

    def disconnect(self, websocket: WebSocket, connection_type: str = "leaderboard"):
        """
        Remove a WebSocket connection from active connections.

        Args:
            websocket: WebSocket connection to remove
            connection_type: Type of connection
        """
        if connection_type in self.active_connections:
            if websocket in self.active_connections[connection_type]:
                self.active_connections[connection_type].remove(websocket)

                logger.info(
                    f"WebSocket disconnected",
                    extra={
                        "connection_type": connection_type,
                        "active_count": len(self.active_connections[connection_type])
                    }
                )

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """
        Send a message to a specific WebSocket connection.

        Args:
            message: Message data to send (will be JSON encoded)
            websocket: Target WebSocket connection
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Failed to send personal message: {str(e)}")

    async def broadcast(self, message: dict, connection_type: str = "leaderboard"):
        """
        Broadcast a message to all connections of a specific type.

        Args:
            message: Message data to send (will be JSON encoded)
            connection_type: Type of connections to broadcast to

        Example:
            >>> manager = ConnectionManager()
            >>> await manager.broadcast(
            >>>     {"type": "leaderboard_update", "data": leaderboard},
            >>>     connection_type="leaderboard"
            >>> )
        """
        if connection_type not in self.active_connections:
            return

        # Get list of connections to avoid modification during iteration
        connections = list(self.active_connections[connection_type])

        # Send to all active connections
        disconnected = []
        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Failed to broadcast to connection: {str(e)}")
                disconnected.append(connection)

        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection, connection_type)

    def get_connection_count(self, connection_type: str = None) -> int:
        """
        Get the number of active connections.

        Args:
            connection_type: Specific connection type, or None for total

        Returns:
            Number of active connections
        """
        if connection_type:
            return len(self.active_connections.get(connection_type, []))
        else:
            return sum(len(conns) for conns in self.active_connections.values())


# Global connection manager instance
manager = ConnectionManager()
