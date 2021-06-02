module.exports = {
  extends: ['@cognite'],
  plugins: ['@cognite'],
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
  rules: {
    '@cognite/no-sdk-submodule-imports': 'error',

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],

    'lodash/prefer-lodash-method': ['off'],
    'lodash/prop-shorthand': ['off'],
    'lodash/prefer-constant': ['off'],
    'lodash/prefer-is-nil': ['off'],
    'lodash/prefer-get': ['off'],

    '@typescript-eslint/no-explicit-any': ['error'],
  },
};
