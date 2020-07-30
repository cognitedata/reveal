module.exports = {
  extends: [
    '@cognite',
    'plugin:jest-dom/recommended',
    'plugin:testing-library/react',
  ],
  plugins: ['@cognite', 'jest-dom', 'testing-library'],
  rules: {
    '@cognite/forbid-styled-macro': 'error',
    '@cognite/no-number-z-index': 'error',
    '@cognite/no-sdk-submodule-imports': 'error',

    'react/jsx-props-no-spreading': ['off'],
    'react/static-property-placement': ['off'],
    'react/state-in-constructor': ['off'],

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],

    'lodash/prefer-lodash-method': ['off'],
    'lodash/prop-shorthand': ['off'],
    'lodash/prefer-constant': ['off'],
    'lodash/prefer-is-nil': ['off'],
    'lodash/prefer-get': ['off'],

    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': ['error'],
  },
};
