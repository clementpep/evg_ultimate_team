"""
Add has_received_welcome_pack column to participants table.

This script adds the new column for tracking welcome pack distribution.
"""

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.database import engine


def add_welcome_pack_column():
    """Add has_received_welcome_pack column to participants table."""

    with engine.connect() as connection:
        # Check if column already exists
        result = connection.execute(text(
            "PRAGMA table_info(participants)"
        ))

        columns = [row[1] for row in result]

        if 'has_received_welcome_pack' in columns:
            print("[OK] Column 'has_received_welcome_pack' already exists")
            return

        # Add the column
        connection.execute(text(
            "ALTER TABLE participants ADD COLUMN has_received_welcome_pack BOOLEAN DEFAULT 0 NOT NULL"
        ))
        connection.commit()

        print("[OK] Added column 'has_received_welcome_pack' to participants table")


if __name__ == "__main__":
    print("Adding has_received_welcome_pack column to participants table...")
    add_welcome_pack_column()
    print("\nMigration completed successfully!")
