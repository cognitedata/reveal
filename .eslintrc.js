module.exports = {
  extends: './.eslintrc.production.js',
  rules: {
    'no-console': ['warn'],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
};
