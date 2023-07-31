const baseConfig = require('./base');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    'jest/no-mocks-import': ['off'],

    'naming-convention': 0,
  },
  overrides: [
    ...baseConfig.overrides,
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        '@typescript-eslint/prefer-interface': 0,
        '@typescript-eslint/explicit-function-return-type': [
          2,
          {
            allowExpressions: true,
          },
        ],
        '@typescript-eslint/no-use-before-define': [
          2,
          { functions: false, classes: false },
        ],
        // '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          2,
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
      },
    },
    {
      files: ['build/**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
