# EVG Ultimate Team — Roadmap d'optimisation & d'évolution

> Établi après réparation du clone (LFS/sh) + audit qualité/perf du 2026-06-06.
> Légende confiance : ✅ confirmé · 🟡 à vérifier avant fix · ⬜ non commencé
> Effort : S (≤1h) · M (½j) · L (≥1j)

## Phase 0 — Réparation du clone ✅ FAIT
- [x] Index git repeuplé depuis HEAD, 85 fichiers manquants restaurés
- [x] LFS neutralisé en config locale (fin des crashs sh) + images matérialisées
- [x] 32 fichiers image marqués `skip-worktree` → `git status` propre

## Phase 1 — Sécurité & correctness (à attaquer en premier)
- [x] 🔴 **Secrets en dur** — `config.py` : défauts conservés en dev, **échec au démarrage en production** si `SECRET_KEY`/`ADMIN_PASSWORD` non surchargés (validateur `_enforce_secure_production_secrets`). Couvert par `tests/test_config_security.py` (4 tests ✅).
- [x] 🟠 **WebSocket auth** — `leaderboard.py` : token vérifié **avant** `accept()` (rejet du handshake si invalide). py_compile OK, régression OK.
- [x] ~~🟠 Crédits packs non débités~~ — **FAUX POSITIF** : économie en 2 temps. `purchase_pack` débite les crédits (l.443) ; `open_pack` consomme un pack de l'inventaire → `points_spent=0` volontaire. Aucun bug.
- [x] **Dates/lieu d'event** — CONFIRMÉ par Clément : **Marseille / 3-5 juillet 2026** (le code faisait foi ; July 3-5 = vendredi-dimanche, cohérent avec le récit). README/CLAUDE.md/backend+frontend README alignés (juin→juillet) ; lieu Marseille ajouté dans CLAUDE.md. Thème « Paris Saint-Germain » conservé (c'est un thème, pas un lieu).
- [ ] 🟡 **Rate-limiting auth** (slowapi, 5/15min). Effort M.

### Compat environnement
- [x] **Bump des deps** — `requirements.txt` mis à jour vers des versions compatibles **Python 3.14** (fastapi 0.136.3, pydantic 2.13.4, sqlalchemy 2.0.50, …). `.venv` créé sous `backend/.venv`. Vérifié : `pip install -r` OK, `import app.main` OK, 7/7 tests OK.

## Phase 2 — Performance
- [ ] 🟠 **N+1 leaderboard** — profiler puis requête unique + cache court. Effort M. 🟡
- [ ] 🟡 Sélection récompense en SQL plutôt que `random.choice` Python. Effort S.

