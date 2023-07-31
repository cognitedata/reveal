module.exports = {
  extends: './.eslintrc.production.js',
  ignorePatterns: ['.eslintrc.js', '.eslintrc.production.js'],
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  rules: {
    '@typescript-eslint/ban-ts-comment': ['off'],
    'no-console': ['off'],
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@cognite/no-number-z-index': ['warn'],
    yoda: ['off'],
  },
};
