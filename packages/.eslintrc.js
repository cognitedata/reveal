module.exports = {
  extends: [
    '@cognite',
    'plugin:jest-dom/recommended',
    'plugin:testing-library/react',
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@cognite', 'jest-dom', 'testing-library'],
  rules: {
    '@cognite/no-number-z-index': 'error',
    '@cognite/no-sdk-submodule-imports': 'error',
    '@cognite/styled-macro': ['error', 'forbid'],

    'react/jsx-props-no-spreading': ['off'],
    'react/static-property-placement': ['off'],
    'react/state-in-constructor': ['off'],
    'react/prop-type': ['off'],
    'react/require-default-props': ['off'],

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],

    'lodash/prefer-lodash-method': ['off'],
    'lodash/prop-shorthand': ['off'],
    'lodash/prefer-constant': ['off'],
    'lodash/prefer-is-nil': ['off'],
    'lodash/prefer-get': ['off'],

    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars-experimental': [
      2,
      {
        ignoredNamesRegex: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': ['error'],
  },
};
