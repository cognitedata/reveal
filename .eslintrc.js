module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  extends: ['@cognite/eslint-config/apps'],
  plugins: ['@cognite'],
  ignorePatterns: ['.eslintrc.js'],
};
