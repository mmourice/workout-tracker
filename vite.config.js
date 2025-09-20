import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If your repo name changes, update the string below.
export default defineConfig({
  plugins: [react()],
  base: '/workout-tracker/',
})
