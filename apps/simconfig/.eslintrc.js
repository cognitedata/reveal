module.exports = {
  extends: './.eslintrc.production.js',
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  rules: {
    'prettier/prettier': 'off',
    '@cognite/no-unissued-todos': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // Optionally disable certain slow rules when developing:
    // '@typescript-eslint/no-unsafe-assignment': 'off',
    // '@typescript-eslint/naming-convention': 'off',
  },
};
