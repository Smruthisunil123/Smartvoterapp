import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  server: {
    host: "0.0.0.0", // 👈 Allows access from IDX
    port: 5173,      // 👈 Ensure port matches
    strictPort: true, // 👈 Ensures Vite doesn't change the port
  },
  preview: {
    host: "0.0.0.0",  // 👈 Needed for preview mode
    port: 5173,
  }
})
