import importPlugin from 'eslint-plugin-import';

export default [
  {
    files: ['**/*.js'],
    plugins: {
      import: importPlugin
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      indent: ['error', 2],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',     // Node "fs", "path", etc.
            'external',    // npm modules
            'internal',    // paths like "@foo/bar"
            ['parent', 'sibling', 'index'],  // local files
            'type',        // TypeScript `import type`
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
