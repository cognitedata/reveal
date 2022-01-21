const baseConfig = require('../../.eslintrc');

module.exports = {
  ...baseConfig,
  ignorePatterns: ['!.eslintrc.js', '!.eslintrc.production.js', 'packages/**'],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  extends: [
    ...baseConfig.extends,
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/consistent-indexed-object-style': 'error',
    '@typescript-eslint/consistent-type-assertions': [
      'warn',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'never',
      },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-base-to-string': 'warn',
    '@typescript-eslint/no-confusing-void-expression': 'error',
    '@typescript-eslint/no-meaningless-void-operator': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/no-unnecessary-type-arguments': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-unnecessary-type-constraint': 'error',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    'no-underscore-dangle': 'off', // handled by naming conventions
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'default',
        format: ['strictCamelCase', 'StrictPascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'forbid',
        filter: {
          regex: '(UR[LI]|BHP|[Ss]idecar)',
          match: false,
        },
      },
      {
        selector: 'typeLike',
        format: ['StrictPascalCase'],
        filter: {
          regex: '(UR[LI]|BHP)',
          match: false,
        },
      },
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['StrictPascalCase'],
        prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
        filter: {
          regex: '(UR[LI]|BHP)',
          match: false,
        },
      },
      {
        selector: 'variable',
        modifiers: ['exported', 'const'],
        types: ['boolean'],
        format: ['UPPER_CASE'],
        prefix: ['IS_', 'SHOULD_', 'HAS_', 'CAN_', 'DID_', 'WILL_'],
        filter: {
          regex: '(UR[LI]|BHP)',
          match: false,
        },
      },
      {
        selector: 'variable',
        modifiers: ['global', 'const'],
        types: ['boolean'],
        format: ['UPPER_CASE'],
        prefix: ['IS_', 'SHOULD_', 'HAS_', 'CAN_', 'DID_', 'WILL_'],
        filter: {
          regex: '(UR[LI]|BHP)',
          match: false,
        },
      },
      {
        selector: ['function'],
        format: ['strictCamelCase', 'StrictPascalCase'],
        filter: {
          regex: '(UR[LI]|BHP)',
          match: false,
        },
      },
      {
        // https://github.com/airbnb/javascript/#naming--uppercase
        selector: 'variable',
        modifiers: ['global', 'const'],
        types: ['string', 'number', 'array'],
        format: ['UPPER_CASE', 'strictCamelCase'],
      },
      {
        // https://github.com/airbnb/javascript/#naming--uppercase
        selector: 'variable',
        modifiers: ['exported', 'const'],
        types: ['string', 'number', 'array'],
        format: ['UPPER_CASE'],
      },
      {
        selector: ['enum', 'enumMember'],
        format: ['StrictPascalCase'],
      },
      {
        selector: [
          'classProperty',
          'objectLiteralProperty',
          'typeProperty',
          'classMethod',
          'objectLiteralMethod',
          'typeMethod',
          'accessor',
          'enumMember',
        ],
        format: null,
        modifiers: ['requiresQuotes'],
      },
    ],
    '@typescript-eslint/non-nullable-type-assertion-style': 'error',
    '@typescript-eslint/prefer-includes': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
    '@typescript-eslint/promise-function-async': 'warn',
    '@typescript-eslint/restrict-plus-operands': 'warn',
    '@typescript-eslint/sort-type-union-intersection-members': 'warn',
    '@typescript-eslint/type-annotation-spacing': 'error',
    '@typescript-eslint/restrict-template-expressions': [
      'warn',
      {
        allowNumber: true,
        allowAny: true,
      },
    ],
    // '@typescript-eslint/prefer-readonly-parameter-types': [
    //   'warn',
    //   {
    //     ignoreInferredTypes: true,
    //     treatMethodsAsReadonly: true,
    //   },
    // ],
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    'no-return-await': 'off',
    '@typescript-eslint/return-await': 'error',

    'curly': ['error', 'all'],
    'no-void': [
      'error',
      {
        allowAsStatement: true,
      },
    ],
    'no-dupe-keys': 'warn',
    'arrow-body-style': ['error', 'as-needed'],
    'import/no-anonymous-default-export': 'warn',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'sort-imports': [
      'warn',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false,
      },
    ],
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['state'] },
    ],
    'multiline-comment-style': ['warn', 'separate-lines'],
    'prefer-arrow-callback': 'warn',
    'object-shorthand': ['warn', 'always'],
    'quote-props': ['warn', 'consistent-as-needed'],
    'quotes': ['off', 'single'],
    'no-shadow': 'off',

    'prettier/prettier': [
      'off',
      { singleQuote: true, trailingComma: 'es5', quoteProps: 'consistent' },
    ],
    'import/order': [
      'warn',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          ['sibling', 'index'],
          'object',
          'type',
        ],
        'pathGroups': [
          { group: 'external', pattern: 'react**', position: 'before' },
          { group: 'external', pattern: '@cognite/**', position: 'after' },
          { group: 'external', pattern: '@*/**', position: 'before' },
          {
            group: 'internal',
            pattern:
              '+(components|constants|core|hooks|modules|pages|providers|store|styles|tenants|utils)/**',
            position: 'after',
          },
          { group: 'parent', pattern: '../**' },
          { group: 'sibling', pattern: './**' },
        ],
        'pathGroupsExcludedImportTypes': ['react'],
        'newlines-between': 'always',
        'alphabetize': {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react/destructuring-assignment': ['warn', 'always'],
    'react/function-component-definition': [
      'warn',
      {
        namedComponents: 'function-declaration',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/no-deprecated': 'warn',
    'react/jsx-sort-props': [
      'warn',
      {
        callbacksLast: true,
        shorthandLast: true,
      },
    ],
    'react/jsx-boolean-value': 'warn',
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        controlComponents: ['Field'],
        depth: 3,
      },
    ],

    '@cognite/styled-macro': 'error',
    '@cognite/require-t-function': 'error',
  },
};
