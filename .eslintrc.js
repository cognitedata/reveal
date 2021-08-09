module.exports = {
  extends: './.eslintrc.production.js',
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  rules: {
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        trailingComma: 'es5',
        arrowParens: 'always',
        endOfLine: 'auto',
      },
    ],
    'no-console': 'off',
    'no-debugger': 'off',
    '@cognite/no-unissued-todos': [
      'warn',
      { issuePattern: '\\(((DEMO)-[0-9]+)\\)' },
    ],
    '@typescript-eslint/no-unused-vars-experimental': [
      'warn',
      { ignoredNamesRegex: '^_' },
    ],
  },
};
