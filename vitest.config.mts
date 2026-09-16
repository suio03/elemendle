import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('.', import.meta.url))
        }
    },
    test: {
        server: { deps: { inline: ['next-intl'] } },
        environment: 'jsdom',
        clearMocks: true
    }
})
