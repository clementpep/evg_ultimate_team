"""
Configuration management for EVG Ultimate Team backend.

This module handles loading and validating configuration from environment variables.
Uses Pydantic Settings for type-safe configuration with validation.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All settings can be overridden by setting environment variables
    with the corresponding names (case-insensitive).
    """

    # ==========================================================================
    # Database Configuration
    # ==========================================================================
    database_url: str = Field(
        default="sqlite:///./evg_ultimate_team.db",
        description="Database connection URL"
    )

    # ==========================================================================
    # Security Configuration
    # ==========================================================================
    secret_key: str = Field(
        default="change-this-to-a-random-secret-key-in-production",
        description="Secret key for session management and token generation"
    )

    admin_username: str = Field(
        default="clement",
        description="Admin username for Clément"
    )

    admin_password: str = Field(
        default="evg2026_admin",
        description="Admin password"
    )

    # ==========================================================================
    # CORS Configuration
    # ==========================================================================
    cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        description="Comma-separated list of allowed CORS origins (use '*' for all)"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """
        Parse CORS origins string into a list.

        Returns:
            List of allowed origin URLs or ["*"] for all origins
        """
        origins = self.cors_origins.strip()
        # Allow all origins if "*" is specified
        if origins == "*":
            return ["*"]
        return [origin.strip() for origin in origins.split(",")]

    # ==========================================================================
    # Logging Configuration
    # ==========================================================================
    log_level: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)"
    )

    log_file: str = Field(
        default="",
        description="Path to log file (empty = console only)"
    )

    # ==========================================================================
    # Application Configuration
    # ==========================================================================
    environment: str = Field(
        default="development",
        description="Application environment (development, staging, production)"
    )

    api_host: str = Field(
        default="0.0.0.0",
        description="API host address"
    )

    api_port: int = Field(
        default=8000,
        description="API port number"
    )

    debug: bool = Field(
        default=True,
        description="Enable debug mode (auto-reload on code changes)"
    )

    # ==========================================================================
    # Application Metadata
    # ==========================================================================
    app_name: str = Field(
        default="EVG Ultimate Team API",
        description="Application name"
    )

    app_version: str = Field(
        default="1.0.0",
        description="Application version"
    )

    app_description: str = Field(
        default="Gamification API for Paul's bachelor party",
        description="Application description"
    )

    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.

    Uses LRU cache to ensure settings are loaded only once.
    This is the recommended way to access settings throughout the app.

    Returns:
        Settings instance with all configuration values

    Example:
        >>> from app.config import get_settings
        >>> settings = get_settings()
        >>> print(settings.database_url)
    """
    return Settings()


# Create a global settings instance for convenience
settings = get_settings()
