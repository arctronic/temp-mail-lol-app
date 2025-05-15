/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1', // Indigo color
        secondary: '#4f46e5',
        accent: '#818cf8',
        background: {
          light: '#ffffff',
          dark: '#121212',
        },
        text: {
          light: '#121212',
          dark: '#ffffff',
        },
        border: {
          light: '#e5e7eb',
          dark: '#303030',
        },
      },
    },
  },
  plugins: [],
}

