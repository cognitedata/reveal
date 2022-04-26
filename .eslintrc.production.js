module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['./tsconfig.eslint.json'],
      tsconfigRootDir: __dirname,
    },
    plugins: ['@typescript-eslint', 'react-hooks'],
    extends: ['@cognite'],
    rules: {
      'no-console': ['error'],
      'no-nested-ternary': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-shadow': 'off', // Reports incorrect errors
  
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
      '@typescript-eslint/no-shadow': ['error'],
  
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'es5',
          arrowParens: 'avoid',
          endOfLine: 'auto',
        },
      ],
  
      // Silence new rules for now, we can come back to it later
      '@cognite/no-number-z-index': 'off',
      'react/require-default-props': ['off'],
      'react/prop-types': ['off'],
      'react/no-unused-prop-types': ['off'],
    },
    ignorePatterns: ['.eslintrc.production.js'],
  };
  