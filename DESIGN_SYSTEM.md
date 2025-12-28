# PSG Talent Index - Design System

## Brand Identity

This design system is built around Paris Saint-Germain (PSG) football club branding, creating an immersive football talent management experience inspired by FIFA Ultimate Team (FUT) mechanics.

---

## Color Palette

### Primary Colors

```css
--psg-navy: #001F5B;        /* Primary brand color - Deep PSG blue */
--psg-red: #DA291C;         /* Accent color - PSG red */
--psg-white: #FFFFFF;       /* Text and backgrounds */
```

### Background Colors

```css
--bg-primary: #0A1628;      /* Main dark background */
--bg-secondary: #152238;    /* Secondary dark background */
--bg-card: #1A2942;         /* Card backgrounds */
--bg-card-hover: #223A5E;   /* Card hover state */
```

### Gradient Colors

```css
--gradient-blue-red: linear-gradient(135deg, #2B5A9E 0%, #8B2844 100%);
--gradient-radar-fill: linear-gradient(180deg, rgba(218, 41, 28, 0.6) 0%, rgba(43, 90, 158, 0.6) 100%);
--gradient-card-bg: linear-gradient(180deg, rgba(0, 31, 91, 0.3) 0%, rgba(26, 41, 66, 0.8) 100%);
```

### Semantic Colors

```css
--success: #04F06A;         /* Success states, positive metrics */
--warning: #FFB800;         /* Warning states */
--error: #FF4444;           /* Error states */
--info: #3B82F6;            /* Information */
```

### Text Colors

```css
--text-primary: #FFFFFF;
--text-secondary: #A0AEC0;
--text-tertiary: #718096;
--text-muted: #4A5568;
```

---

## Typography

### Font Families

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Montserrat', 'Inter', sans-serif;
--font-numbers: 'Rajdhani', 'Roboto Mono', monospace;
```

### Font Sizes

```css
/* Display */
--text-display-xl: 4.5rem;    /* 72px - Hero numbers */
--text-display-lg: 3.75rem;   /* 60px - Large scores */
--text-display-md: 3rem;      /* 48px - Player names */
--text-display-sm: 2.25rem;   /* 36px - Section titles */

/* Headings */
--text-h1: 2rem;              /* 32px */
--text-h2: 1.5rem;            /* 24px */
--text-h3: 1.25rem;           /* 20px */
--text-h4: 1.125rem;          /* 18px */

/* Body */
--text-base: 1rem;            /* 16px */
--text-sm: 0.875rem;          /* 14px */
--text-xs: 0.75rem;           /* 12px */
--text-xxs: 0.625rem;         /* 10px */
```

### Font Weights

```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

### Line Heights

```css
--leading-tight: 1.1;
--leading-snug: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## Spacing System

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

---

## Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.5rem;    /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;   /* 12px - Cards */
--radius-xl: 1rem;      /* 16px - Large cards */
--radius-2xl: 1.5rem;   /* 24px - Hero cards */
--radius-full: 9999px;  /* Pills, avatars */
```

---

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
--shadow-glow: 0 0 20px rgba(218, 41, 28, 0.4);
--shadow-glow-blue: 0 0 20px rgba(0, 31, 91, 0.5);
```

---

## Components

### Buttons

#### Primary Button (CTA Red)
```css
.btn-primary {
  background: var(--psg-red);
  color: var(--psg-white);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #C31E1A;
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--psg-white);
  border: 2px solid var(--psg-navy);
  font-weight: var(--font-semibold);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--psg-navy);
  border-color: var(--psg-red);
}
```

#### Icon Button
```css
.btn-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--psg-red);
  color: var(--psg-white);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.btn-icon:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-glow);
}
```

### Cards

#### Player Card
```css
.player-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.player-card:hover {
  background: var(--bg-card-hover);
  box-shadow: var(--shadow-2xl);
  transform: translateY(-4px);
  border-color: rgba(218, 41, 28, 0.3);
}
```

#### Stat Card
```css
.stat-card {
  background: linear-gradient(135deg, rgba(0, 31, 91, 0.4) 0%, rgba(26, 41, 66, 0.6) 100%);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}
```

### Navigation

#### Header Navigation
```css
.nav-header {
  background: var(--bg-primary);
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: var(--shadow-md);
}

.nav-item {
  color: var(--text-secondary);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-4) var(--space-6);
  transition: all 0.3s ease;
}

