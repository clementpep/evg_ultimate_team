"""
Add pack_credits column to participants table.

This migration adds a new column to track credits used for purchasing packs,
separate from the points used for leaderboard ranking.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import engine
from sqlalchemy import text


def add_pack_credits_column():
    """Add pack_credits column to participants table."""
    with engine.connect() as connection:
        # Check if column already exists
        result = connection.execute(text(
            "PRAGMA table_info(participants)"
        ))

        columns = [row[1] for row in result]

        if 'pack_credits' in columns:
            print("[OK] Column 'pack_credits' already exists")
            return

        # Add the column with default value equal to total_points
        # This gives existing participants credits based on their current points
        connection.execute(text(
            "ALTER TABLE participants ADD COLUMN pack_credits INTEGER DEFAULT 0 NOT NULL"
        ))

        # Set pack_credits to total_points for existing participants
        connection.execute(text(
            "UPDATE participants SET pack_credits = total_points"
        ))

        connection.commit()

        print("[OK] Added column 'pack_credits' to participants table")
        print("[OK] Initialized pack_credits = total_points for existing participants")


if __name__ == "__main__":
    print("Adding pack_credits column to participants table...")
    add_pack_credits_column()
    print("\nMigration completed successfully!")
