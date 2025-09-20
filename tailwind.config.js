/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#F16202',
          secondary: '#E0E0E0',
          text: '#FFFFFF',
          accent: '#FF6600',
          card: '#111111',
          border: '#2A2A2A',
          input: '#141414',
          bgTop: '#000000',
          bgBottom: '#1E1729'
        }
      },
      borderRadius: {
        button: '35px',
        card: '15px',
        chip: '5px'
      },
      fontFamily: {
        mont: ['Montserrat', 'ui-sans-serif', 'system-ui']
      },
      fontSize: {
        h1: ['36px', { lineHeight: '1.1' }],
        h2: ['26px', { lineHeight: '1.2' }],
        body: ['12px', { lineHeight: '1.5' }],
        label: ['12px', { lineHeight: '1.2' }]
      }
    },
  },
  plugins: [],
}
