module.exports = {
  extends: './.eslintrc.production.js',
  ignorePatterns: ['.eslintrc.js', '.eslintrc.production.js'],
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  rules: {
    '@typescript-eslint/ban-ts-comment': ['warn'],
    // Errors that appeared following eslint upgrade
    'react/no-unstable-nested-components': ['off'],
    'react/jsx-no-constructed-context-values': ['off'],
    'no-unsafe-optional-chaining': ['off'],
  },
};