.nav-item:hover,
.nav-item.active {
  color: var(--psg-white);
  background: rgba(218, 41, 28, 0.1);
  border-bottom: 2px solid var(--psg-red);
}
```

### Tables & Leaderboards

#### Leaderboard Table
```css
.leaderboard {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.leaderboard-header {
  background: rgba(0, 31, 91, 0.6);
  padding: var(--space-4) var(--space-6);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  color: var(--text-secondary);
}

.leaderboard-row {
  display: grid;
  grid-template-columns: 60px 1fr repeat(6, 80px);
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;
}

.leaderboard-row:hover {
  background: rgba(218, 41, 28, 0.05);
}

.leaderboard-rank {
  font-size: var(--text-h3);
  font-weight: var(--font-black);
  color: var(--text-secondary);
}

.leaderboard-rank.top-3 {
  color: var(--psg-red);
}
```

### Data Visualization

#### Radar Chart (Pentagon)
```css
.radar-chart {
  width: 100%;
  aspect-ratio: 1;
  background: radial-gradient(circle, rgba(0, 31, 91, 0.2) 0%, transparent 70%);
  border-radius: var(--radius-lg);
}

.radar-fill {
  fill: url(#radarGradient);
  opacity: 0.7;
}

.radar-stroke {
  stroke: var(--psg-red);
  stroke-width: 2;
  fill: none;
}

.radar-grid {
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 1;
}

.radar-label {
  fill: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
}
```

#### Stat Bars
```css
.stat-bar-container {
  background: rgba(255, 255, 255, 0.05);
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
}

.stat-bar {
  background: var(--psg-red);
  height: 100%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.stat-bar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 100%);
}

.stat-value {
  position: absolute;
  top: 50%;
  right: var(--space-4);
  transform: translateY(-50%);
  font-size: var(--text-h3);
  font-weight: var(--font-bold);
  color: var(--psg-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.stat-label {
  position: absolute;
  top: 50%;
  left: var(--space-4);
  transform: translateY(-50%);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  text-transform: uppercase;
}
```

### Score Display (TIS - Talent Index Score)

```css
.tis-score {
  background: var(--psg-white);
  color: var(--psg-navy);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-xl);
}

.tis-label {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}

.tis-value {
  font-size: var(--text-display-lg);
  font-weight: var(--font-black);
  font-family: var(--font-numbers);
  line-height: var(--leading-tight);
  color: var(--psg-navy);
}

.tis-cta {
  margin-top: var(--space-4);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  color: var(--psg-red);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}
```

### Pack Opening (FUT-style)

#### Pack Card
```css
.pack-card {
  background: linear-gradient(135deg, #1A2942 0%, #0A1628 100%);
  border: 2px solid rgba(218, 41, 28, 0.3);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pack-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(218, 41, 28, 0.1) 0%, transparent 70%);
  animation: pulse 3s ease-in-out infinite;
}

.pack-card:hover {
  transform: scale(1.05);
  border-color: var(--psg-red);
  box-shadow: 0 0 30px rgba(218, 41, 28, 0.6);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}
```

#### Pack Rarity Indicators
```css
.rarity-common {
  border-color: #718096;
  box-shadow: 0 0 15px rgba(113, 128, 150, 0.3);
}

.rarity-rare {
  border-color: #3B82F6;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
}

.rarity-epic {
  border-color: #8B2844;
  box-shadow: 0 0 20px rgba(139, 40, 68, 0.5);
}

.rarity-legendary {
  border-color: #FFB800;
  box-shadow: 0 0 25px rgba(255, 184, 0, 0.6);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { box-shadow: 0 0 25px rgba(255, 184, 0, 0.6); }
  50% { box-shadow: 0 0 40px rgba(255, 184, 0, 0.9); }
}
```

### Badges & Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-primary {
  background: var(--psg-red);
  color: var(--psg-white);
}

.badge-secondary {
  background: rgba(0, 31, 91, 0.5);
  color: var(--psg-white);
  border: 1px solid rgba(0, 31, 91, 0.8);
}

.badge-success {
  background: rgba(4, 240, 106, 0.2);
  color: var(--success);
  border: 1px solid var(--success);
}
```

### Profile Avatar

```css
.avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  border: 3px solid var(--psg-red);
  box-shadow: var(--shadow-glow);
  object-fit: cover;
}

.avatar-sm {
  width: 40px;
  height: 40px;
}

.avatar-lg {
  width: 120px;
  height: 120px;
  border-width: 4px;
}
```

---

## Layout Grid

```css
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-8);
}

.grid-player-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-6);
}

.grid-leaderboard {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

.grid-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
}
```

---

## Animations

### Entrance Animations

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.4s ease-out;
}
```

### Hover Effects

```css
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-2xl);
}

.hover-glow {
  transition: box-shadow 0.3s ease;
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(218, 41, 28, 0.5);
}
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

---

## Icons & Assets

### Logo Usage
- PSG logo should always be visible in the top left corner
- Minimum size: 40px x 40px
- Always maintain aspect ratio
- Use white version on dark backgrounds

### Icon Set
Recommended icon library: **Lucide Icons** or **Heroicons**
- Stroke width: 2px
- Size variants: 16px, 20px, 24px, 32px
- Color: Use `--text-primary` or `--psg-red` for emphasis

---

## Accessibility

### Color Contrast
- Text on dark backgrounds: Minimum contrast ratio 7:1
- Interactive elements: Minimum 4.5:1
- Large text (18px+): Minimum 3:1

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--psg-red);
  outline-offset: 2px;
}
```

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Usage Examples

### Player Profile Header
```html
<div class="player-profile">
  <div class="player-avatar">
    <img src="player.jpg" alt="Warren Zaïre-Emery" class="avatar avatar-lg">
  </div>
  <h1 class="player-name">WARREN ZAÏRE-EMERY</h1>
  <p class="player-position">Milieu de terrain</p>
  
  <div class="tis-score">
    <div class="tis-label">TIS</div>
    <div class="tis-value">8.00</div>
    <div class="tis-cta">
      VOIR PLUS <span>→</span>
    </div>
  </div>
</div>
```

### Challenge Card
```html
<div class="stat-card">
  <h3 class="challenge-title">Défi du jour</h3>
  <div class="challenge-progress">
    <div class="stat-bar-container">
      <div class="stat-bar" style="width: 65%"></div>
      <span class="stat-label">Passes réussies</span>
      <span class="stat-value">65/100</span>
    </div>
  </div>
  <button class="btn-primary">Compléter le défi</button>
</div>
```

---

## Design Principles

1. **Football First**: Every design decision should reinforce the football/PSG theme
2. **Data Visualization**: Make stats engaging and easy to understand through visual hierarchy
3. **Gamification**: Incorporate FUT-like mechanics (packs, cards, rewards)
4. **Performance**: Prioritize smooth animations and fast load times
5. **Mobile-First**: Ensure all components work perfectly on mobile devices
6. **Accessibility**: Make the experience enjoyable for all users

---