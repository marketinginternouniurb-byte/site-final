import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/start/plugin/vite'

export default defineConfig({
  plugins: [
    tanstackStart(),
    tsconfigPaths(),
    tailwindcss(),
  ],
})
