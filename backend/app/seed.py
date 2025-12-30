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


def seed_rewards(db: Session) -> None:
    """Seed the database with pack rewards (en français)."""
    rewards_data = [
        # Bronze Pack Rewards (common/rare)
        {"tier": "bronze", "name": "Shot offert", "description": "Un shot gratuit au prochain bar", "type": "shot", "rarity": "common"},
        {"tier": "bronze", "name": "Skip une pénalité", "description": "Annule une pénalité à venir", "type": "immunity", "rarity": "common"},
        {"tier": "bronze", "name": "Choix musical 1h", "description": "Choisis la musique pendant 1 heure", "type": "power", "rarity": "common"},
        {"tier": "bronze", "name": "Joker conversation", "description": "Force quelqu'un à parler uniquement en rimes pendant 10 minutes", "type": "power", "rarity": "rare"},
        {"tier": "bronze", "name": "Échange de boisson", "description": "Force un échange de verre avec la personne de ton choix", "type": "power", "rarity": "rare"},

        # Silver Pack Rewards (common/rare/epic)
        {"tier": "silver", "name": "Assigne un défi à quelqu'un", "description": "Crée et assigne un défi personnalisé à un participant", "type": "power", "rarity": "common"},
        {"tier": "silver", "name": "Points x2 sur le prochain défi", "description": "Double tes points sur ton prochain défi complété", "type": "power", "rarity": "common"},
        {"tier": "silver", "name": "Paul te sert pendant 2h", "description": "Paul devient ton serveur personnel pendant 2 heures", "type": "power", "rarity": "rare"},
        {"tier": "silver", "name": "Vol de 50 points", "description": "Vole 50 points au participant de ton choix", "type": "power", "rarity": "rare"},
        {"tier": "silver", "name": "Immunité samedi soir", "description": "Aucune pénalité ne peut te toucher samedi soir", "type": "immunity", "rarity": "rare"},
        {"tier": "silver", "name": "Téléphone de Paul pendant 1h", "description": "Tu contrôles le téléphone de Paul pendant 1 heure", "type": "power", "rarity": "epic"},
        {"tier": "silver", "name": "Swap de défi", "description": "Échange ton défi en cours avec celui d'un autre participant", "type": "power", "rarity": "epic"},

        # Gold Pack Rewards (rare/epic/legendary)
        {"tier": "gold", "name": "Immunité dimanche matin", "description": "Total immunity dimanche matin (pas de corvées, pas de pénalités)", "type": "immunity", "rarity": "rare"},
        {"tier": "gold", "name": "Choisis l'activité bonus", "description": "Décide de l'activité bonus du groupe", "type": "power", "rarity": "rare"},
        {"tier": "gold", "name": "Paul fait ton lit demain", "description": "Paul doit faire ton lit le lendemain matin", "type": "power", "rarity": "rare"},
        {"tier": "gold", "name": "Vol de 100 points", "description": "Vole 100 points au participant de ton choix", "type": "power", "rarity": "epic"},
        {"tier": "gold", "name": "Défi MVP", "description": "Si tu complètes ton prochain défi, tu gagnes 3x les points", "type": "power", "rarity": "epic"},
        {"tier": "gold", "name": "Bouteille premium", "description": "Une bouteille haut de gamme au choix au prochain bar", "type": "shot", "rarity": "legendary"},
        {"tier": "gold", "name": "Wildcard suprême", "description": "Annule n'importe quel défi ou pénalité pour n'importe qui, y compris toi", "type": "wildcard", "rarity": "legendary"},

        # Ultimate Pack Rewards (epic/legendary)
        {"tier": "ultimate", "name": "Carte cadeau 100€", "description": "Carte cadeau de 100€ pour un magasin au choix", "type": "shot", "rarity": "legendary"},
        {"tier": "ultimate", "name": "Paul porte ton accessoire 1h", "description": "Paul doit porter un accessoire de ton choix pendant 1 heure (chapeau, écharpe, etc.)", "type": "power", "rarity": "epic"},
        {"tier": "ultimate", "name": "Objet de collection", "description": "Un objet de collection rare (maillot dédicacé, figurine, etc.)", "type": "shot", "rarity": "legendary"},
        {"tier": "ultimate", "name": "Vol de 200 points", "description": "Vole 200 points au participant de ton choix", "type": "power", "rarity": "legendary"},
        {"tier": "ultimate", "name": "Wildcard absolu", "description": "Annule n'importe quel défi, pénalité ou événement pour tous les participants", "type": "wildcard", "rarity": "legendary"},
        {"tier": "ultimate", "name": "Protection totale", "description": "Immunité complète pour tout le weekend - rien ne peut te toucher", "type": "immunity", "rarity": "legendary"},
    ]

    for data in rewards_data:
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
    logger.info(f"✓ Created {len(rewards_data)} pack rewards")


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
        seed_rewards(db)
        logger.info("✓ Database auto-seed completed successfully!")
    else:
        logger.info(f"Database already contains {participant_count} participants - skipping seed")
