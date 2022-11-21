module.exports = {
  extends: './.eslintrc.production.js',
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  rules: {
    'no-console': ['warn'],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: ['accumulator', 'state'],
      },
    ],
  },
  ignorePatterns: ['.eslintrc.js', 'config-overrides.js'],
};
