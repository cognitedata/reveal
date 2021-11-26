module.exports = {
  extends: './.eslintrc.production.js',
  ignorePatterns: ['.eslintrc.js', '.eslintrc.production.js'],
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  rules: {
    'prettier/prettier': ['warn'],
    '@typescript-eslint/no-unused-vars-experimental': ['warn'],
    '@cognite/no-unissued-todos': ['warn'],
  },
};
