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
    // Those rules were breaking eslint_test bazel rule but working in VScode
    // The issue seems to be when importing local modules
    '@typescript-eslint/await-thenable': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-for-in-array': 'off',
    '@typescript-eslint/no-implied-eval': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/unbound-method': 'off',
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
