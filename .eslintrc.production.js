module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: ['plugin:prettier/recommended'],
  rules: {
    'no-console': ['error'],
    'no-nested-ternary': 'error',

    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'react/jsx-props-no-spreading': ['off'],
    'react/static-property-placement': ['off'],
    'react/state-in-constructor': ['off'],

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],

    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
};
