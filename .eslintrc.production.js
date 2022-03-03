module.exports = {
  extends: [
    '@cognite',
    'plugin:testing-library/react',
    'plugin:lodash/recommended',
  ],
  // Workaround for incorrect preset from @cognite.
  // This holds the exact same code, but fixes tsconfigRootDir
  // so it does not point to the @cognite package.
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
  plugins: ['@cognite', 'testing-library', 'lodash'],
  rules: {
    '@cognite/no-unissued-todos': [
      'error',
      { issuePattern: '\\(((DEMO)-[0-9]+)\\)' },
    ],

    'arrow-body-style': ['off'],
    'no-shadow': ['off'],

    'max-classes-per-file': ['off'],
    'lines-between-class-members': ['off'],
    'class-methods-use-this': ['off'],

    'react/jsx-props-no-spreading': ['off'],
    'react/static-property-placement': ['off'],
    'react/state-in-constructor': ['off'],
    'react-hooks/exhaustive-deps': 'warn',

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],

    'lodash/prefer-lodash-method': ['off'],
    'lodash/prop-shorthand': ['off'],
    'lodash/prefer-constant': ['off'],
    'lodash/prefer-is-nil': ['off'],
    'lodash/prefer-get': ['off'],

    'react/prop-types': ['off'],
    'react/function-component-definition': ['off'],
    'react/require-default-props': ['off'],
    'react/jsx-no-useless-fragment': ['off'],
    'react/no-unstable-nested-components': ['off'],

    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-shadow': ['error'],
  },
};
