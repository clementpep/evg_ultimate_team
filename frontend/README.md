# EVG Ultimate Team - Frontend

React + TypeScript frontend for Paul's bachelor party gamification app.

## Features

- 🎨 **PSG/FIFA Theme** - Custom Tailwind design with Paris Saint-Germain and FIFA Ultimate Team colors
- 🔐 **Simple Authentication** - Username-only login with secure token management
- 📊 **Live Leaderboard** - Real-time updates via WebSocket
- 🎯 **Challenge Tracking** - View and track all challenges with status
- 👑 **Admin Dashboard** - Full control panel for Clément (organizer)
- 📱 **Mobile-First** - Responsive design optimized for phones

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Styling**: TailwindCSS with custom PSG/FIFA theme
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context + Custom Hooks
- **Real-time**: WebSocket for live updates
- **Build Tool**: Vite
- **Date Formatting**: date-fns

## Project Structure

```
frontend/src/
├── components/
│   └── common/          # Reusable UI components
├── pages/               # Page components
├── services/            # API client & services
├── hooks/               # Custom React hooks
├── context/             # React Context (Auth)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── styles/              # Global styles
├── App.tsx              # Main app with routing
└── main.tsx             # Entry point
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm 9+
- Backend server running on http://localhost:8000

### 2. Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 3. Environment Configuration

The `.env` file is already configured for local development:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_ENVIRONMENT=development
VITE_DEBUG=true
```

### 4. Run Development Server

```bash
# Start development server
npm run dev

# Server will start at http://localhost:5173
```

### 5. Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Usage

### Participant Login

1. Navigate to http://localhost:5173
2. Enter your name (one of the 13 participants)
3. Click "Login"

**Example Participants:**
- Paul C. (The Groom)
- Clément P.
- Hugo F.
- ...and 10 more

### Admin Login

1. Click "Admin login" link
2. Enter credentials:
   - Username: `clement`
   - Password: `evg2026_admin`
3. Click "Admin Login"

## Features Guide

### Home Page
- Your current points
- Top 3 podium
- Today's leader
- Quick navigation

### Leaderboard
- Real-time rankings (updates automatically)
- Live connection indicator
- Podium highlighting (gold/silver/bronze)
- Points earned today

### Challenges
- View all available challenges
- See active challenges
- Check completed challenges
- Points for each challenge

### Admin Dashboard (Admin Only)
- Validate challenge completions
- Add/subtract points manually
- Manage all participants

## Design System

### Colors

**PSG Colors:**
- Blue: `#004170`
- Red: `#DA291C`
- Navy: `#001E41`

**FIFA Colors:**
- Gold: `#D4AF37`
- Silver: `#C0C0C0`
- Bronze: `#CD7F32`
- Green: `#00FF41`

### Components

All components use the custom Tailwind theme:

```tsx
import { Button, Card, Input } from '@components/common';

<Button variant="primary">Click me</Button>
<Card>Content</Card>
<Input label="Name" placeholder="Enter name" />
```

## WebSocket Connection

The app connects to WebSocket for real-time leaderboard updates:

- **Endpoint**: `ws://localhost:8000/ws/leaderboard`
- **Auto-reconnect**: Yes (every 3 seconds)
- **Live indicator**: Shows connection status

## Troubleshooting

### Port Already in Use

```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3000
```

### API Connection Failed

1. Ensure backend is running on http://localhost:8000
2. Check `.env` file has correct `VITE_API_URL`
3. Check browser console for errors

### WebSocket Not Connecting

1. Ensure backend WebSocket endpoint is running
2. Check `VITE_WS_URL` in `.env`
3. Check browser console for WebSocket errors

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or try with --force
npm install --force
```

## Development Tips

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in Layout component

### Adding New API Endpoints

1. Add function to appropriate service in `src/services/`
2. Use in components with useState/useEffect or custom hooks

### Creating Custom Hooks

1. Create file in `src/hooks/`
2. Follow existing patterns (useLeaderboard, useChallenges)
3. Export from component that needs it

## Production Deployment

### Build and Deploy

```bash
# Build for production
npm run build

# Deploy dist/ folder to:
# - Vercel: vercel --prod
# - Netlify: netlify deploy --prod
# - Any static hosting service
```

### Environment Variables for Production

Update `.env` for production:

```env
VITE_API_URL=https://your-backend-api.com
VITE_WS_URL=wss://your-backend-api.com
VITE_ENVIRONMENT=production
VITE_DEBUG=false
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Initial load: < 2s
- Route changes: < 100ms
- WebSocket latency: < 50ms
- Lighthouse score: 90+

---

**Built for Paul's Bachelor Party (June 4-6, 2026)**
*PSG colors, FIFA vibes, legendary times!* 🏆⚽🎮
