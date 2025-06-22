import importPlugin from 'eslint-plugin-import';
import playwright from 'eslint-plugin-playwright';

export default [
  {
    files: ['**/*.js'],
    plugins: {
      import: importPlugin,
      playwright
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...playwright.configs.recommended.rules,
      'playwright/no-conditional-in-test': 'off',
      'no-empty-functions': 'off',
      'no-empty': 'off',
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      indent: ['error', 2],
      'key-spacing': ['error', {
        beforeColon: false,
        afterColon: true,
        mode: 'strict'  // makes sure it’s enforced in all contexts
      }],
      'no-trailing-spaces': ['error', {
        skipBlankLines: false,
        ignoreComments: false
      }],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',     // Node "fs", "path", etc.
            'external',    // npm modules
            'internal',    // paths like "@foo/bar"
            ['parent', 'sibling', 'index']  // local files
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
          alphabetize: { order: 'asc', caseInsensitive: false },
          'newlines-between': 'always',
        },
      ]
    }
  }
];
