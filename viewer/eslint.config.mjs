import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import jsdoc from 'eslint-plugin-jsdoc';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Inline replacement for eslint-plugin-header which is unmaintained and
// incompatible with ESLint 9+ flat config (missing meta.schema, uses removed APIs).
const headerPlugin = {
  rules: {
    header: {
      meta: {
        type: 'layout',
        fixable: 'whitespace',
        schema: [
          { type: 'string' },
          {},
          {},
        ],
      },
      create(context) {
        const [commentType, rawContent] = context.options;
        const sourceCode = context.sourceCode;
        const patterns = Array.isArray(rawContent) ? rawContent : [rawContent];
        const first = patterns[0];
        const headerPattern =
          typeof first === 'object' && first !== null && first.pattern
            ? new RegExp(first.pattern)
            : new RegExp(String(first));
        const headerTemplate =
          typeof first === 'object' && first !== null ? first.template : String(first);
        const newHeader = `/*${headerTemplate}*/\n`;

        return {
          Program(node) {
            const src = sourceCode.text;

            let offset = 0;
            if (src.startsWith('#!')) {
              const nl = src.indexOf('\n');
              offset = nl === -1 ? src.length : nl + 1;
            }

            const tail = src.slice(offset);

            if (commentType === 'block') {
              if (!tail.startsWith('/*')) {
                context.report({
                  node,
                  loc: { start: { line: 1, column: 0 } },
                  message: 'missing header',
                  fix:
                    headerTemplate != null
                      ? fixer => fixer.replaceTextRange([offset, offset], newHeader)
                      : null,
                });
                return;
              }

              const endIdx = tail.indexOf('*/');
              if (endIdx === -1) return;
              const commentValue = tail.slice(2, endIdx);

              if (!headerPattern.test(commentValue)) {
                context.report({
                  loc: { start: { line: 1, column: 0 } },
                  message: 'incorrect header',
                  fix:
                    headerTemplate != null
                      ? fixer =>
                          fixer.replaceTextRange(
                            [offset, offset + endIdx + 2],
                            `/*${headerTemplate}*/`
                          )
                      : null,
                });
              }
            }
          },
        };
      },
    },
  },
};

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      '**/dist/**/*',
      '**/*/draco_decoder_gltf.js',
      '**/wasm/**/*.js',
      'packages/**/wasm/pkg/**',
      'target/**',
      'coverage/**',
    ],
  },

  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts', '**/*.js'],
    plugins: {
      jsdoc,
      header: headerPlugin,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.lib.json',
        tsconfigRootDir: __dirname,
      },
    },
    settings: {
      jsdoc: {
        ignorePrivate: true,
      },
    },
    rules: {
      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-indentation': 'warn',
      'jsdoc/check-param-names': 'warn',
      'jsdoc/check-syntax': 'warn',
      'jsdoc/check-tag-names': [
        'warn',
        {
          definedTags: ['internal', 'noInheritDoc', 'obvious', 'beta'],
          inlineTags: [
            'link',
            'linkcode',
            'linkplain',
            'tutorial',
            'inheritDoc',
            'label',
            'include',
            'includeCode',
            'see',
            'ref',
          ],
        },
      ],
      'jsdoc/implements-on-classes': 'warn',
      'jsdoc/no-types': 'warn',
      'jsdoc/no-undefined-types': 'warn',

      'header/header': [
        'error',
        'block',
        [
          {
            pattern: '(Copyright 20\\d{2}|istanbul ignore|Adapted from pnext/three-loader|Adapted from threejs)',
            template: `!\n * Copyright ${new Date().getFullYear()} Cognite AS\n `,
          },
        ],
      ],

      'no-return-await': 'error',
      'no-empty': 'off',
      'default-case': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'assert'] }],

      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'method', format: ['camelCase'], leadingUnderscore: 'allow' },
      ],
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/explicit-module-boundary-types': ['error', { allowArgumentsExplicitlyTypedAsAny: true }],
      '@typescript-eslint/no-inferrable-types': 'off',

      'unused-imports/no-unused-imports': 'error',
    },
  },

  {
    files: ['**/*.test.ts', 'test-utilities/**/*.ts', '**/tests/**/*.ts', 'visual-tests/**/*.ts', 'vite.config.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.test.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      // Chai-style assertions (expect(x).to.be.true) are getter chains;
      // the rule doesn't know they have side effects.
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },

  {
    files: ['packages/pointclouds/src/potree-three-loader/**'],
    rules: {
      'header/header': 'off',
    },
  },

  {
    files: ['packages/api/src/public/**/*.ts'],
    rules: {
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: { ClassDeclaration: true, MethodDefinition: true, FunctionDeclaration: true },
          checkConstructors: false,
          checkSetters: false,
          checkGetters: false,
        },
      ],
      'jsdoc/require-description': ['warn', { exemptedBy: ['deprecated', 'internal', 'see', 'obvious'] }],
      'jsdoc/require-description-complete-sentence': [
        'warn',
        { abbreviations: ['etc', 'e.g.', 'i.e.'], tags: ['returns', 'descriptions', 'see'] },
      ],
      'jsdoc/require-returns-description': 'warn',
      'jsdoc/require-returns-check': 'warn',
      'jsdoc/require-param': 'warn',
      'jsdoc/require-param-name': 'warn',
    },
  },

  prettierRecommended,
);
