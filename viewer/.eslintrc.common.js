module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['prettier', 'header', '@typescript-eslint', 'jsdoc', 'unused-imports'],
  rules: {
    // notice that we use TSdoc syntax, not jsdoc, but tsdoc eslint plugin is mostly useless
    // so we use some of the jsdoc rules here
    'jsdoc/check-alignment': 1,
    'jsdoc/check-indentation': 1,
    'jsdoc/check-param-names': 1,
    'jsdoc/check-syntax': 1,
    'jsdoc/check-tag-names': ['warn', { definedTags: ['internal', 'noInheritDoc', 'obvious', 'beta'] }],
    'jsdoc/implements-on-classes': 1,
    'jsdoc/no-types': 1,
    'jsdoc/no-undefined-types': 1,

    'header/header': [
      'error',
      'block',
      [
        {
          pattern: `(Copyright 20\\d{2}|istanbul ignore|Adapted from pnext/three-loader|Adapted from threejs)`,
          template: `!\n * Copyright ${new Date().getFullYear()} Cognite AS\n `
        }
      ]
    ],

    'no-return-await': 'error',

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/naming-convention.md
    '@typescript-eslint/naming-convention': [
      'warn',
      { selector: 'typeLike', format: ['PascalCase'] },
      { selector: 'method', format: ['camelCase'], leadingUnderscore: 'allow' }
    ],

    '@typescript-eslint/explicit-module-boundary-types': ['error'],
    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    'unused-imports/no-unused-imports-ts': 'error',

    'default-case': 'error',
    'no-console': ['warn', { allow: ['warn', 'error', 'assert'] }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/no-misused-promises': 'off',
    'no-console': [2, { allow: ['warn', 'error'] }],
    eqeqeq: ['error', 'always']
  },
  settings: {
    jsdoc: {
      ignorePrivate: true
    }
  },
};
