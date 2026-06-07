---
title: EVG Ultimate Team
emoji: 🏆
colorFrom: blue
colorTo: red
sdk: docker
pinned: true
license: mit
---

# 🏆 EVG ULTIMATE TEAM

**Gamification Web Application for Paul's Bachelor Party**
*July 3-5, 2026 | Paris Saint-Germain × FIFA Ultimate Team Theme*

A complete full-stack web application for tracking points, challenges, and pack openings during a 3-day bachelor party event with 13 participants.

## 🎮 Overview

EVG Ultimate Team brings FIFA Ultimate Team mechanics to real life, themed with Paris Saint-Germain branding for Paul (the groom) who's a massive PSG fan and FUT enthusiast.

**Event Details:**
- **Dates**: July 3-5, 2026 (Friday evening → Sunday afternoon)
- **Participants**: 13 friends including Paul (the groom)
- **Organizer**: Clément P. (admin with full control)
- **Theme**: PSG colors + FIFA Ultimate Team mechanics

## ✨ Features

### Phase 1 (MVP) - ✅ COMPLETE

- ✅ **Simple Authentication** - Username-only login for participants, password for admin
- ✅ **13 Participants** - Pre-seeded with all bachelor party attendees
- ✅ **Challenge System** - Individual, team, and secret challenges with points
- ✅ **Points Tracking** - Complete transaction history and audit trail
- ✅ **Live Leaderboard** - Real-time rankings via WebSocket
- ✅ **Admin Dashboard** - Challenge validation, points adjustment, full control
- ✅ **PSG/FIFA Theme** - Custom Tailwind design with authentic colors
- ✅ **Mobile-First** - Responsive design optimized for phones

### Future Phases

- 🔄 **Pack System** - Bronze/Silver/Gold/Ultimate packs with rewards
- 🔄 **Event Cards** - Boost, Chaos, and Paul's Choice cards
- 🔄 **Pack Opening Animations** - FIFA-style card reveals
- 🔄 **Advanced Stats** - Daily breakdowns, engagement metrics

## 🚀 Quick Start

### Prerequisites

- **Backend**: Python 3.10+, pip
- **Frontend**: Node.js 18+, npm 9+

### 1. Clone Repository

```bash
git clone <repository-url>
cd evg_ultimate_team
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Seed database with 13 participants + challenges
python seed_database.py

# Start server
python -m app.main
```

Backend runs at: **http://localhost:8000**

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

### 4. Login

**Participants** (username only):
- Paul C., Clément P., Hugo F., Paul J., Théo C., Antonin M., Philippe C., Lancelot M., Vianney D., Thomas S., Martin L., Guillaume V., Adrien M.

**Admin** (username + password):
- Username: `clement`
- Password: `evg2026_admin`

## 📁 Project Structure

```
evg_ultimate_team/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utilities (logging, security)
│   │   ├── websocket/         # WebSocket handlers
│   │   └── main.py            # FastAPI app
│   ├── seed_database.py       # Database seeding
│   ├── requirements.txt       # Python dependencies
│   └── README.md
│
├── frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API client
│   │   ├── hooks/             # Custom hooks
│   │   ├── context/           # React Context
│   │   ├── types/             # TypeScript types
│   │   └── styles/            # Tailwind styles
│   ├── package.json
│   └── README.md
│
├── CLAUDE.md                   # Full specifications
└── README.md                   # This file
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (dev) / PostgreSQL (prod-ready)
- **ORM**: SQLAlchemy 2.0
- **Auth**: JWT tokens (python-jose)
- **Validation**: Pydantic v2
- **WebSocket**: Native FastAPI
- **Server**: Uvicorn

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: TailwindCSS (custom PSG/FIFA theme)
- **Routing**: React Router v6
- **HTTP**: Axios
- **State**: React Context + Hooks
- **WebSocket**: Native WebSocket API
- **Build**: Vite

## 📊 Database Models

- **Participant** - 13 participants with points, packs, stats
- **Challenge** - Individual/team/secret challenges with status
- **PointsTransaction** - Complete audit trail of all point changes
- **Pack** (Phase 2) - Pack tiers and rewards
- **EventCard** (Phase 2) - Boost/Chaos/Paul's Choice events

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - Participant login
- `POST /api/auth/admin-login` - Admin login

### Participants
- `GET /api/participants` - List all
- `GET /api/participants/{id}` - Get one
- `GET /api/participants/me/profile` - Current user
- `POST /api/participants` - Create (admin)
- `PUT /api/participants/{id}` - Update (admin)

### Challenges
- `GET /api/challenges` - List all
- `POST /api/challenges` - Create (admin)
- `PUT /api/challenges/{id}` - Update (admin)
- `POST /api/challenges/{id}/attempt` - Mark active
- `POST /api/challenges/{id}/validate` - Validate (admin)

### Points
- `POST /api/points/add` - Add points (admin)
- `POST /api/points/subtract` - Subtract points (admin)
- `GET /api/points/history/{id}` - Transaction history

### Leaderboard
- `GET /api/leaderboard` - Full rankings
- `GET /api/leaderboard/top-3` - Podium
- `GET /api/leaderboard/daily` - Today's leader
- `WS /ws/leaderboard` - Real-time updates

## 🎨 Design System

### Color Palette

**PSG Colors:**
- Blue: `#004170` (main)
- Red: `#DA291C` (accent)
- Navy: `#001E41` (background)

