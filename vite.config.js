import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        option_1: resolve(__dirname, 'option_1.html'),
        option_2: resolve(__dirname, 'option_2.html'),
      },
    },
  },
})
