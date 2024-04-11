/*!
 * Copyright 2021 Cognite AS
 */

module.exports = {
  env: {
    'jest/globals': true
  },
  extends: [
    './.eslintrc.common.js'
  ],
  plugins: ['lodash', 'jest'],
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },
  ignorePatterns: ['.eslintrc.js', '**/dist/**/*', '**/*/draco_decoder_gltf.js', '**/wasm/**/*.js'],
  rules: {
    // see relevant discussion https://github.com/cognitedata/cognite-sdk-js/pull/386
    'lodash/import-scope': ['error', 'method'],
  },
  overrides: [
    {
      files: ['*.test.ts', 'test-utilities/**/*.ts'],
      rules: {
        // complains when you do expect(mockObj.mockFn).toBeCalled() in tests
        '@typescript-eslint/unbound-method': 'off'
      }
    },

    // more strict jsdoc rules for public API
    {
      files: ['./packages/api/src/public/**/*.ts'],
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
