"""
Auto-seed module for EVG Ultimate Team.

Automatically seeds the database with initial data if empty.
"""

from sqlalchemy.orm import Session
from app.models import Participant, Challenge, ChallengeType, ChallengeStatus, PackReward
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
    """Seed the database with sample challenges (en français)."""
    challenges_data = [
        # Défis Individuels (20-50 pts) - Interactions avec inconnus
        {
            "title": "Convaincs un inconnu que tu es commercial chez Red Bull",
            "description": "Aborde un inconnu et convaincs-le que tu travailles pour Red Bull. Minimum 2 minutes de discussion.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 30,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Fais-toi offrir un shot par un inconnu",
            "description": "Convaincs un inconnu de t'offrir un shot au bar. Tout est permis sauf mentionner directement l'EVG.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 35,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Obtiens le numéro de 3 inconnus",
            "description": "Récupère le numéro de téléphone de 3 personnes différentes en moins de 30 minutes.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 40,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Fais croire à un inconnu que Paul est une célébrité",
            "description": "Convaincs un inconnu que Paul est une star du rugby toulousain. Photos obligatoires.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 45,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Pitch un produit absurde à un inconnu",
            "description": "Vends un produit ridicule à un inconnu pendant au moins 2 minutes (ex: chaussettes invisibles, cure-dent électrique...).",
            "type": ChallengeType.INDIVIDUAL,
            "points": 30,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Négocie une réduction au restaurant",
            "description": "Obtiens au moins 10% de réduction sur l'addition grâce à ton charme ou tes arguments.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 50,
            "status": ChallengeStatus.PENDING
        },

        # Défis Individuels - Entre membres du groupe
        {
            "title": "Gagne un match FIFA 1v1 contre Paul",
            "description": "Défie Paul à FIFA et gagne. Best of 3 manches.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 50,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Fais un discours de 2 minutes sur Paul",
            "description": "Improvise un discours émouvant de 2 minutes expliquant pourquoi Paul est le meilleur marié. Doit être touchant ET drôle.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 35,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Termine premier au karting",
            "description": "Remporte la course de karting contre tous les autres participants.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 50,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Imite l'accent de Paul au bar",
            "description": "Commande un shot au bar en imitant l'accent de Paul. Le serveur ne doit rien remarquer.",
            "type": ChallengeType.INDIVIDUAL,
            "points": 25,
            "status": ChallengeStatus.PENDING
        },

        # Défis d'Équipe (100 pts partagés)
        {
            "title": "Victoire au tournoi de padel",
            "description": "Ton équipe doit remporter le tournoi de padel du samedi après-midi.",
            "type": ChallengeType.TEAM,
            "points": 100,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Victoire au match de foot",
            "description": "Ton équipe doit gagner le match de football du samedi après-midi.",
            "type": ChallengeType.TEAM,
            "points": 100,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Bouteille de champagne en moins de 5 minutes",
            "description": "Ton équipe de 4 doit finir une bouteille entière de champagne en moins de 5 minutes.",
            "type": ChallengeType.TEAM,
            "points": 100,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Karaoké à 5 personnes",
            "description": "Réunis 5 personnes pour chanter un classique au karaoké. Tout le monde doit chanter.",
            "type": ChallengeType.TEAM,
            "points": 100,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Faites danser un groupe d'inconnus",
            "description": "Votre équipe doit convaincre un groupe d'au moins 5 inconnus de danser avec vous. Photos obligatoires.",
            "type": ChallengeType.TEAM,
            "points": 100,
            "status": ChallengeStatus.PENDING
        },

        # Défis Secrets (50-100 pts)
        {
            "title": "Fais rire Paul au dîner",
            "description": "SECRET: La prochaine personne qui fera sincèrement rire Paul pendant le dîner gagne. L'admin révélera ce défi au dîner.",
            "type": ChallengeType.SECRET,
            "points": 50,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Repère la référence cachée",
            "description": "SECRET: Le premier à remarquer et mentionner la référence cachée au Stade Toulousain gagne.",
            "type": ChallengeType.SECRET,
            "points": 75,
            "status": ChallengeStatus.PENDING
        },
        {
            "title": "Champion de minuit",
            "description": "SECRET: La dernière personne encore éveillée vendredi soir gagne des points bonus.",
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


# =============================================================================
# Pack rewards catalogue — single source of truth
# =============================================================================
# Rarities MUST match RARITY_WEIGHTS in pack_service.py, otherwise a reward is
# never drawn (bronze=common · silver=common/rare · gold=rare/epic ·
# ultimate=epic/legendary). Rewards are intentionally light & fun: quick dares
# and small in-game perks, nothing material or heavy — the EVG moves fast.

PACK_REWARDS = [
    # ----- Bronze — gages express (common) -----
    {"tier": "bronze", "name": "Cul-sec", "description": "Termine ton verre cul-sec, là, maintenant.", "type": "power", "rarity": "common"},
    {"tier": "bronze", "name": "Commande mimée", "description": "Commande ta prochaine boisson uniquement en mimant, sans parler.", "type": "power", "rarity": "common"},
    {"tier": "bronze", "name": "Accent marseillais", "description": "Parle avec l'accent marseillais pendant 10 minutes. « Putaing ! »", "type": "power", "rarity": "common"},
    {"tier": "bronze", "name": "DJ du moment", "description": "Choisis la musique du groupe pendant 15 minutes.", "type": "power", "rarity": "common"},
    {"tier": "bronze", "name": "Photo ridicule", "description": "Organise une photo de groupe dans la pose la plus ridicule possible.", "type": "power", "rarity": "common"},
    {"tier": "bronze", "name": "Trinque générale", "description": "Trinque avec tout le monde avant ta prochaine gorgée.", "type": "power", "rarity": "common"},

    # ----- Silver — gage + petit avantage (common/rare) -----
    {"tier": "silver", "name": "×2 prochain défi", "description": "Double tes points sur ton prochain défi validé.", "type": "power", "rarity": "common"},
    {"tier": "silver", "name": "Skip pénalité", "description": "Annule la prochaine pénalité qui te vise.", "type": "immunity", "rarity": "common"},
    {"tier": "silver", "name": "Mini-speech", "description": "Fais un discours de 30 secondes sur Paul, debout sur une chaise.", "type": "power", "rarity": "common"},
    {"tier": "silver", "name": "Tournée d'eau", "description": "Offre une tournée (eau, soft ou shot) à 3 personnes de ton choix.", "type": "shot", "rarity": "rare"},
    {"tier": "silver", "name": "Échange de place", "description": "Échange ta place (table, voiture…) avec qui tu veux pendant 30 minutes.", "type": "power", "rarity": "rare"},
    {"tier": "silver", "name": "Imitation", "description": "Imite un autre participant jusqu'à ce que le groupe devine qui c'est.", "type": "power", "rarity": "rare"},

    # ----- Gold — avantages sympas (rare/epic) -----
    {"tier": "gold", "name": "Immunité 1h", "description": "Aucune pénalité ne peut te toucher pendant 1 heure.", "type": "immunity", "rarity": "rare"},
    {"tier": "gold", "name": "Capitaine d'un soir", "description": "Tu choisis le prochain défi d'équipe.", "type": "power", "rarity": "rare"},
    {"tier": "gold", "name": "Service royal", "description": "Paul t'apporte ta prochaine boisson.", "type": "power", "rarity": "rare"},
    {"tier": "gold", "name": "+50 crédits", "description": "Bonus de 50 crédits pour ouvrir plus de packs.", "type": "power", "rarity": "epic"},
    {"tier": "gold", "name": "Maître du gage", "description": "Assigne un petit gage fun à la personne de ton choix.", "type": "power", "rarity": "epic"},
    {"tier": "gold", "name": "Photographe officiel", "description": "Tout le monde doit refaire la photo que tu demandes.", "type": "power", "rarity": "epic"},

    # ----- Ultimate — spécial mais léger (epic/legendary) -----
    {"tier": "ultimate", "name": "Thème de l'apéro", "description": "Tu choisis le thème du prochain apéro.", "type": "power", "rarity": "epic"},
    {"tier": "ultimate", "name": "Paul porte ton maillot", "description": "Paul porte ton maillot ou un accessoire à toi pendant 30 minutes.", "type": "power", "rarity": "epic"},
    {"tier": "ultimate", "name": "Immunité corvée", "description": "Aucune corvée pour toi dimanche matin.", "type": "immunity", "rarity": "legendary"},
    {"tier": "ultimate", "name": "Photo trophée", "description": "Photo « trophée » mise en scène avec Paul, façon vainqueur.", "type": "power", "rarity": "legendary"},
    {"tier": "ultimate", "name": "Joker", "description": "Annule un gage ou une pénalité, pour toi ou un pote.", "type": "wildcard", "rarity": "legendary"},
    {"tier": "ultimate", "name": "Capitaine de soirée", "description": "Tu décides de la prochaine activité du groupe.", "type": "power", "rarity": "legendary"},
]


def seed_rewards(db: Session) -> None:
    """Seed the database with the fun, lightweight pack rewards (en français)."""
    for data in PACK_REWARDS:
        reward = PackReward(
            tier=data["tier"],
            reward_name=data["name"],
            reward_description=data["description"],
            reward_type=data["type"],
            rarity=data["rarity"],
            is_active=True
        )
        db.add(reward)

    db.commit()
    logger.info(f"✓ Created {len(PACK_REWARDS)} pack rewards")


def auto_seed_if_empty(db: Session) -> None:
    """
    Automatically seed the database if it's empty.

    Called during application startup.
    """
    # Check if database is empty (no participants)
    participant_count = db.query(Participant).count()
    reward_count = db.query(PackReward).count()

    if participant_count == 0:
        logger.info("Database is empty - auto-seeding with initial data...")
        seed_participants(db)
        seed_challenges(db)
        seed_rewards(db)
        logger.info("✓ Database auto-seed completed successfully!")
    else:
        logger.info(f"Database already contains {participant_count} participants")

        # Seed rewards even if participants exist (in case of migration)
        if reward_count == 0:
            logger.info("No rewards found - seeding pack rewards...")
            seed_rewards(db)
        else:
            logger.info(f"Database already contains {reward_count} rewards - skipping reward seed")
