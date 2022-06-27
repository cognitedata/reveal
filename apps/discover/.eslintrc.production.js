const baseConfig = require('../../.eslintrc');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // We can extend apps rules below
    'arrow-body-style': 0,
    'no-underscore-dangle': 0,
    'no-console': ['error', { allow: ['warn', 'error'] }],

    '@cognite/no-number-z-index-inline-styling': 0,
    '@cognite/styled-macro': 'error',
    '@cognite/require-t-function': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          ['sibling', 'index'],
        ],
        pathGroups: [
          { group: 'external', pattern: 'react**', position: 'before' },
          { group: 'external', pattern: 'styled**', position: 'before' },
          { group: 'external', pattern: '@cognite/**', position: 'after' },
          { group: 'internal', pattern: '__mocks/**' },
          { group: 'internal', pattern: '__test-utils/**' },
          { group: 'internal', pattern: '_helpers/**' },
          { group: 'internal', pattern: 'components/**' },
          { group: 'internal', pattern: 'constants/**' },
          { group: 'internal', pattern: 'core/**' },
          { group: 'internal', pattern: 'hooks/**' },
          { group: 'internal', pattern: 'modules/**' },
          { group: 'internal', pattern: 'pages/**' },
          { group: 'internal', pattern: 'styles/**' },
          { group: 'internal', pattern: 'tenants/**' },
          { group: 'parent', pattern: '../**' },
          { group: 'sibling', pattern: './**' },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'react/jsx-no-useless-fragment': ['off'],
    'react/jsx-curly-newline': ['off'],
    'react/jsx-one-expression-per-line': ['off'],
    'react/jsx-wrap-multilines': ['off'],

    'testing-library/prefer-presence-queries': ['error'],
    'react/no-unstable-nested-components': ['error'],
    'react-hooks/rules-of-hooks': ['error'],
    //  Fixing elint issues in different PR's rule can uncomment when all issues are fixed
    // 'react-hooks/exhaustive-deps': ['error'],
    'testing-library/prefer-query-by-disappearance': ['error'],
    'import/no-anonymous-default-export': ['error'],
    'unicode-bom': ['error'],

    // This will be fixed in version v2.25.3 of eslint-plugin-import package
    'import/no-import-module-exports': ['off'],

    // In order to follow the top level .eslintrc setup the rules below
    // should be enabled and corresponding eslint errors should be addressed.
    // This can be done gradually in the later PRs:
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['state'] },
    ],
  },
};
