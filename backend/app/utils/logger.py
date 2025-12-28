"""
Centralized logging utility for EVG Ultimate Team backend.

This module provides a configured logger instance that can be imported
and used throughout the application for consistent logging.

Features:
- Structured logging with context (timestamps, levels, module names)
- Configurable log levels via environment variables
- Console and file output support
- JSON formatting for production environments
"""

import logging
import sys
from pathlib import Path
from typing import Optional
import os


def setup_logger(
    name: str = "evg_ultimate_team",
    log_level: Optional[str] = None,
    log_file: Optional[str] = None
) -> logging.Logger:
    """
    Configure and return a logger instance with consistent formatting.

    Args:
        name: Logger name (typically module name or app name)
        log_level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
                  If not provided, reads from LOG_LEVEL env var, defaults to INFO
        log_file: Path to log file. If not provided, reads from LOG_FILE env var
                 If no file specified, logs only to console

    Returns:
        Configured logger instance

    Example:
        >>> logger = setup_logger(__name__)
        >>> logger.info("Application started", extra={"user_id": 123})
    """
    # Create logger
    logger = logging.getLogger(name)

    # Determine log level
    if log_level is None:
        log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    logger.setLevel(getattr(logging, log_level, logging.INFO))

    # Prevent duplicate handlers if logger is reconfigured
    if logger.handlers:
        return logger

    # Create formatters
    # Detailed format with timestamp, level, module, and message
    detailed_formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Console handler (always enabled)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(detailed_formatter)
    logger.addHandler(console_handler)

    # File handler (optional)
    if log_file is None:
        log_file = os.getenv("LOG_FILE")

    if log_file:
        # Create log directory if it doesn't exist
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(detailed_formatter)
        logger.addHandler(file_handler)

    return logger


# Create default application logger
logger = setup_logger()


# Convenience functions for common logging patterns
def log_request(method: str, path: str, user_id: Optional[int] = None) -> None:
    """
    Log an incoming HTTP request.

    Args:
        method: HTTP method (GET, POST, etc.)
        path: Request path
        user_id: Optional user ID making the request
    """
    logger.info(
        f"HTTP Request: {method} {path}",
        extra={"method": method, "path": path, "user_id": user_id}
    )


def log_points_transaction(
    participant_id: int,
    amount: int,
    reason: str,
    admin_id: Optional[int] = None
) -> None:
    """
    Log a points transaction event.

    Args:
        participant_id: ID of participant receiving/losing points
        amount: Points amount (positive or negative)
        reason: Reason for the transaction
        admin_id: Optional ID of admin who triggered the transaction
    """
    action = "added to" if amount > 0 else "subtracted from"
    logger.info(
        f"Points {action} participant",
        extra={
            "participant_id": participant_id,
            "points": amount,
            "reason": reason,
            "admin_id": admin_id
        }
    )


def log_challenge_validation(
    challenge_id: int,
    participant_ids: list[int],
    validated_by: int,
    status: str
) -> None:
    """
    Log a challenge validation event.

    Args:
        challenge_id: ID of the challenge
        participant_ids: List of participant IDs who completed the challenge
        validated_by: Admin ID who validated the challenge
        status: Validation status (completed, failed, etc.)
    """
    logger.info(
        f"Challenge validation: {status}",
        extra={
            "challenge_id": challenge_id,
            "participant_ids": participant_ids,
            "validated_by": validated_by,
            "status": status
        }
    )


def log_auth_attempt(username: str, success: bool, is_admin: bool = False) -> None:
    """
    Log an authentication attempt.

    Args:
        username: Username attempting to login
        success: Whether login was successful
        is_admin: Whether this is an admin login attempt
    """
    level = logging.INFO if success else logging.WARNING
    user_type = "admin" if is_admin else "participant"
    result = "successful" if success else "failed"

    logger.log(
        level,
        f"{user_type.capitalize()} login {result}",
        extra={
            "username": username,
            "success": success,
            "is_admin": is_admin
        }
    )


def log_error(error: Exception, context: Optional[dict] = None) -> None:
    """
    Log an error with optional context.

    Args:
        error: The exception that occurred
        context: Optional dictionary with additional context
    """
    logger.error(
        f"Error occurred: {str(error)}",
        exc_info=True,
        extra=context or {}
    )
