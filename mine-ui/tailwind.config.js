/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Professional SaaS Theme (Slate & Blue)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Sky blue
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Slate
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },

        // Backgrounds
        dark: {
          950: '#0f172a', // Main background (Dark Slate)
          900: '#1e293b', // Secondary / Cards
          850: '#334155', // Borders
          800: '#475569',
          700: '#64748b',
        },

        // Semantic colors (Standard)
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#3b82f6',

        // Legacy map for existing components
        mineAccent: '#0ea5e9',
        mineAccentLight: '#38bdf8',
        mineAccentDark: '#0284c7',
        mineBg: '#0f172a',
        mineBgSecondary: '#1e293b',
        panel: '#1e293b',
        panelLight: '#334155',
        panelBorder: '#334155',
        mineDanger: '#ef4444',
        mineWarning: '#f59e0b',
        mineSuccess: '#10b981',
        mineInfo: '#3b82f6',
        mineTextPrimary: '#f8fafc',
        mineTextSecondary: '#cbd5e1',
        mineTextMuted: '#94a3b8',
      },

      boxShadow: {
        // Simple shadows
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',

        // Legacy map
        'mine': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'mine-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'glow-cyan': 'none',
        'glow-danger': 'none',
      },

      backgroundImage: {
        'mine-gradient': 'none', // Removed gradient
        'panel-gradient': 'none', // Removed gradient
        'card-gradient': 'linear-gradient(to bottom right, #1e293b, #1e293b)', // Flat
      },

      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },

    },
  },
  plugins: [],
}

