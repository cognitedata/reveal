module.exports = {
  extends: ['airbnb', 'prettier', 'prettier/react', 'plugin:jest/recommended'],
  plugins: ['react', 'prettier', 'jest', 'react-hooks', 'import', '@cognite'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  globals: {
    DEBUG: false,
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: '/tsconfig.json',
      },
      plugins: ['@typescript-eslint'],
      // If adding a typescript-eslint version of an existing ESLint rule,
      // make sure to disable the ESLint rule here.
      rules: {
        // Cognite specific overrides to ts recommended
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/no-var-requires': 'off',

        // End Cognite specifics

        // TypeScript's `noFallthroughCasesInSwitch` option is more robust (#6906)
        'default-case': 'off',
        // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/291)
        'no-dupe-class-members': 'off',
        // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/477)
        'no-undef': 'off',

        // Add TypeScript specific rules (and turn off ESLint equivalents)
        'no-array-constructor': 'off',
        '@typescript-eslint/no-array-constructor': 'warn',
        '@typescript-eslint/no-namespace': 'error',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars-experimental': [
          2,
          {
            ignoredNamesRegex: '^_',
            // ignoreArgsIfArgsAfterAreUsed: true, <--- for reference - allows for (event, variable: x)
          },
        ],
        'no-unused-vars': 'off',
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'warn',
      },
    },
  ],
  rules: {
    '@cognite/no-number-z-index': 'error',
    '@cognite/no-sdk-submodule-imports': 'error',
    '@cognite/no-unissued-todos': 'warn',
    '@cognite/require-t-function': 'error',
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
