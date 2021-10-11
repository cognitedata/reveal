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
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['state'] },
    ],
  },
};
