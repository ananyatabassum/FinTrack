/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: {
          light: '#F8FAFC',
          dark: '#0B0F19',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#111827',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'card-hover': '0 8px 24px -6px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
