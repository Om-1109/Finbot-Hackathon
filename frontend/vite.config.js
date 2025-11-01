import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This sets up an alias. '@' will now point to your 'src' folder.
      '@': path.resolve(__dirname, './src'),
    },
  },
})
