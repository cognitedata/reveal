module.exports = {
  extends: ['airbnb', 'prettier', 'prettier/react', 'plugin:jest/recommended'],
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
    'react/destructuring-assignment': 0,
    'react/jsx-filename-extension': [0],
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'prettier/prettier': ['error', { singleQuote: true, trailingComma: 'es5' }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
      },
    ],
    // Disable this because it does not yet handle custom proptypes.
    // See: https://github.com/yannickcr/eslint-plugin-react/issues/1389
    'react/no-typos': ['off'],
  },
};
