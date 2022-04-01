/*!
 * Copyright 2021 Cognite AS
 */

module.exports = {
  root: true,
  env: {
    browser: true
  },
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },
  plugins: ['header', '@typescript-eslint', 'jsdoc', 'unused-imports', 'lodash'],

  extends: [
    'plugin:@typescript-eslint/recommended',

    // This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    'plugin:prettier/recommended'
  ],
  ignorePatterns: ['.eslintrc.js', '**/dist/**/*', '**/*/draco_decoder_gltf.js'],
  rules: {
    // notice that we use TSdoc syntax, not jsdoc, but tsdoc eslint plugin is mostly useless
    // so we use some of the jsdoc rules here
    'jsdoc/check-alignment': 1,
    'jsdoc/check-indentation': 1,
    'jsdoc/check-param-names': 1,
    'jsdoc/check-syntax': 1,
    'jsdoc/check-tag-names': ['warn', { definedTags: ['internal', 'noInheritDoc', 'obvious'] }],
    'jsdoc/implements-on-classes': 1,
    'jsdoc/no-types': 1,
    'jsdoc/no-undefined-types': 1,

    'header/header': [
      'error',
      'block',
      [
        {
          pattern: `(Copyright 20\\d{2}|istanbul ignore)`,
          template: `!\n * Copyright ${new Date().getFullYear()} Cognite AS\n `
        }
      ]
    ],

    // see relevant discussion https://github.com/cognitedata/cognite-sdk-js/pull/386
    'lodash/import-scope': ['error', 'method'],

    'no-return-await': 'error',
    'no-empty': 'off',
    'object-literal-sort-keys': 'off',
    'default-case': 'error',
    'no-console': ['warn', { allow: ['warn', 'error', 'assert'] }],

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/naming-convention.md
    '@typescript-eslint/naming-convention': [
      'warn',
      { selector: 'typeLike', format: ['PascalCase'] },
      { selector: 'method', format: ['camelCase'], leadingUnderscore: 'allow' }
    ],
    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/prefer-for-of': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/prefer-readonly': 'error',
    'unused-imports/no-unused-imports-ts': 'error',

    // TODO: maksnester 26-06-2020 we need to fix our codebase to play well with these rules
    '@typescript-eslint/explicit-module-boundary-types': ['error', { 'allowArgumentsExplicitlyTypedAsAny': true }],

    // to be discussed
    '@typescript-eslint/no-inferrable-types': 'off'
  },
  settings: {
    jsdoc: {
      mode: 'typescript',
      ignorePrivate: true
    }
  },
  overrides: [
    {
      files: ['*.test.ts'],
      rules: {
        // complains when you do expect(mockObj.mockFn).toBeCalled() in tests
        '@typescript-eslint/unbound-method': 'off'
      }
    },

    // more strict jsdoc rules for public API
    {
      files: ['./core/src/public/**/*.ts'],
      rules: {
        'jsdoc/require-jsdoc': [
          'warn',
          {
            publicOnly: true,
            require: { ClassDeclaration: true, MethodDefinition: true, FunctionDeclaration: true },
            checkConstructors: false,
            checkSetters: false,
            checkGetters: false
          }
        ],
        // notice that @obvious tag to skip description instead of suppressing the rule
        'jsdoc/require-description': ['warn', { exemptedBy: ['deprecated', 'internal', 'see', 'obvious'] }],
        'jsdoc/require-description-complete-sentence': [
          'warn',
          { abbreviations: ['etc', 'e.g.', 'i.e.'], tags: ['returns', 'descriptions', 'see'] }
        ],
        'jsdoc/require-returns-description': 1,
        'jsdoc/require-returns-check': 1,
        'jsdoc/require-param': 1,
        'jsdoc/require-param-name': 1
      }
    }
  ]
};
