module.exports = {
  extends: ['airbnb', 'prettier', 'prettier/react'], // extending recommended config and config derived from eslint-config-prettier
  plugins: ['react', 'prettier', 'jest'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2016,
    sourceType: 'module',
  },
  env: {
    es6: true,
    jest: true,
    browser: true,
    node: true,
  },
  globals: {
    DEBUG: false,
  },
  rules: {
    'react/jsx-filename-extension': [0],
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'prettier/prettier': ['error', { singleQuote: true, trailingComma: 'es5' }],
  },
};
