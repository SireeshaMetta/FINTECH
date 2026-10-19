/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#0B0F19',
          light: '#F8FAFC',
        },
        card: {
          dark: 'rgba(17, 24, 39, 0.7)',
          light: 'rgba(255, 255, 255, 0.8)',
        },
        primary: {
          DEFAULT: '#6366F1', // Indigo
          hover: '#4F46E5',
          light: '#EEF2FF',
          dark: '#312E81',
        },
        secondary: {
          DEFAULT: '#10B981', // Emerald
          hover: '#059669',
        },
        danger: {
          DEFAULT: '#EF4444', // Red
          hover: '#DC2626',
        },
        warning: {
          DEFAULT: '#F59E0B', // Amber
        },
        border: {
          dark: 'rgba(255, 255, 255, 0.08)',
          light: 'rgba(0, 0, 0, 0.08)',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
    },
  },
  plugins: [],
}
