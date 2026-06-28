# Handoff — session suivante (préparé le 2026-06-28)

## État actuel (en prod)

Déployé sur `main` et opérationnel :
- **Packs allégés** : 24 récompenses fun (gages express + petits avantages), source unique `backend/app/seed.py::PACK_REWARDS`.
- **Simplifications/perf** : générateur de défis dynamiques + rareté dynamique supprimés ; confettis du `PackOpeningModal` réduits.
- **5v5 + arbitre** : zone arbitre (≤1) dans `FivePitch`/`EVGTeamPage`, persistée (`team_composition.referee`).

### Incident résolu (pour mémoire)
- Le push sur `main` déclenche un build Dokploy ; le conteneur a d'abord crash-loopé (502) sur la **garde de sécurité** `config.py::_enforce_secure_production_secrets` car `SECRET_KEY`/`ADMIN_PASSWORD` n'étaient pas définis en env `production`. **Fix** : variables ajoutées dans Dokploy → Environment.
- DB resettée via **Admin Dashboard → Danger Zone → RESET** (`POST /api/admin/reset-database`, fait `drop_all`+`create_all`+reseed) → colonne `referee` créée + nouveau catalogue.

### Infos opérationnelles clés
- **Déploiement = push sur `main`** (Dokploy). Rester sur branche tant que pas prêt à déployer.
- **DB = SQLite** persistante sur volume `/app/data/evg_ultimate_team.db` (survit aux redéploiements ; `create_all` n'ALTER pas → reset pour tout changement de schéma).
- **Login admin** : username `clement` + `ADMIN_PASSWORD` (env Dokploy). **Id admin interne = 0** (distinct du participant « Clément P. » id 2).
- ⚠️ **1 commit non poussé sur `main`** : fix cosmétique du message de reset (compteur de récompenses dynamique au lieu de « 26 » codé en dur). Partira avec le prochain déploiement — pas besoin d'un build isolé.

---

## À faire la prochaine session

> Approche demandée par Clément : se positionner en **expert UX/UI jeu mobile** pour tout ce qui touche au front.

### 1. Refonte du panel admin
**But** : simplifier et rattacher l'accès admin au profil de **Clément P.** (ex. entrée « Admin Panel » dans la section profil), plutôt qu'un écran séparé.
Fonctions à garder, épurées :
- Ajout / retrait de points pour des joueurs ciblés.
- CRUD défis (ajout / modif / suppression).
- CRUD packs/récompenses (ajout / modif / suppression).

Points d'ancrage :
- Backend : `routes/admin.py`, `routes/points.py` (add/subtract), `routes/challenges.py` (CRUD défis). Pas d'endpoint CRUD pour les `pack_rewards` aujourd'hui → **à créer** (le catalogue est figé dans `seed.py`, il faudra une gestion en base).
- Front : `pages/AdminDashboard.tsx`, `services/adminService.ts`, `components/layout/ProfileDropdown.tsx`.
- ⚠️ Distinguer le **compte admin** (config, id 0) du **participant « Clément P. »** (id 2). Décider comment « rattacher » l'admin au profil sans mélanger les deux (probablement : si le user connecté est l'admin, afficher l'entrée panel ; ou permettre à Clément P. de s'auth en admin).

### 2. Pages plus mobile-friendly
Audit UX/UI mobile (la majorité jouera sur téléphone). Pages à passer en revue :
- `HomePage`, `LeaderboardPage`, `ChallengesPage`, `PacksPage`, `EVGTeamPage` (LE FIVE), `ProfilePage`, `LoginPage`, `BottomNavigation`.
- Déjà allégé : `PackOpeningModal` (confettis). Vérifier tailles tactiles, scroll, header overflow, le terrain 5v5 sur petit écran (cartes + slots), lisibilité des chips joueurs.

### 3. Bug : Paul ne peut pas voir sa propre carte
**Symptôme** : quand Paul clique « Voir ma carte », il voit le **pack d'équipe** (SquadDiscovery) au lieu de sa carte FUT perso, contrairement aux autres joueurs.
**Cause** : `App.tsx` (≈ l.102-114) — quand `shouldTriggerReveal && isGroom`, on rend `SquadDiscovery` au lieu de `PlayerCardReveal`. Le bouton « Voir ma carte » (`ProfileDropdown.tsx` l.161-170) déclenche `triggerReveal()` (`CardRevealContext`), qui pour le groom retombe sur la découverte d'équipe.
**Piste de fix** : séparer deux intentions —
- *Découverte d'équipe* (1er login du groom, gated `useSquadDiscovery`) → reste sur SquadDiscovery.
- *« Voir ma carte »* → toujours `PlayerCardReveal` de SA propre carte, **y compris pour Paul**.
Fichiers : `App.tsx`, `context/CardRevealContext.tsx`, `hooks/useSquadDiscovery.ts`, `components/auth/PlayerCardReveal.tsx`, `components/team/SquadDiscovery.tsx`, `components/layout/ProfileDropdown.tsx`.

---

## Démarrage conseillé prochaine session
1. Brancher depuis `main` (qui contient le commit cosmétique non poussé).
2. Brainstormer la refonte admin (décisions produit : rattachement admin↔profil, gestion packs en base).
3. Traiter le bug carte de Paul (petit, isolé) en premier si on veut une victoire rapide.
