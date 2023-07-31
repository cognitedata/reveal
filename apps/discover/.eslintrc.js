module.exports = {
  extends: './.eslintrc.production.js',
  ignorePatterns: ['.eslintrc.js', '.eslintrc.production.js'],
  rules: {
    // We can relax some settings here for nicer development experience; warnings will crash in CI/pre push
    '@typescript-eslint/ban-ts-comment': ['warn'],
    'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
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
