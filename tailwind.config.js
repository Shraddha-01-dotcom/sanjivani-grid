/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a0f1a',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        urgent: '#f97316',
        critical: '#ef4444',
        routine: '#22c55e',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'route-dash': 'dash 1.5s linear infinite',
      },
      keyframes: {
        dash: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}
