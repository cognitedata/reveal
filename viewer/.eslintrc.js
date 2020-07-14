/*!
 * Copyright 2020 Cognite AS
 */

module.exports = {
  root: true,
  env: {
    browser: true
  },
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },
  plugins: ['header', '@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/recommended',

    // disables ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'prettier/@typescript-eslint',

    // This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    'plugin:prettier/recommended'
  ],
  rules: {
    'header/header': [
      'error',
      'block',
      [
        {
          pattern: '(Copyright \\d{4}|istanbul ignore)',
          template: `!\n * Copyright ${new Date().getFullYear()} Cognite AS\n `
        }
      ]
    ],
    'no-return-await': 'error',
    'no-empty': 'off',
    'object-literal-sort-keys': 'off',
    'default-case': 'error',
    'no-console': ['warn', { allow: ['warn', 'error', 'assert'] }],

    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/prefer-for-of': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off',

    // TODO: maksnester 26-06-2020 we need to fix our codebase to play well with these rules
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // to be discussed
    '@typescript-eslint/no-inferrable-types': 'off'
  },
  overrides: [
    {
      files: ['*.test.ts'],
      rules: {
        // complains when you do expect(mockObj.mockFn).toBeCalled() in tests
        '@typescript-eslint/unbound-method': 'off'
      }
    }
  ]
};
