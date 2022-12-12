module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
    extends: './.eslintrc.production.js',
    // We can relax some settings here for nicer development experience; warnings will crash in CI
    rules: {
      'no-console': ['warn'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
    ignorePatterns: ['.eslintrc.js','.eslintrc.production.js'],
  };
  