# EVG ULTIMATE TEAM - Development Guidelines

## Project Overview

**EVG ULTIMATE TEAM** is a gamification web application for Paul C's bachelor party (June 4-6, 2026). The app tracks points, challenges, and pack openings throughout a 3-day event (Friday evening to Sunday afternoon) with 13 participants.

The app is themed around FIFA Ultimate Team mechanics combined with Paris Saint-Germain (PSG) branding, as Paul is a PSG fan and loves FUT on console/mobile.

## Tech Stack

- **Frontend**: React (with TypeScript recommended)
- **Backend**: FastAPI (Python)
- **Real-time**: WebSockets for live leaderboard updates
- **Database**: SQLite or PostgreSQL
- **Styling**: TailwindCSS with custom PSG/FIFA theme

## Design System

### Color Palette (PSG/FIFA Inspired)

**Primary Colors:**
- PSG Blue: `#004170` (main blue)
- PSG Red: `#DA291C` (accent red)
- PSG Navy: `#001E41` (dark backgrounds)

**Secondary Colors:**
- FIFA Gold: `#D4AF37` (for Ultimate packs, premium elements)
- FIFA Silver: `#C0C0C0` (for Silver packs)
- FIFA Bronze: `#CD7F32` (for Bronze packs)
- FIFA Green: `#00FF41` (success, positive actions)
- FIFA Dark: `#0A0A0A` (backgrounds, cards)

**UI Elements:**
- Card backgrounds: Dark gradient similar to FIFA cards
- Buttons: PSG blue with red accents
- Borders: Gold/Silver/Bronze based on rarity
- Shadows: Glowing effects for rare items

### Typography

- **Headings**: Bold, sports-inspired font (e.g., Bebas Neue, Oswald)
- **Body**: Clean sans-serif (e.g., Inter, Roboto)
- **Numbers/Stats**: Monospace for leaderboard scores

### Visual Style

- FIFA-style card designs for participants
- Gradient backgrounds (dark blue to navy)
- Animated pack openings (cards flipping/revealing)
- PSG logo/patterns as background elements
- Neon glow effects for active elements

## Core Features

### 1. User Management

**Participants:**
- 13 participants including Paul (the groom)
- Each participant has:
  - Name
  - Avatar (photo or generated)
  - Total points
  - Pack inventory
  - Challenge history
  - Special role (Paul is marked as "Groom")

**Admin Access:**
- Clément (organizer) has admin privileges
- Can manually adjust points
- Can trigger events/reveals
- Can validate challenge completions

### 2. Points System

**Point Sources:**
- Individual challenges: 20-50 points
- Team challenges: 100 points (shared)
- Secret challenges: 50-100 points
- Event cards: variable
- Penalties: -20 points

**Points Display:**
- Real-time leaderboard (FIFA-style ranking)
- Points history/feed per participant
- Daily points breakdown
- Total accumulation over 3 days

### 3. Challenge System

**Challenge Types:**

**Individual Challenges (20-50 pts):**
- "Convince a stranger you're a Red Bull sales rep"
- "Win a 1v1 FIFA match against Paul"
- "Complete a rugby transformation"
- "Finish first in go-kart racing"
- "Give a 2-minute speech about why Paul is the best groom"
- "Order a shot mimicking Paul's accent"

**Team Challenges (100 pts shared):**
- "Win the padel tournament"
- "Win the football match"
- "Finish champagne bottle under X minutes"
- "Complete a 5-person karaoke"

**Secret Challenges (50-100 pts):**
- Revealed randomly or at specific times
- Example: "Next person to make Paul laugh wins 50 pts"
- Hidden until triggered

**Penalties (-20 pts):**
- Last person awake in the morning
- Refusing a shot
- Breaking house rules

**Challenge States:**
- Pending (waiting to be attempted)
- Active (currently in progress)
- Completed (validated by admin)
- Failed (not completed)

### 4. Pack System

**Pack Tiers:**

**Bronze Pack (100 pts):**
- Free shot
- Skip one penalty
- Choose music for 1 hour

**Silver Pack (200 pts):**
- Assign a dare to someone
- Double points on next challenge
- Paul must serve your drinks for 2 hours

**Gold Pack (300 pts):**
- Total immunity Sunday morning (no chores)
- Choose bonus activity
- Paul makes your bed tomorrow

**Ultimate Pack (500 pts - one draw Sunday midday):**
- Premium prize (expensive bottle, gift card, collector item)
- Paul wears your jersey/accessory for 1 hour
- Wildcard: cancel any dare for anyone

**Pack Opening Mechanics:**
- FIFA-style card reveal animation
- Participants spend points to open packs
- Random rewards from the tier pool
- Pack opening history tracked
- Cooldown between openings (optional)

**Pack Opening Schedule:**
- 3 opening moments per day:
  - Morning (breakfast)
  - Afternoon (pre-activity)
  - Evening (party time)
- Special Ultimate Pack opening: Sunday midday only

### 5. Event Cards

**Random Event Mechanics:**
- Admin can trigger event cards at any time
- Events affect all or specific participants
- FIFA-style card reveal animation

