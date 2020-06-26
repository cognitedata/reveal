/*!
 * Copyright 2020 Cognite AS
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },
  plugins: ['header'],
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
          pattern: 'Copyright \\d{4}',
          template: `!\n * Copyright ${new Date().getFullYear()} Cognite AS\n `
        }
      ]
    ],
    'no-return-await': 'error',
    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/prefer-for-of': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
