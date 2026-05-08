import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#09090D',
          surface: '#0F0F15',
          card: '#13131A',
          elevated: '#18181F',
        },
        border: {
          dim: '#1C1C26',
          DEFAULT: '#22222E',
          bright: '#32324A',
        },
        honey: {
          DEFAULT: '#C8961F',
          bright: '#E8B84B',
          dim: '#7A5A10',
          bg: '#1A1208',
        },
        jelly: {
          DEFAULT: '#D4720B',
          bright: '#F59E0B',
          dim: '#7A400A',
          bg: '#1A0E04',
        },
        propolis: {
          DEFAULT: '#B83A2E',
          bright: '#E74C3C',
          dim: '#6E2018',
          bg: '#1A0806',
        },
        base: {
          DEFAULT: '#4A80D4',
          bright: '#60A5FA',
          dim: '#1E3E6E',
          bg: '#070F1A',
        },
        cooked: {
          DEFAULT: '#8B6CD8',
          bright: '#A78BFA',
          dim: '#3E2878',
          bg: '#0D0A1A',
        },
        seal: {
          DEFAULT: '#9B7A1A',
          bright: '#C4A231',
          dim: '#5A4510',
        },
        critical: {
          DEFAULT: '#DC2626',
          bright: '#EF4444',
          bg: '#1A0606',
        },
        pass: {
          DEFAULT: '#16A34A',
          bright: '#22C55E',
          bg: '#061209',
        },
      },
      fontFamily: {
        display: ['"Libre Baskerville"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', '"Fira Code"', 'monospace'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
