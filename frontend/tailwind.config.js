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
        health: {
          lightBg: '#F8FAFC',
          darkBg: '#0F172A',
          primary: '#2563EB',
          accent: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          lightCard: '#FFFFFF',
          darkCard: '#1E293B',
          darkText: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
