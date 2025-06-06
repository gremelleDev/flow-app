import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // We are adding this 'css' section to explicitly
  // tell Vite to use PostCSS and Tailwind.
  css: {
    postcss: './postcss.config.js',
  },
})