**FIFA Colors:**
- Gold: `#D4AF37` (premium)
- Silver: `#C0C0C0`
- Bronze: `#CD7F32`
- Green: `#00FF41` (success)

### Typography
- **Headings**: Bebas Neue (sports-inspired)
- **Body**: Inter (clean sans-serif)
- **Stats**: JetBrains Mono (monospace)

## 📱 User Roles

### Participant
- View own profile and points
- Browse available challenges
- See real-time leaderboard
- Check points history

### Admin (Clément)
- All participant features
- Create/edit/delete challenges
- Validate challenge completions
- Manually adjust points
- View all statistics

### Paul (The Groom)
- All participant features
- Special "Groom" badge
- Featured on leaderboard

## 🔧 Development

### Backend Development

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Code Quality

All code follows strict standards:
- ✅ Type hints (Python) / TypeScript
- ✅ Comprehensive docstrings
- ✅ Error handling with custom exceptions
- ✅ Structured logging
- ✅ Input validation

## 📝 Documentation

- **Backend API**: http://localhost:8000/docs (Swagger UI)
- **Backend README**: [backend/README.md](backend/README.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)
- **Specifications**: [CLAUDE.md](CLAUDE.md)

## 🚢 Production Deployment

### Backend

```bash
# Update .env for production
DATABASE_URL=postgresql://...
SECRET_KEY=<generate-new-key>
CORS_ORIGINS=https://your-frontend.com

# Run with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend

```bash
# Update .env for production
VITE_API_URL=https://your-api.com
VITE_WS_URL=wss://your-api.com

# Build
npm run build

# Deploy dist/ folder to Vercel/Netlify
```

## 🎉 Event Schedule

**Friday Evening:**
- App introduction
- First challenges begin

**Saturday (Peak Day):**
- Morning: Extreme sports challenges
- Afternoon: Team sports (padel, football)
- Evening: Restaurant + nightlife challenges

**Sunday:**
- Brunch recovery
- Final challenges (FIFA tournament, wine tasting)
- Ultimate Pack opening (midday)
- Final leaderboard + trophy ceremony

## 👥 Participants

1. **Paul C.** 👑 - The Groom
2. **Clément P.** ⚙️ - Admin / Wedding Witness
3. **Paul J.** - Wedding Witness
4. **Hugo F.** - Wedding Witness
5. **Théo C.** - Brother / Wedding Witness
6. **Antonin M.** - Cousin / Wedding Witness
7. **Philippe C.** - Cousin / Wedding Witness
8. **Lancelot M.** - Wedding Witness
9. **Vianney D.**
10. **Thomas S.**
11. **Martin L.**
12. **Guillaume V.**
13. **Adrien M.**

## 🐛 Troubleshooting

**Backend won't start:**
- Check virtual environment is activated
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check database file permissions

**Frontend won't start:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

**WebSocket not connecting:**
- Ensure backend is running
- Check CORS settings in backend `.env`
- Verify WebSocket URL in frontend `.env`

## 📄 License

Built for Paul's Bachelor Party - Private Use

## 🙏 Credits

**Built with:**
- FastAPI (backend framework)
- React (frontend framework)
- Tailwind CSS (styling)
- SQLAlchemy (ORM)
- Vite (build tool)

---

**Let's make Paul's bachelor party legendary!** 🏆⚽🎮

*Allez Paris! 🔴🔵*
