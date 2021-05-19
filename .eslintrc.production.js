module.exports = {
  extends: [
    '@cognite',
    'plugin:@cognite/all',
    'plugin:testing-library/react',
    'plugin:lodash/recommended',
    'plugin:testcafe/recommended',
  ],
  plugins: ['@cognite', 'testing-library', 'lodash', 'testcafe'],
  rules: {
    '@cognite/no-unissued-todos': [
      'error',
      { issuePattern: '\\(((DTC|CM)-[0-9]+)\\)' },
    ],

    'max-classes-per-file': ['off'],
    'lines-between-class-members': ['off'],
    'class-methods-use-this': ['off'],

    'react/jsx-props-no-spreading': ['off'],
    'react/static-property-placement': ['off'],
    'react/state-in-constructor': ['off'],
    'react/require-default-props': ['off'],
    'react/react-in-jsx-scope': ['off'],

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],

    'lodash/prefer-lodash-method': ['off'],
    'lodash/prop-shorthand': ['off'],
    'lodash/prefer-constant': ['off'],
    'lodash/prefer-is-nil': ['off'],
    'lodash/prefer-get': ['off'],

    '@typescript-eslint/no-unused-vars': ['off'],
    'react/prop-types': ['off'],
    'no-unused-expressions': ['off'],
    'typescript-eslint/no-unused-vars': ['off'],
    'import/order': ['warn'],
  },
};
