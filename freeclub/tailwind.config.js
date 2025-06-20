/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#669bbc',
          600: '#4a7c95',
          700: '#2d5a87',
          800: '#1e3a8a',
          900: '#0f172a'
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#003049'
        },
        cream: {
          50: '#fefcf0',
          100: '#fdf0d5',
          200: '#fce7b6',
          300: '#fadb91',
          400: '#f7cc6c',
          500: '#f4bc47',
          600: '#e6a532',
          700: '#d18e1f',
          800: '#b8770f',
          900: '#9a6003'
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#c1121f',
          800: '#991b1b',
          900: '#780000'
        }
      }
    },
  },
  plugins: [],
};