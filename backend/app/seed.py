"""
Auto-seed module for EVG Ultimate Team.

Automatically seeds the database with initial data if empty.
"""

from sqlalchemy.orm import Session
from app.models import Participant, Challenge, ChallengeType, ChallengeStatus
from app.utils.logger import logger


def seed_participants(db: Session) -> None:
    """Seed the database with all 13 participants."""
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


def seed_challenges(db: Session) -> None:
    """Seed the database with sample challenges."""
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


def auto_seed_if_empty(db: Session) -> None:
    """
    Automatically seed the database if it's empty.

    Called during application startup.
    """
    # Check if database is empty (no participants)
    participant_count = db.query(Participant).count()

    if participant_count == 0:
        logger.info("Database is empty - auto-seeding with initial data...")
        seed_participants(db)
        seed_challenges(db)
        logger.info("✓ Database auto-seed completed successfully!")
    else:
        logger.info(f"Database already contains {participant_count} participants - skipping seed")
