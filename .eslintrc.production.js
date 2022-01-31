module.exports = {
  extends: [
    '@cognite',
    'plugin:testing-library/react',
    'plugin:lodash/recommended',
    'plugin:testcafe/recommended',
  ],
  plugins: ['@cognite', 'testing-library', 'lodash', 'testcafe'],
  rules: {
    '@cognite/no-unissued-todos': [
      'error',
      { issuePattern: '\\(((DEMO)-[0-9]+)\\)' },
    ],

    'max-classes-per-file': ['off'],
    'lines-between-class-members': ['off'],
    'class-methods-use-this': ['off'],
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: [
          'draft',
          'state',
          'prev',
          'accumulator',
        ],
      },
    ],

    'react/jsx-props-no-spreading': ['off'],
    'react/static-property-placement': ['off'],
    'react/state-in-constructor': ['off'],

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],

    'lodash/prefer-lodash-method': ['off'],
    'lodash/prop-shorthand': ['off'],
    'lodash/prefer-constant': ['off'],
    'lodash/prefer-includes': ['off'],
    'lodash/prefer-is-nil': ['off'],
    'lodash/prefer-get': ['off'],
    'lodash/prefer-noop': ['off'],
    'lodash/prefer-lodash-typecheck': ['off'],

    '@typescript-eslint/no-unused-vars': ['off'],
  },
};
