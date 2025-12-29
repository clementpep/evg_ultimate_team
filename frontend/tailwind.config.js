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
          blue: '#004170',
          red: '#DA291C',
          navy: '#001F5B',
          white: '#FFFFFF',
        },
        // Background Colors
        bg: {
          primary: '#0A1628',
          secondary: '#152238',
          card: '#1A2942',
          cardHover: '#223A5E',
        },
        // FIFA Colors
        fifa: {
          gold: '#D4AF37',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
          green: '#00FF41',
        },
        // Text Colors
        text: {
          primary: '#FFFFFF',
          secondary: '#A0AEC0',
          tertiary: '#718096',
          muted: '#4A5568',
        },
      },
      fontFamily: {
        display: ['Montserrat', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        numbers: ['Rajdhani', 'Roboto Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-psg': 'linear-gradient(135deg, #0A1628 0%, #152238 100%)',
        'gradient-fifa': 'linear-gradient(135deg, #1A2942 0%, #0A1628 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(218, 41, 28, 0.4)',
        'glow-blue': '0 0 20px rgba(0, 31, 91, 0.5)',
        'glow-gold': '0 0 25px rgba(212, 175, 55, 0.6)',
        'glow-silver': '0 0 20px rgba(192, 192, 192, 0.5)',
        'glow-bronze': '0 0 20px rgba(205, 127, 50, 0.5)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.7' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s ease-in-out infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
