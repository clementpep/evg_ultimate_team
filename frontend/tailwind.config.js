/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PSG Primary Colors
        psg: {
          blue: '#004170',      // Main PSG blue
          red: '#DA291C',       // PSG accent red
          navy: '#001E41',      // Dark backgrounds
        },
        // FIFA Colors
        fifa: {
          gold: '#D4AF37',      // Ultimate packs, premium elements
          silver: '#C0C0C0',    // Silver packs
          bronze: '#CD7F32',    // Bronze packs
          green: '#00FF41',     // Success, positive actions
          dark: '#0A0A0A',      // Backgrounds, cards
        },
      },
      fontFamily: {
        heading: ['Bebas Neue', 'Oswald', 'sans-serif'],
        body: ['Inter', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-psg': 'linear-gradient(135deg, #001E41 0%, #004170 100%)',
        'gradient-fifa': 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.5)',
        'glow-silver': '0 0 20px rgba(192, 192, 192, 0.5)',
        'glow-bronze': '0 0 20px rgba(205, 127, 50, 0.5)',
        'glow-green': '0 0 20px rgba(0, 255, 65, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
