module.exports = {
  extends: [
    'prettier',
    'plugin:jest/recommended',
    'plugin:jest-dom/recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:lodash/recommended',
  ],
  plugins: [
    'prettier',
    'jest',
    'jest-dom',
    'import',
    '@cognite',
    '@typescript-eslint',
    'lodash',
  ],
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
      files: ['**/*.ts?(x)', '**/*.js'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json',
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
        'default-param-last': 'off',
        '@typescript-eslint/default-param-last': ['error'],

        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          2,
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            // ignoreArgsIfArgsAfterAreUsed: true, <--- for reference - allows for (event, variable: x)
          },
        ],
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'warn',

        'no-restricted-exports': 'off',
      },
    },
  ],
  rules: {
    '@cognite/no-number-z-index': 'error',
    '@cognite/no-sdk-submodule-imports': 'error',
    '@cognite/no-unissued-todos': 'warn',
    '@cognite/require-t-function': 'error',
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'prettier/prettier': ['error', { singleQuote: true, trailingComma: 'es5' }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],
    'jest/no-standalone-expect': ['off'],

    'lodash/prefer-lodash-method': ['off'],
    'lodash/prefer-lodash-typecheck': ['off'],
    'lodash/prop-shorthand': ['off'],
    'lodash/prefer-constant': ['off'],
    'lodash/prefer-is-nil': ['off'],
    'lodash/prefer-get': ['off'],
    'lodash/prefer-includes': ['off'],
    'lodash/prefer-startswith': ['off'],

    '@typescript-eslint/explicit-function-return-type': [
      'off',
      {
        allowExpressions: true,
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': ['off'],
    'default-param-last': 'off',
    '@typescript-eslint/default-param-last': ['error'],

    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': ['error'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['off'],

    'import/no-anonymous-default-export': ['off'],
    'import/order': [
      1,
      {
        'newlines-between': 'always',
        groups: [
          'builtin',
          ['external', 'internal'],
          'parent',
          ['sibling', 'index'],
        ],
      },
    ],
    'no-shadow': 0,
    'max-classes-per-file': ['off'],
    'lines-between-class-members': ['off'],
    'class-methods-use-this': ['off'],
  },
};