**Event Types:**

**Boost Cards:**
- "x2 points on next 2 challenges"
- "Instant 50 points"
- "Free Bronze pack"

**Chaos Cards:**
- "Everyone loses 50 pts except last place"
- "Swap points with another player"
- "All pending challenges reset"

**Paul's Choice Cards:**
- "Paul selects who gets 100 pts"
- "Paul assigns a dare"
- "Paul chooses next challenge"

### 6. Schedule Integration

**3-Day Timeline:**

**Friday Evening:**
- App introduction and rules explanation
- First secret challenge draw
- Social challenges begin

**Saturday (Peak Day):**
- Morning: Extreme sports challenges (bungee/skydiving)
- Afternoon: Padel/football team challenges
- Midday pack opening
- Evening: Restaurant + nightlife challenges
- Evening pack opening

**Sunday:**
- Brunch recovery
- Afternoon: FIFA tournament + wine blind test
- **Ultimate Pack opening (midday)**
- Final leaderboard reveal
- Trophy ceremony before departure

**Time-based Features:**
- Challenges unlock at specific times
- Pack openings at scheduled moments
- Countdown timers for events
- Daily recap/summary

### 7. Live Leaderboard

**Display Elements:**
- Real-time ranking (1st to 13th)
- Participant photo/avatar
- Current points total
- Points gained today
- Active challenges count
- Pack inventory icons
- Special badges (leader, Paul, last place)

