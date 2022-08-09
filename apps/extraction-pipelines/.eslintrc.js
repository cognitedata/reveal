module.exports = {
  extends: './.eslintrc.production.js',
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  rules: {
    'react/prop-types': 'off',
    'no-console': ['warn'],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    "jsx-a11y/label-has-associated-control": "off",
    "jsx-a11y/label-has-for": "off",
    "react/jsx-key": "off"
  },
};
