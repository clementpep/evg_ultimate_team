"""
EVG custom experience generation service.

Generates contextual and replayable challenges tailored to:
- 13 participants
- Marseille area
- EVG dates: 2026-07-03 to 2026-07-05
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import random
from typing import Iterable

from app.models.challenge import ChallengeStatus, ChallengeType
from app.schemas.challenge import ChallengeCreate


EVG_LOCATION = "Marseille"
EVG_PARTICIPANTS = 13
EVENT_START = datetime(2026, 7, 3, 9, 0, 0)
EVENT_END = datetime(2026, 7, 5, 12, 0, 0)


@dataclass(frozen=True)
class ChallengeTemplate:
    """Template used to generate dynamic challenges."""

    title_template: str
    description_template: str
    challenge_type: ChallengeType
    min_points: int
    max_points: int
    tags: tuple[str, ...]


def _day_part(now: datetime) -> str:
    hour = now.hour
    if 6 <= hour < 12:
        return "morning"
    if 12 <= hour < 18:
        return "afternoon"
    if 18 <= hour < 23:
        return "evening"
    return "night"


def _progression_ratio(now: datetime) -> float:
    if now <= EVENT_START:
        return 0.0
    if now >= EVENT_END:
        return 1.0
    total = (EVENT_END - EVENT_START).total_seconds()
    elapsed = (now - EVENT_START).total_seconds()
    return elapsed / total


def _difficulty_multiplier(progression: float) -> float:
    if progression < 0.33:
        return 1.0
    if progression < 0.66:
        return 1.2
    return 1.45


def _build_templates(day_part: str) -> list[ChallengeTemplate]:
    contextual = {
        "morning": ("coffee mission", "petit-déj chaos"),
        "afternoon": ("beach mode", "competition mode"),
        "evening": ("apéro mode", "sunset mission"),
        "night": ("last dance", "after dark"),
    }
    vibe_a, vibe_b = contextual.get(day_part, ("party mode", "EVG mode"))

    return [
        ChallengeTemplate(
            title_template="Duel express: {p1} vs {p2}",
            description_template="{p1} and {p2} challenge each other in a 1v1 mini-game "
            f"in {EVG_LOCATION} ({vibe_a}). Winner gets glory, loser posts a funny story.",
            challenge_type=ChallengeType.INDIVIDUAL,
            min_points=25,
            max_points=50,
            tags=("personalized", "duel"),
        ),
        ChallengeTemplate(
            title_template="Boss challenge: Protect the groom",
            description_template=f"Team mission in {EVG_LOCATION}: keep Paul from saying a forbidden word for 30 minutes ({vibe_b}). One slip = team penalty.",
            challenge_type=ChallengeType.TEAM,
            min_points=80,
            max_points=140,
            tags=("boss", "team", "inside_joke"),
        ),
        ChallengeTemplate(
            title_template="Secret chaos card for {p1}",
            description_template="{p1} must complete a stealth dare related to the current spot "
            f"in/around {EVG_LOCATION}. Reveal only after proof.",
            challenge_type=ChallengeType.SECRET,
            min_points=45,
            max_points=95,
            tags=("secret", "location"),
        ),
        ChallengeTemplate(
            title_template="Team sync x{team_size}",
            description_template="Form a {team_size}-person squad and complete a synchronized action "
            f"in public ({vibe_a}). Bonus points for creativity and crowd reaction.",
            challenge_type=ChallengeType.TEAM,
            min_points=60,
            max_points=120,
            tags=("group_dynamic", "replayable"),
        ),
    ]


def generate_dynamic_challenges(
    participant_names: Iterable[str],
    now: datetime,
    completed_challenges_count: int,
    *,
    count: int = 6,
    seed: int | None = None,
) -> list[ChallengeCreate]:
    """
    Generate context-aware EVG challenges with progression-based difficulty.
    """
    names = list(participant_names)
    if not names:
        raise ValueError("participant_names cannot be empty")

    rng = random.Random(seed)
    day_part = _day_part(now)
    progression = _progression_ratio(now)
    difficulty = _difficulty_multiplier(progression)
    templates = _build_templates(day_part)

    generated: list[ChallengeCreate] = []
    seen_titles: set[str] = set()
    for _ in range(max(count, 1) * 3):
        if len(generated) >= count:
            break

        t = rng.choice(templates)
        p1 = rng.choice(names)
        p2 = rng.choice([n for n in names if n != p1] or names)
        team_size = min(max(2, EVG_PARTICIPANTS // 3), len(names))

        title = t.title_template.format(p1=p1, p2=p2, team_size=team_size)
        if title in seen_titles:
            continue

        base_points = rng.randint(t.min_points, t.max_points)
        progressive_bonus = min(completed_challenges_count // 5, 8)
        points = int((base_points + progressive_bonus) * difficulty)

        description = t.description_template.format(
            p1=p1,
            p2=p2,
            team_size=team_size,
        )
        description += (
            f" [Context: {day_part}, progression={progression:.2f}, location={EVG_LOCATION}]"
        )

        generated.append(
            ChallengeCreate(
                title=title,
                description=description,
                type=t.challenge_type,
                points=max(points, 10),
                assigned_to=None,
            )
        )
        seen_titles.add(title)

    return generated


def to_challenge_model_kwargs(challenge: ChallengeCreate) -> dict:
    """Convert a generated challenge schema into model constructor kwargs."""
    return {
        "title": challenge.title,
        "description": challenge.description,
        "type": challenge.type,
        "points": challenge.points,
        "status": ChallengeStatus.PENDING,
    }
