import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Project uses `any` widely for API payloads; fixing hundreds of sites is low ROI.
      // TypeScript `strict` still applies; turn back to 'warn' when tightening types.
      '@typescript-eslint/no-explicit-any': 'off',
      // Native <img> is intentional (SafeImage, remote CMS URLs, pre-upload previews).
      '@next/next/no-img-element': 'off',
      // Apostrophes and quotes in marketing/auth copy are fine in JSX text.
      'react/no-unescaped-entities': 'off',
      // Too strict for common patterns (sync state reset when props change, cache priming).
      'react-hooks/set-state-in-effect': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'off',
      // Load-on-mount + loadX() patterns omit deps intentionally across admin/dashboard.
      'react-hooks/exhaustive-deps': 'off',
      'prefer-const': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
    },
  },
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
    'cypress/**',
  ]),
])