**Leaderboard Features:**
- Auto-refresh via WebSocket
- Animated position changes
- Highlight top 3 (podium style)
- Daily leader selection (chooses next day's aperitif theme)

### 8. Admin Dashboard

**Admin Capabilities:**
- Create/edit/delete challenges
- Validate challenge completions
- Manually adjust points (with reason)
- Trigger event cards
- Open pack opening windows
- View all participant details
- Reset or modify game state
- Send notifications to participants

**Analytics:**
- Total points distributed
- Most completed challenges
- Pack opening statistics
- Participant engagement metrics

## Data Models

### Participant
```python
{
    "id": int,
    "name": str,
    "avatar_url": str,
    "is_groom": bool,  # True for Paul
    "total_points": int,
    "current_packs": {
        "bronze": int,
        "silver": int,
        "gold": int,
        "ultimate": int
    },
    "created_at": datetime
}
```

### Challenge
```python
{
    "id": int,
    "title": str,
    "description": str,
    "type": enum["individual", "team", "secret"],
    "points": int,
    "status": enum["pending", "active", "completed", "failed"],
    "assigned_to": list[int],  # participant IDs
    "completed_by": list[int],  # participant IDs
    "created_at": datetime,
    "completed_at": datetime | null,
    "validated_by": int | null  # admin ID
}
```

### Pack
```python
{
    "id": int,
    "tier": enum["bronze", "silver", "gold", "ultimate"],
    "cost": int,  # points required
    "rewards": list[str],  # possible rewards in this pack
    "opened_by": int | null,  # participant ID
    "reward_received": str | null,
    "opened_at": datetime | null
}
```

### Event Card
```python
{
    "id": int,
    "title": str,
    "description": str,
    "type": enum["boost", "chaos", "paul_choice"],
    "effect": str,  # JSON describing the effect
    "triggered_at": datetime,
    "triggered_by": int,  # admin ID
    "affected_participants": list[int]
}
```

### Points Transaction
```python
{
    "id": int,
    "participant_id": int,
    "amount": int,  # positive or negative
    "reason": str,
    "challenge_id": int | null,
    "event_id": int | null,
    "created_at": datetime,
    "created_by": int  # admin or system
}
```

## User Stories

### As a Participant

1. **View My Profile**
   - See my current points total
   - View my challenge history
   - Check my pack inventory
   - See my ranking on leaderboard

2. **Browse Challenges**
   - See available challenges
   - View challenge details and points
   - See which challenges I've completed
   - Check secret challenges when revealed

3. **Complete Challenges**
   - Mark a challenge as "attempting"
   - Request validation from admin
   - See real-time points update after validation

4. **Open Packs**
   - Check if pack opening window is active
   - Spend points to open packs (if enough balance)
   - Experience FIFA-style reveal animation
   - Receive and view my reward

5. **Check Leaderboard**
   - See real-time rankings
   - View other participants' points
   - See who's in the lead
   - Check daily leader (who chooses aperitif)

6. **Receive Notifications**
   - Get notified when points are earned
   - Alerted when new challenges unlock
   - Notified when pack opening windows open
   - Receive event card notifications

### As Paul (The Groom)

1. **Special Role Display**
   - Profile marked as "Groom" with special badge
   - Featured on homepage/leaderboard

2. **Paul's Choice Events**
   - Receive notifications when "Paul's Choice" cards trigger
   - Select who receives points/rewards
   - Assign dares to participants

### As Admin (Clément)

1. **Manage Challenges**
   - Create new challenges
   - Edit existing challenges
   - Delete or deactivate challenges
   - Validate challenge completions

2. **Control Points**
   - Manually add/subtract points
   - View all points transactions
   - Adjust for errors or special circumstances

3. **Trigger Events**
   - Launch event cards at strategic times
   - Control pack opening windows
   - Send global notifications

4. **Monitor Game**
   - View real-time statistics
   - Check participant engagement
   - See completion rates
   - Generate end-of-event report

## API Endpoints (FastAPI)

### Authentication
- `POST /api/auth/login` - Participant login
- `POST /api/auth/admin-login` - Admin login

### Participants
- `GET /api/participants` - List all participants
- `GET /api/participants/{id}` - Get participant details
- `PUT /api/participants/{id}` - Update participant (admin)
- `GET /api/participants/{id}/points-history` - Get points transactions

### Challenges
- `GET /api/challenges` - List all challenges
- `GET /api/challenges/{id}` - Get challenge details
- `POST /api/challenges` - Create challenge (admin)
- `PUT /api/challenges/{id}` - Update challenge (admin)
- `DELETE /api/challenges/{id}` - Delete challenge (admin)
- `POST /api/challenges/{id}/attempt` - Mark challenge as attempting
- `POST /api/challenges/{id}/validate` - Validate completion (admin)

### Packs
- `GET /api/packs/available` - Get available pack tiers
- `POST /api/packs/open` - Open a pack (spend points)
- `GET /api/packs/history` - Get pack opening history
- `POST /api/packs/schedule` - Set pack opening window (admin)

### Events
- `GET /api/events` - List all event cards
- `POST /api/events/trigger` - Trigger an event (admin)
- `GET /api/events/history` - Get event history

### Leaderboard
- `GET /api/leaderboard` - Get current rankings
- `GET /api/leaderboard/daily` - Get daily leader

### Points
- `POST /api/points/add` - Manually add points (admin)
- `POST /api/points/subtract` - Manually subtract points (admin)

### WebSocket
- `WS /ws/leaderboard` - Real-time leaderboard updates
- `WS /ws/notifications` - Real-time notifications

## Frontend Components (React)

### Pages
- `HomePage` - Welcome screen with PSG/FIFA branding
- `LeaderboardPage` - Live rankings and stats
- `ChallengesPage` - Browse and track challenges
- `PackOpeningPage` - Open packs with animation
- `ProfilePage` - Participant details and history
- `AdminDashboard` - Admin controls (protected)

### Key Components
- `ParticipantCard` - FIFA-style player card
- `ChallengeCard` - Challenge display with status
- `PackCard` - Pack tier display (Bronze/Silver/Gold/Ultimate)
- `PackOpeningAnimation` - FIFA-style reveal animation
- `Leaderboard` - Rankings table with live updates
- `PointsTransaction` - Points feed item
- `EventCardNotification` - Event card popup
- `CountdownTimer` - Timer for scheduled events

## Implementation Priorities

### Phase 1: Core Functionality (MVP)
1. User authentication (simple login)
2. Basic participant profiles
3. Challenge system (create, assign, validate)
4. Points system (earn, track, display)
5. Simple leaderboard
6. Admin dashboard

### Phase 2: Gamification
1. Pack system (purchase, open, rewards)
2. Pack opening animations
3. Event cards system
4. Real-time WebSocket updates
5. Notifications

### Phase 3: Polish
1. PSG/FIFA themed UI
2. Smooth animations
3. Mobile responsiveness
4. Advanced statistics
5. End-of-event report generation

## Special Considerations

### Commercial Challenges (Paul's Job)
- Include challenges that play on Paul's sales skills
- "Pitch absurd items" challenges
- "Negotiate discounts" at restaurants/bars
- Roleplay commercial scenarios

### Rugby Integration
- Challenges related to rugby (Paul loves rugby)
- Rugby terminology in challenge descriptions
- Toulouse Stade references
- Touch rugby challenges

### FIFA/FUT Theme
- Pack opening must feel like FUT mobile/console
- Card reveal animations
- Rarity indicators (common/rare/legendary)
- "Chemistry" style participant interactions

### Mobile-First Design
- Most participants will use phones during the event
- Touch-optimized interactions
- Quick load times
- Offline support for challenge viewing

## Success Metrics

- All 13 participants actively engaging with the app
- Average of 5+ challenges completed per person
- At least 2 pack openings per person per day
- Real-time leaderboard updates < 1 second
- Zero critical bugs during the 3-day event

## Deployment

- Deploy backend on a reliable host (Heroku, Railway, Render)
- Deploy frontend on Vercel or Netlify
- Ensure stable WebSocket connection
- Test thoroughly before June 4, 2026

## Additional Notes

- Event runs Friday evening through Sunday afternoon
- Sunday has NO evening party (departure time)
- Ultimate Pack opening: Sunday midday ONLY
- Daily leader on Saturday chooses Sunday aperitif theme
- Admin (Clément) is final authority on all points/validations

---

**Good luck building EVG ULTIMATE TEAM! Let's make Paul's bachelor party legendary! 🏆⚽🎮**