# Spec — Simplification packs, nettoyage perf & arbitre 5v5

> Date : 2026-06-28 · Branche : `feat/pack-simplification-and-referee`
> Décisions validées avec Clément (cf. session de brainstorming).

## Contexte

Passe globale sur l'appli EVG Ultimate Team avant l'event (Marseille, 3-5 juillet 2026).
Trois objectifs : (1) réduire la sur-complexité qui n'apporte rien à 13 joueurs,
(2) refondre les packs pour qu'ils restent simples/fun/rapides, (3) ajouter un arbitre
au terrain 5v5 déjà existant. La base peut être **reset intégralement** (rien à conserver).

## Décisions

| Sujet | Décision |
|---|---|
| Structure packs | Garder 4 tiers (Bronze/Silver/Gold/Ultimate) + crédits, **alléger les récompenses** |
| Contenu packs | **Mini-défis fun + petits avantages de jeu** — rien de matériel/aberrant |
| 5v5 | **2×5 + 1 arbitre + 2 remplaçants** (Paul joue et compose) |
| Code sur-complexe | **Retirer** le générateur dynamique ET la rareté dynamique |
| Cap banc | Reste à **3** (souplesse), l'UI suggère 2 |

---

## Chantier A — Simplification & perf

### A1. Retrait du générateur de défis dynamiques
- Supprimer `backend/app/services/experience_service.py`.
- Supprimer la route `POST /api/challenges/generate/contextual` dans `routes/challenges.py`.
- Retirer l'export `experience_service` de `services/__init__.py`.
- Supprimer les tests liés dans `tests/test_experience_and_pack_services.py` (garder la partie pack si présente).

### A2. Retrait de la rareté dynamique
- `open_pack` appelle `select_random_reward` (poids fixes) au lieu de `select_random_reward_for_participant`.
- Supprimer `compute_dynamic_rarity_weights` et `select_random_reward_for_participant` de `pack_service.py`.
- Adapter les tests packs en conséquence.

### A3. Allègement animation pack (cosmétique)
- `PackOpeningModal.tsx` : confettis 80-120 → ~24-30 ; retirer les boucles `Infinity` non essentielles.
- Aucun changement fonctionnel ; objectif fluidité mobile.

---

## Chantier B — Refonte des packs (4 tiers allégés)

Rareté alignée sur `RARITY_WEIGHTS` (sinon récompense jamais tirée) :
bronze=common · silver=common/rare · gold=rare/epic · ultimate=epic/legendary.

### Catalogue (24 récompenses, FR)

**Bronze — gages express (common)**
1. Cul-sec — Termine ton verre cul-sec, là, maintenant.
2. Commande mimée — Commande ta prochaine boisson uniquement en mimant.
3. Accent marseillais — Parle avec l'accent marseillais pendant 10 min. « Putaing ! »
4. DJ du moment — Choisis la musique pendant 15 minutes.
5. Photo ridicule — Organise une photo de groupe dans la pose la plus ridicule possible.
6. Trinque générale — Trinque avec tout le monde avant ta prochaine gorgée.

**Silver — gage + petit avantage**
- common : 7. ×2 prochain défi · 8. Skip pénalité · 9. Mini-speech de 30 s sur Paul (debout sur une chaise)
- rare : 10. Tournée d'eau/soft/shot à 3 personnes · 11. Échange de place (table, voiture…) 30 min · 12. Imitation d'un participant jusqu'à ce qu'on devine

**Gold — avantages sympas**
- rare : 13. Immunité 1h · 14. Capitaine d'un soir (choisis le prochain défi d'équipe) · 15. Service royal (Paul t'apporte ta boisson)
- epic : 16. +50 crédits · 17. Maître du gage (assigne un petit gage fun) · 18. Photographe officiel (refais la photo qu'il demande)

**Ultimate — spécial mais léger**
- epic : 19. Thème de l'apéro · 20. Paul porte ton maillot/accessoire 30 min
- legendary : 21. Immunité corvée dimanche matin · 22. Photo trophée mise en scène avec Paul · 23. Joker (annule un gage/pénalité, toi ou un pote) · 24. Capitaine de soirée (choisis la prochaine activité)

> `reward_type` réutilise les valeurs existantes (`power`/`immunity`/`shot`/`wildcard`) — pas de changement de schéma.

### Reset / re-seed
`auto_seed_if_empty` ne re-seed les récompenses que si la table est vide.
Fournir/maj `backend/scripts/seed_pack_rewards.py` pour **purger + re-seeder** les récompenses,
et documenter la procédure de reset DB sur le VPS (le nouveau catalogue ne prend qu'après purge).

---

## Chantier C — Arbitre dans le 5v5

### Backend
- `models/team_composition.py` : colonne `referee` (JSON liste, défaut `[]`, max 1).
- `schemas/team.py` : champ `referee` dans `TeamCompositionUpdate` + `TeamCompositionResponse` ; constante `MAX_REFEREE_SIZE = 1`.
- `services/team_service.py` : intégrer `referee` dans résolution, `unplaced`, validations (≤1, unicité globale incluant l'arbitre).

### Frontend
- `types/team.ts` : `referee` + `MAX_REFEREE_SIZE`.
- `components/team/FivePitch.tsx` : zone « 🨠 Arbitre » (1 slot) gérée par le tap-to-place existant ; nouvelle valeur `PitchZone = 'referee'`.
- `pages/EVGTeamPage.tsx` : câbler la zone arbitre dans l'état de composition et la sauvegarde ; guide « 2×5 + 1 arbitre + 2 remplaçants ».

---

## Découpage en commits
1. **Chantier A** — simplification/perf.
2. **Chantier B** — refonte packs + script de reseed.
3. **Chantier C** — arbitre 5v5.

## Vérification
- Backend : `pytest` vert (tests ajustés A/B/C).
- Front : `tsc --noEmit` + `npm run build` OK.
- Manuel (Clément) : reset DB → nouveau catalogue de packs ; Paul compose 2×5 + arbitre + banc.
