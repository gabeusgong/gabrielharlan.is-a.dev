import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the site works both at a sub-path
  // (gabeusgong.github.io/gabrielharlan.is-a.dev/) and at a custom root domain.
  base: './',
  plugins: [react()],
})
