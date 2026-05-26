import { defineConfig } from '@tanstack/start/config'

export default defineConfig({
  server: {
    preset: 'vercel', // Isso fará o Nitro (motor do TanStack) criar as funções da Vercel
  },
})