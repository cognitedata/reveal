module.exports = {
  extends: './.eslintrc.production.js',
  ignorePatterns: ['.eslintrc.js', '.eslintrc.production.js'],
  // We can relax some settings here for nicer development experience; warnings will crash in CI/pre push
  rules: {
    '@typescript-eslint/ban-ts-comment': ['warn'],
    'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    '@typescript-eslint/no-unused-vars-experimental': [
      'warn',
      {
        ignoredNamesRegex: '^_',
      },
    ],

    // In order to follow the top level .eslintrc setup the rules below
    // should be enabled and corresponding eslint errors should be addressed.
    // This can be done gradually in the later PRs
    'react-hooks/rules-of-hooks': ['off'],
    'import/no-anonymous-default-export': ['off'],
    'unicode-bom': ['off'],
  },
  overrides: [
    {
      files: ['cypress/**'],
      rules: {
        'testing-library/prefer-screen-queries': 'off',
        'testing-library/await-async-query': 'off',
        'testing-library/await-async-utils': 'off',
        '@typescript-eslint/no-namespace': 'off',
      },
    },
  ],
};
