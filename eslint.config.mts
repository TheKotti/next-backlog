import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'
// @ts-expect-error no types for this path
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
    ...nextVitals,
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        plugins: { js },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.browser },
    },
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
    ]),
    {
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-var': 'warn',
        },
    },
])
