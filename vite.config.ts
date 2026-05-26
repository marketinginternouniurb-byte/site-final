import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { TanStackStartVite } from '@tanstack/start/vite'

export default defineConfig({
  plugins: [
    TanStackStartVite(),
    tsconfigPaths(),
    tailwindcss(),
  ],
})
