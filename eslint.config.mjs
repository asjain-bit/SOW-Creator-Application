import { FlatCompat } from '@eslint/eslintrc'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'storybook-static/**',
      'coverage/**',
      'next-env.d.ts',
      'src/components/ai-elements/**',
      'src/components/ui/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      '@next/next/no-img-element': 'off',
    },
  },
]

export default eslintConfig
