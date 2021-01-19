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
    '@cognite/no-sdk-submodule-imports': 'error',

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
