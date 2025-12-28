# EVG Ultimate Team - Backend API

FastAPI backend for Paul's bachelor party gamification app.

## Features

- 🔐 **Simple Authentication** - Username-only login for participants, password-protected admin access
- 👥 **Participant Management** - CRUD operations for all 13 participants
- 🎯 **Challenge System** - Create, assign, and validate challenges with points
- 📊 **Points Tracking** - Complete transaction history with audit trail
- 🏆 **Live Leaderboard** - Real-time rankings via WebSocket
- 📝 **Comprehensive Logging** - Structured logging for all operations
- 🛡️ **Error Handling** - Custom exceptions with meaningful error messages

## Tech Stack

- **Framework**: FastAPI 0.104+
- **Database**: SQLite (development) / PostgreSQL (production-ready)
- **ORM**: SQLAlchemy 2.0+
- **Authentication**: JWT tokens (python-jose)
- **Validation**: Pydantic v2
- **WebSocket**: Native FastAPI WebSocket support
- **Server**: Uvicorn with auto-reload

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app initialization
│   ├── config.py               # Configuration management
│   ├── database.py             # Database setup
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── routes/                 # API endpoints
│   ├── services/               # Business logic
│   ├── utils/                  # Utilities (logging, security, etc.)
│   └── websocket/              # WebSocket handlers
├── seed_database.py            # Database seeding script
├── requirements.txt            # Python dependencies
└── .env                        # Environment variables (create from .env.example)
```

## Setup Instructions

### 1. Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

### 2. Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (optional for development)
# Default values work for local development
```

**Key Environment Variables:**

```env
DATABASE_URL=sqlite:///./evg_ultimate_team.db
SECRET_KEY=change-this-to-a-random-secret-key-in-production
ADMIN_USERNAME=clement
ADMIN_PASSWORD=evg2026_admin
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=INFO
```

### 4. Database Initialization

```bash
# Seed database with 13 participants and sample challenges
python seed_database.py

# Confirm with 'yes' when prompted
```

This creates:
- ✅ 13 participants (Paul C. as groom)
- ✅ 15 sample challenges (individual, team, secret)
- ✅ Database schema (all tables)

### 5. Run the Server

```bash
# Development mode (with auto-reload)
python -m app.main

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: **http://localhost:8000**

## API Documentation

Once the server is running, access interactive API docs at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/login` - Participant login (username only)
- `POST /api/auth/admin-login` - Admin login (username + password)

### Participants
- `GET /api/participants` - List all participants
- `GET /api/participants/{id}` - Get participant details
- `GET /api/participants/me/profile` - Get current user profile
- `POST /api/participants` - Create participant (admin)
- `PUT /api/participants/{id}` - Update participant (admin)
- `DELETE /api/participants/{id}` - Delete participant (admin)

### Challenges
- `GET /api/challenges` - List all challenges
- `GET /api/challenges/{id}` - Get challenge details
- `POST /api/challenges` - Create challenge (admin)
- `PUT /api/challenges/{id}` - Update challenge (admin)
- `DELETE /api/challenges/{id}` - Delete challenge (admin)
- `POST /api/challenges/{id}/attempt` - Mark challenge as active
- `POST /api/challenges/{id}/validate` - Validate completion (admin)
- `GET /api/challenges/participant/{id}` - Get participant's challenges

### Points
- `POST /api/points/add` - Add points (admin)
- `POST /api/points/subtract` - Subtract points (admin)
- `GET /api/points/history/{participant_id}` - Get points history
- `GET /api/points/recent` - Get recent transactions

### Leaderboard
- `GET /api/leaderboard` - Get full leaderboard
- `GET /api/leaderboard/top-3` - Get podium (top 3)
- `GET /api/leaderboard/daily` - Get daily leader
- `GET /api/leaderboard/rank/{participant_id}` - Get participant rank
- `GET /api/leaderboard/stats` - Get statistics

### WebSocket
- `WS /ws/leaderboard` - Real-time leaderboard updates

## Testing the API

### Using cURL

```bash
# Participant login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "Paul C."}'

# Admin login
curl -X POST http://localhost:8000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username": "clement", "password": "evg2026_admin"}'

# Get leaderboard
curl http://localhost:8000/api/leaderboard
```

### Using Python

```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/api/auth/login",
    json={"username": "Hugo F."}
)
token = response.json()["data"]["access_token"]

# Get leaderboard (authenticated)
headers = {"Authorization": f"Bearer {token}"}
leaderboard = requests.get(
    "http://localhost:8000/api/leaderboard",
    headers=headers
)
print(leaderboard.json())
```

## Default Participants

The seed script creates these 13 participants:

1. **Paul C.** (Groom) - The man of the hour
2. **Clément P.** (Admin) - Organizer and wedding witness
3. **Paul J.** - Wedding witness
4. **Hugo F.** - Wedding witness
5. **Théo C.** - Groom's brother and wedding witness
6. **Antonin M.** - Groom's cousin and wedding witness
7. **Philippe C.** - Groom's cousin and wedding witness
8. **Lancelot M.** - Wedding witness
9. **Vianney D.**
10. **Thomas S.**
11. **Martin L.**
12. **Guillaume V.**
13. **Adrien M.**

## Admin Credentials

**Username**: `clement`
**Password**: `evg2026_admin`

⚠️ **Change these in production!**

## Database Management

### Reset Database

```bash
# WARNING: This deletes all data
python seed_database.py
```

### Backup Database (SQLite)

```bash
# Create backup
cp evg_ultimate_team.db evg_ultimate_team.db.backup

# Restore from backup
cp evg_ultimate_team.db.backup evg_ultimate_team.db
```

## Logging

Logs are output to console by default. Configure file logging in `.env`:

```env
LOG_FILE=logs/evg_ultimate_team.log
```

Log levels: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`

## Production Deployment

### Environment Variables

```env
ENVIRONMENT=production
DEBUG=false
DATABASE_URL=postgresql://user:password@localhost:5432/evg_ultimate_team
SECRET_KEY=<generate-strong-random-key>
CORS_ORIGINS=https://your-frontend-domain.com
```

### Generate Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Run with Gunicorn

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Troubleshooting

### Port Already in Use

```bash
# Change port in .env
API_PORT=8001

# Or specify when running
uvicorn app.main:app --port 8001
```

### Database Locked (SQLite)

```bash
# Close all connections and restart server
rm evg_ultimate_team.db
python seed_database.py
```

### Import Errors

```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## Development

### Code Quality

All code follows these standards:
- ✅ Type hints everywhere
- ✅ Docstrings for all functions
- ✅ Comprehensive error handling
- ✅ Structured logging
- ✅ Input validation

### Adding New Features

1. Create model in `app/models/`
2. Create schema in `app/schemas/`
3. Create service in `app/services/`
4. Create route in `app/routes/`
5. Update `app/main.py` to include new router

## Support

For issues or questions, check:
- API docs: http://localhost:8000/docs
- Logs: Check console output
- Database: Use SQLite browser to inspect data

---

**Built for Paul's Bachelor Party (June 4-6, 2026)**
*Let's make it legendary!* 🏆⚽🎮
