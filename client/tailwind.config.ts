/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // This covers app, components, etc.
  ],
  // ✅ ADDED SAFELIST HERE
  safelist: [
    {
     
      pattern: /bg-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|green|emerald|teal|cyan|blue|indigo|violet|purple|fuchsia|pink|rose)-(400|500|600)/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}