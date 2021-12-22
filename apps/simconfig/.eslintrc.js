module.exports = {
  extends: './.eslintrc.production.js',
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'prettier/prettier': 'off',
        // Optionally disable certain slow rules when developing:
        // '@typescript-eslint/no-unsafe-assignment': 'off',
        // '@typescript-eslint/naming-convention': 'off',
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@cognite/no-unissued-todos': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // Stricter rules to indicate best practices during development
    '@typescript-eslint/no-explicit-any': [
      'warn',
      {
        fixToUnknown: true,
      },
    ],
  },
};
