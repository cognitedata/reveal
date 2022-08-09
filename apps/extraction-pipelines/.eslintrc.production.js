module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'lodash',
    'react-hooks',
    'react',
    'testcafe',
    'testing-library',
  ],
  extends: [
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:testing-library/react',
    'plugin:lodash/recommended',
    'plugin:testcafe/recommended',
  ],
  rules: {
    'no-console': ['error'],
    'no-nested-ternary': 'error',

    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'react/jsx-props-no-spreading': ['off'],
    'react/static-property-placement': ['off'],
    'react/state-in-constructor': ['off'],

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],

    'max-classes-per-file': ['off'],
    'lines-between-class-members': ['off'],
    'class-methods-use-this': ['off'],
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'lodash/prefer-lodash-method': ['off'],
    'lodash/prop-shorthand': ['off'],
    'lodash/prefer-constant': ['off'],
    'lodash/prefer-is-nil': ['off'],
    'lodash/prefer-get': ['off'],
    "jsx-a11y/label-has-associated-control": "off",
    "jsx-a11y/label-has-for": "off",
    "react/jsx-key": "off",
    "react/jsx-uses-react": 1,

    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
};

