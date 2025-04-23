/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Using a blue closer to the Figma screenshot (like blue-600)
        'brand-blue': {
          light: '#60a5fa', // blue-400
          DEFAULT: '#2563eb', // blue-600
          dark: '#1d4ed8',  // blue-700
        },
        // Keep the teal for potential alternative use or if needed elsewhere
        'brand-teal': {
          light: '#5eead4',
          DEFAULT: '#14b8a6',
          dark: '#0f766e',
        },
        'brand-lost': '#f87171', // red-400
        'brand-found': '#4ade80', // green-400
        'brand-bg': '#f8fafc',    // Use a slightly off-white like slate-50 or gray-50
      },
      fontFamily: {
        // sans: ['Inter', 'sans-serif'], // Example if using a specific font
      }
    },
  },
  plugins: [],
}