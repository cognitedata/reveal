module.exports = {
  extends: './.eslintrc.production.js',
  ignorePatterns: ['.eslintrc.js', '.eslintrc.production.js'],
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  rules: {
    'prettier/prettier': ['warn'],
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@cognite/no-unissued-todos': ['warn'],
    // Errors that appeared following eslint upgrade
    'react/no-unstable-nested-components': ['off'],
    'jsx-a11y/label-has-associated-control': ['off'],
    'react-hooks/rules-of-hooks': ['off'],
    'react/jsx-no-constructed-context-values': ['off'],
  },
};