## Phase 3 — Finir les features manquantes
- [ ] 🔴 **Event Cards** (Boost/Chaos/Paul's Choice) — modèle + schéma + service + routes + broadcast WS + composant front + déclencheur admin. Effort L. ⬜
- [ ] 🟠 **Notifications** — endpoints/stream backend + câblage du `ToastContext` front. Effort M. ⬜
- [ ] 🟡 **Animations pack opening** FIFA-style (révélation carte). Effort M. partiel
- [ ] 🟡 **Scheduler packs** — câbler les broadcasts WS en TODO. Effort S. 🟡

## Phase 4 — Qualité & évolution UX
- [ ] Tests : cible 20+ (auth, challenge flow, points, packs, leaderboard) + tests front. Effort L.
- [ ] Lint/format/CI (ruff/black + eslint + GitHub Actions). Effort M.
- [ ] Nouvelles features / UX (à définir ensemble). Effort variable.

## Review

### Session 2026-06-06
- **Réparation clone** : index git vide + `frontend/src/` manquant → restauré depuis HEAD ; LFS neutralisé en config locale (crashs `sh` du sandbox) ; images matérialisées via `git-lfs.exe` ; 32 images en `skip-worktree`.
- **Phase 1 sécu/correctness** :
  - Secrets : fail-fast prod si défauts (`config.py`) + 4 tests.
  - WebSocket : auth avant `accept()` (`leaderboard.py`).
  - 2 faux positifs de l'audit écartés après vérif (crédits packs, sens des dates).
- **Dates** : alignées sur Marseille / 3-5 juillet 2026 (4 fichiers .md).
- **Deps** : bump Python 3.14, `requirements.txt` figé et vérifié.
- **Tests** : 7/7 verts. `.venv` opérationnel sous `backend/.venv`.
- **Reste Phase 1** : rate-limiting auth (optionnel). Ensuite Phase 2 (perf N+1) ou Phase 3 (Event Cards).

---

# PLAN — Découverte d'équipe (Paul) + Terrain 5v5 (à valider avant code)

> Décidé avec Clément (2026-06-07) :
> 1. Découverte = **1 pack "Équipe"** révélant les **12 autres cartes** une par une, **Paul uniquement**.
> 2. Terrain **5v5** = **2×5 titulaires + banc de 3** ; compo **sauvée en base et visible par tous**.
> 3. Quelques optimisations ciblées en commits séparés.
> Branche dédiée : `feat/squad-discovery-and-five`.

## Hypothèses (corrige-moi si besoin)
- La compo est éditable par **Paul (groom) OU l'admin (Clément)** ; lecture seule pour les autres.
- Placement par **tap-to-place** (sélectionner un joueur → taper un emplacement), pas de drag&drop → robuste mobile, **zéro nouvelle dépendance**.
- Tant qu'aucune compo n'est créée, la page Team garde l'**affichage escouade actuel** en fallback.
- Positions sur le terrain = **décoratives** (GK + 1-2-1), pas de rôle imposé. Noms d'équipe par défaut « Les Bleus » / « Les Rouges », éditables.
- Découverte = expérience **front uniquement**, gated localStorage (comme le reveal actuel), **rejouable** depuis le profil. Aucune carte/donnée nouvelle côté serveur.

## Lot A — Backend : compo d'équipe persistée ✅
- [x] `models/team_composition.py` : table mono-ligne (id=1) `team_a_name, team_b_name, team_a[json], team_b[json], bench[json], updated_at, updated_by`. Enregistrée dans `models/__init__.py` (create_all crée la table — vérifié : présente dans `Base.metadata.tables`).
- [x] `schemas/team.py` : `TeamCompositionUpdate` + `TeamCompositionResponse` (équipes résolues + `unplaced` + `updated_at`).
- [x] `services/team_service.py` : `get_composition` / `update_composition` avec validations (ids valides, unicité A/B/banc, ≤5/≤5/≤3 ; compos partielles OK).
- [x] `utils/dependencies.py` : `require_groom_or_admin`.
- [x] `routes/team.py` : `GET` (auth) + `PUT` (guard) ; router monté dans `main.py` + exports `routes/__init__.py` & `services/__init__.py`.

## Lot B — Frontend : page Terrain (vue + édition) ✅
- [x] `types/team.ts` + `services/teamService.ts` (`getTeamComposition`, `updateTeamComposition`).
- [x] `components/team/PlayerChip.tsx` (carte FUT compacte réutilisable, état sélectionné).
- [x] `components/team/FivePitch.tsx` : terrain (A haut / B bas, 5 slots), banc (3), zone non-répartis ; tap-to-place via zones/slots.
- [x] `pages/EVGTeamPage.tsx` : vue/édition, toggle « Composer » (groom/admin), noms d'équipe éditables, modale carte ; auto-edit via `?edit` (guard `useRef` anti-rebond après save).

## Lot C — Frontend : découverte d'équipe de Paul ✅
- [x] `hooks/useSquadDiscovery.ts` : flag `evg_has_discovered_squad_{id}` (actif si `is_groom`).
- [x] `components/team/SquadDiscovery.tsx` : Pack Équipe → révélation séquentielle des 12 (compteur n/12, tap), CTA « Compose ton équipe → » vers `/team?edit`.
- [x] `App.tsx` : groom → `SquadDiscovery` (au lieu du reveal perso) au 1er login ; rejouable via `CardRevealContext`.

## Lot D — Optimisations ciblées ✅ (incluses) / ⏸ (reporté)
- [x] **(inclus)** `datetime.utcnow()` → `datetime.now(timezone.utc)` dans `pack_service.py` (+ normalisation UTC→naïf pour la fenêtre EVG).
- [x] **(inclus)** `/debug/images` bridé derrière `settings.debug` (404 sinon).
- [ ] **⏸ reporté** Leaderboard N+1 (laissé de côté pour rester chirurgical, dispo plus tard).

## Vérification ✅
- [x] Backend : `pytest` **19/19 vert** (7 existants + 7 `test_team_service` + 5 `test_team_routes` via TestClient/StaticPool, guard groom/admin testé).
- [x] Front : `tsc --noEmit` OK + `npm run build` OK.
- [x] Table `team_composition` confirmée enregistrée pour `create_all`.
- [ ] **Manuel (à faire par Clément)** : login Paul → découverte 12 cartes → compose 2×5 + banc → recharge en tant qu'autre joueur → compo visible.

# PLAN — Simplification packs + nettoyage perf + arbitre 5v5 (2026-06-28)

> Spec : `docs/superpowers/specs/2026-06-28-pack-simplification-and-referee-design.md`
> Branche : `feat/pack-simplification-and-referee`. DB resettable.

## Chantier A — Simplification & perf
- [x] A1. Supprimé `experience_service.py` + route `/challenges/generate/contextual` + schémas + export + tests liés
- [x] A2. `open_pack` → `select_random_reward` ; rareté dynamique supprimée + tests adaptés
- [x] A3. `PackOpeningModal` : confettis 80-120 → 20-30
- [x] Commit A (`0822704`) — net −442 lignes

## Chantier B — Refonte packs
- [x] B1. 24 récompenses réécrites (FR, mini-défis + petits avantages) dans `seed.py`, rarités alignées (6/tier, toutes atteignables)
- [x] B2. `seed_pack_rewards.py` réutilise `PACK_REWARDS` + mode `--force` (purge+reseed)
- [x] Commit B

## Chantier C — Arbitre 5v5
- [x] C1. Backend : colonne `referee` + schéma (`MAX_REFEREE_SIZE`) + validations service
- [x] C2. Front : zone Arbitre dans `FivePitch` + câblage `EVGTeamPage` + types
- [x] Commit C

## Vérification finale
- [x] `pytest` 20/20 · `tsc --noEmit` OK + `npm run build` OK
- [ ] Test manuel Clément (reset DB + compo arbitre)

## Review (session 2026-06-28)
- **A** : retiré le générateur de défis dynamiques (anglais + debug `[Context:]`) et la pondération
  de rareté dynamique (nuit/pity) — sur-ingénierie inutile à 13 joueurs. Tirage simple par poids fixes.
  Confettis du modal divisés par ~4 pour la fluidité mobile.
- **B** : packs allégés — fini cartes cadeaux/vols massifs/gages lourds. `seed.py` = source unique
  du catalogue ; le script manuel le réutilise (plus de duplication désynchronisée).
- **C** : arbitre ajouté proprement au 5v5 existant (zone tap-to-place, ≤1, unicité globale).
- **⚠ Reset DB requis** avant déploiement : la colonne `referee` et le nouveau catalogue n'apparaissent
  qu'après recréation du schéma (`create_all` n'altère pas une table existante).
  Procédure : arrêter l'app → supprimer la base (ou DROP des tables `team_composition` + `pack_rewards`)
  → redémarrer (auto-seed) ; ou `python scripts/seed_pack_rewards.py --force` pour seulement re-seeder les packs.

---

### Session 2026-06-07 — Découverte d'équipe + Five 5v5

---

### Session 2026-06-07 — Découverte d'équipe + Five 5v5
- **Branche** : `feat/squad-discovery-and-five`.
- **Backend** : table `team_composition` (mono-ligne), service+validations, endpoints `GET/PUT /api/team/composition`, guard `require_groom_or_admin`. Pas de migration manuelle (create_all).
- **Frontend** : page `LE FIVE` (terrain A/B + banc + non-répartis) en vue + édition tap-to-place (Paul/admin) ; découverte « Pack Équipe » des 12 autres pour Paul au 1er login (rejouable).
- **Optims** : `datetime` aware dans `pack_service` ; `/debug/images` masqué hors debug.
- **Tests** : 19/19 (ajout `test_team_service` + `test_team_routes`). `httpx` installé dans `.venv` (déjà listé en dépendance de test commentée dans `requirements.txt`).
- **Reste** : test manuel e2e ; éventuellement broadcast WS de la compo (live) et N+1 leaderboard si besoin.
