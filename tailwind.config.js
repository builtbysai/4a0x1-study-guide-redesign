/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Newsreader"', 'Georgia', 'serif'],
        body:    ['"Barlow"', 'system-ui', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        surface: 'rgb(var(--surface) / <alpha-value>)',
        raised:  'rgb(var(--surface-raised) / <alpha-value>)',
        appbg:   'rgb(var(--bg) / <alpha-value>)',
        subtle:  'rgb(var(--bg-subtle) / <alpha-value>)',
        border:  'rgb(var(--border) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          deep:    'rgb(var(--accent-deep) / <alpha-value>)',
        },
        correct: 'rgb(var(--correct) / <alpha-value>)',
        wrong:   'rgb(var(--wrong) / <alpha-value>)',
      },
      borderRadius: {
        card: '10px',
        ctl:  '6px',
      },
      animation: {
        'slide-up':   'slideUp 0.3s ease-out',
        'fade-in':    'fadeIn 0.2s ease-out',
        'bounce-in':  'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(1)',   opacity: '0.4' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
