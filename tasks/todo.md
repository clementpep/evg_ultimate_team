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
