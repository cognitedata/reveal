// import love from 'eslint-config-love';
import js from "@eslint/js";
import reactConfig from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';

export default [
  // love,
  js.configs.recommended,
  reactConfig,
  prettierConfig,
   {
    languageOptions: {
      globals: {
        browser: true,
        es2021: true
      }
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      project: './tsconfig.json'
    },
    plugins: ['react', 'prettier', 'header'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/class-literal-property-style': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      'no-console': [2, { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always']
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
   overrides: [
       {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'stories/**/*.ts', 'stories/**/*.tsx'],
         rules: {
           'header/header': [
             'error',
             'block',
             [
               {
                 pattern: `(Copyright 20\\d{2}|istanbul ignore)`,
                 template: `!\n * Copyright ${new Date().getFullYear()} Cognite AS\n `
               }
             ]
          ]
         },
       }
     ]
   },
   {
    ignores: ['dist/*',
              'node_modules/*',
              '.yarn/*',
              'storybook-static/*',
              'yarn.lock',
              'webpack.config.js',
              'playwright-report/*',
             ]
  }
];
