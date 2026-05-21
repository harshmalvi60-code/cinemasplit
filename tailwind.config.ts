import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#06070a',
        'bg-card': '#0d0f14',
        'bg-elevated': '#141821',
        ink: '#f5f5f7',
        'ink-soft': '#c8c9cf',
        'ink-muted': '#8a8d96',
        'ink-faint': '#4d505a',
        line: 'rgba(255, 255, 255, 0.08)',
        'line-strong': 'rgba(255, 255, 255, 0.18)',
        accent: '#13edff',
        'accent-soft': 'rgba(19, 237, 255, 0.18)',
        'accent-glow': 'rgba(19, 237, 255, 0.35)',
        'accent-dim': '#0aa4b8',
      },
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backdropBlur: {
        nav: '14px',
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      animation: {
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'drift': 'drift 50s ease-in-out infinite',
        'fade-up': 'fade-up 0.7s ease both',
        'fade-in': 'fade-in 0.5s ease both',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.55', transform: 'scale(0.8)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':      { transform: 'translate(20vw, 14vh) scale(1.08)' },
          '66%':      { transform: 'translate(-10vw, 28vh) scale(0.95)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
