import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  // ─── Config principal da aplicação (src/) ──────────────────────────
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Regra nova do react-hooks (ESLint 10) — controversa, muitos desativam
      'react-hooks/set-state-in-effect': 'off',
      // Permite context providers exportarem hooks junto com componentes
      'react-refresh/only-export-components': 'off',
    },
  },

  // ─── Config específica pros testes Cypress ──────────────────────────
  // Adiciona as globais `cy`, `Cypress`, `describe`, `it`, `beforeEach` etc.
  {
    files: ['cypress/**/*.{js,cy.js}'],
    languageOptions: {
      globals: {
        ...globals.mocha,   // describe, it, before, after, beforeEach, afterEach
        cy: 'readonly',
        Cypress: 'readonly',
        expect: 'readonly',
        assert: 'readonly',
      },
    },
  },
])