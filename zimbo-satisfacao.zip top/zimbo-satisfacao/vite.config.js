import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/zimbo-satisfacao/',
  plugins: [react()],
})
