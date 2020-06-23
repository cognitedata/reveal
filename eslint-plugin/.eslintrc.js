module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['@cognite', 'plugin:eslint-plugin/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['eslint-plugin'],
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
  },
};
