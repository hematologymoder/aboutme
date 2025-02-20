/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // Customize your pastel colors here
      colors: {
        pastelPink: '#FCE4EC',
        pastelBlue: '#DCE9F9',
        pastelPurple: '#E1D5F2',
        pastelGreen: '#E0F2F1',
        pastelYellow: '#FEF9E7'
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

