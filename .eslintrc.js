module.exports = {
  extends: './.eslintrc.production.js',
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  rules: {
    '@typescript-eslint/no-unused-vars-experimental': [
      'warn',
      {
        ignoredNamesRegex: '^_',
      },
    ],

    // hacks to get this working:
    'no-shadow': 0,
    'react/require-default-props': 0,
  },
};
