"""
Database seeding script for EVG Ultimate Team.

Populates the database with the 13 participants and sample challenges
for Paul's bachelor party.

Run this script once to initialize the database with test data.

Usage:
    python seed_database.py
"""

from app.database import SessionLocal, init_db, reset_db
from app.models import Participant, Challenge, ChallengeType, ChallengeStatus
from app.utils.logger import logger


def seed_participants(db):
    """
    Seed the database with all 13 participants.

    Participants (from the user's specification):
    1. Paul C. - The groom
    2. Clément P. - Admin and wedding witness
    3. Paul J. - Wedding witness
    4. Hugo F. - Wedding witness
    5. Théo C. - Groom's brother and wedding witness
    6. Antonin M. - Groom's cousin and wedding witness
    7. Philippe C. - Groom's cousin and wedding witness
    8. Lancelot M. - Wedding witness
    9. Vianney D.
    10. Thomas S.
    11. Martin L.
    12. Guillaume V.
    13. Adrien M.
    """
    logger.info("Seeding participants...")

    participants_data = [
        {"name": "Paul C.", "is_groom": True, "avatar_url": None},
        {"name": "Clément P.", "is_groom": False, "avatar_url": None},  # Admin
        {"name": "Paul J.", "is_groom": False, "avatar_url": None},
        {"name": "Hugo F.", "is_groom": False, "avatar_url": None},
        {"name": "Théo C.", "is_groom": False, "avatar_url": None},
        {"name": "Antonin M.", "is_groom": False, "avatar_url": None},
        {"name": "Philippe C.", "is_groom": False, "avatar_url": None},
        {"name": "Lancelot M.", "is_groom": False, "avatar_url": None},
        {"name": "Vianney D.", "is_groom": False, "avatar_url": None},
        {"name": "Thomas S.", "is_groom": False, "avatar_url": None},
        {"name": "Martin L.", "is_groom": False, "avatar_url": None},
        {"name": "Guillaume V.", "is_groom": False, "avatar_url": None},
        {"name": "Adrien M.", "is_groom": False, "avatar_url": None},
    ]

    for data in participants_data:
        participant = Participant(
            name=data["name"],
            is_groom=data["is_groom"],
            avatar_url=data["avatar_url"],
            total_points=0,
            current_packs={"bronze": 0, "silver": 0, "gold": 0, "ultimate": 0}
        )
        db.add(participant)

    db.commit()
    logger.info(f"✓ Created {len(participants_data)} participants")


def seed_challenges(db):
    """
    Seed the database with sample challenges based on CLAUDE.md specifications.
    """
    logger.info("Seeding challenges...")

    challenges_data = [
        # Individual Challenges (20-50 pts)
        {
            "title": "Convince a stranger you're a Red Bull sales rep",
            "description": "Approach a stranger and successfully convince them you work for Red Bull. Must last at least 2 minutes.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 30,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Win a 1v1 FIFA match against Paul",
            "description": "Challenge Paul to a FIFA match and win. Best of 3 games.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 50,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Complete a rugby transformation",
            "description": "Score a try in the touch rugby game with proper technique.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 40,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Finish first in go-kart racing",
            "description": "Win the go-kart race against all other participants.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 50,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Give a 2-minute speech about why Paul is the best groom",
            "description": "Deliver an impromptu 2-minute speech praising Paul. Must be heartfelt and entertaining.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 35,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Order a shot mimicking Paul's accent",
            "description": "Successfully order a shot at the bar using Paul's accent. Bartender must not notice.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 25,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Pitch an absurd item to a stranger",
            "description": "Use Paul's commercial skills to pitch a ridiculous product to a stranger (e.g., invisible socks). Must last 2 minutes.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 30,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Negotiate a discount at the restaurant",
            "description": "Successfully negotiate at least a 10% discount on the bill using your charm.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 45,
            "status": ChallengeStatus.PENDING
        },

        # Team Challenges (100 pts shared)
        {
            "title": "Win the padel tournament",
            "description": "Your team must win the padel tournament on Saturday afternoon.",
            "type": ChallengeType.TEAM,
            "points": 100,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Win the football match",
            "description": "Your team must win the football match on Saturday afternoon.",
            "type": ChallengeType.TEAM,
            "points": 100,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Finish champagne bottle under 5 minutes",
            "description": "Your team of 4 must finish a full champagne bottle in under 5 minutes.",
            "type": ChallengeType.TEAM,
            "points": 100,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Complete a 5-person karaoke",
            "description": "Get 5 people to perform a full karaoke song together. Must be a classic.",
            "type": ChallengeType.TEAM,
            "points": 100,
            "status": ChallengeStatus.PENDING
        },

        # Secret Challenges (50-100 pts)
        {
            "title": "Make Paul laugh during dinner",
            "description": "SECRET: Next person to make Paul genuinely laugh during dinner wins. Admin will reveal this at dinner.",
            "type": ChallengeType.SECRET,
            "points": 50,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Spot the reference",
            "description": "SECRET: First person to notice and mention the hidden Toulouse Stade reference wins.",
            "type": ChallengeType.SECRET,
            "points": 75,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Midnight champion",
            "description": "SECRET: Last person awake on Friday night wins bonus points.",
            "type": ChallengeType.SECRET,
            "points": 100,
            "status": ChallengeStatus.PENDING
        },

        # Penalties (would be created by admin as needed)
        # These are just examples - admin creates them on the fly
    ]

    for data in challenges_data:
        challenge = Challenge(
            title=data["title"],
            description=data["description"],
            type=data["type"],
            points=data["points"],
            status=data["status"]
        )
        db.add(challenge)

    db.commit()
    logger.info(f"✓ Created {len(challenges_data)} challenges")


def main():
    """
    Main seeding function.

    WARNING: This will reset the entire database!
    """
    logger.info("=" * 80)
    logger.info("EVG ULTIMATE TEAM - Database Seeding")
    logger.info("=" * 80)
    logger.warning("This will RESET the database and create fresh data!")
    logger.info("")

    # Confirm before proceeding
    response = input("Continue? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        logger.info("Seeding cancelled")
        return

    # Reset database (drop all tables and recreate)
    logger.info("\nResetting database...")
    reset_db()

    # Create database session
    db = SessionLocal()

    try:
        # Seed data
        seed_participants(db)
        seed_challenges(db)

        logger.info("")
        logger.info("=" * 80)
        logger.info("✓ Database seeding completed successfully!")
        logger.info("=" * 80)
        logger.info("")
        logger.info("Summary:")
        logger.info("  - 13 participants created (Paul C. is the groom)")
        logger.info("  - 15 sample challenges created")
        logger.info("")
        logger.info("Admin credentials (from .env):")
        logger.info("  Username: clement")
        logger.info("  Password: evg2026_admin")
        logger.info("")
        logger.info("You can now start the backend server:")
        logger.info("  python -m app.main")
        logger.info("  OR")
        logger.info("  uvicorn app.main:app --reload")
        logger.info("=" * 80)

    except Exception as e:
        logger.error(f"Error during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
