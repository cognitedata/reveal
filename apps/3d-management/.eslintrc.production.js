module.exports = {
  extends: [
    '@cognite',
    'plugin:testing-library/dom',
    'plugin:testing-library/react',
    'plugin:lodash/recommended',
    'plugin:jest-dom/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@cognite', 'testing-library', 'lodash', 'jest-dom', 'react-hooks'],
  rules: {
    '@cognite/no-unissued-todos': [
      'off',
      { issuePattern: '\\(((DEMO)-[0-9]+)\\)' },
    ],

    'arrow-body-style': ['off'],
    'no-plusplus': ['off'],
    'max-classes-per-file': ['off'],
    'lines-between-class-members': ['off'],
    'class-methods-use-this': ['off'],
    'no-restricted-exports': ['off'],

    'react/jsx-props-no-spreading': ['off'],
    'react/static-property-placement': ['off'],
    'react/state-in-constructor': ['off'],
    'react/require-default-props': ['off'],
    'react/function-component-definition': ['off'],

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],

    'lodash/prefer-lodash-typecheck': ['off'],
    'lodash/prefer-lodash-method': ['off'],
    'lodash/prefer-noop': ['off'],
    'lodash/prop-shorthand': ['off'],
    'lodash/prefer-constant': ['off'],
    'lodash/prefer-is-nil': ['off'],
    'lodash/prefer-get': ['off'],

    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    'no-unused-expressions': ['off'],
    '@typescript-eslint/no-unused-expressions': ['error'],

    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],

    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['off'],

    '@typescript-eslint/no-unused-vars-experimental': ['off'],
    'testing-library/no-node-access': ['off'],

    // todo: fix these rules
    'no-loss-of-precision': ['off'],
  },
};
