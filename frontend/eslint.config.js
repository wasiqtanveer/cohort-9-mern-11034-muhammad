import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
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
  },
       {
    files: ['**/*.test.{js,jsx}', '**/__mocks__/**'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.jest },
    },
  },
    {
    files: ['jest.setup.js', 'jest.config.cjs', 'babel.config.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },

])
