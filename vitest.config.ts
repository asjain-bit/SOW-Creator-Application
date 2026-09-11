import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      exclude: [
        '**/*.stories.*',
        '**/*.config.*',
        'src/test/**',
        '**/types/**',
        'src/app/**',
        '**/*.types.ts',
        '**/index.ts',
        'src/components/ai-elements/**',
        'src/components/ui/**',
        '.storybook/**',
        'e2e/**',
        '.next/**',
        'storybook-static/**',
        '*.mjs',
        '*.js',
        '*.d.ts',
      ],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
