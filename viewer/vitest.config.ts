/*!
 * Copyright 2021 Cognite AS
 */

import { defineConfig, Plugin } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';
import typescript from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fileTypeMocksPlugin(): Plugin {
  const VIRTUAL_PREFIX = '\0vitest-mock:';

  const mocks: Record<string, string> = {
    '.frag': `export default 'void main() {}';`,
    '.vert': `export default 'void main() {}';`,
    '.css': `export default {};`,
    '.svg': `export default '<svg xmlns="http://www.w3.org/2000/svg"></svg>';`,
    '.wasm': `export default {};`
  };

  return {
    name: 'vitest-file-type-mocks',
    enforce: 'pre',
    resolveId(id) {
      const cleanId = id.split('?')[0];
      for (const ext of Object.keys(mocks)) {
        if (cleanId.endsWith(ext)) {
          return VIRTUAL_PREFIX + ext;
        }
      }
    },
    load(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        const ext = id.slice(VIRTUAL_PREFIX.length);
        return mocks[ext] ?? '';
      }
    }
  };
}

// Vite 8 uses oxc which strips TypeScript types but does NOT compile TC39
// accessor decorators. Node.js 22 cannot execute accessor decorator syntax,
// so files using it must be compiled via the TypeScript compiler instead.
function tsAccessorDecoratorPlugin(): Plugin {
  return {
    name: 'vitest-ts-accessor-decorator',
    enforce: 'pre',
    transform(code, id) {
      const cleanId = id.split('?')[0];
      if (!cleanId.endsWith('.ts') && !cleanId.endsWith('.tsx')) return;
      if (!/\baccessor\b/.test(code)) return;

      const result = typescript.transpileModule(code, {
        fileName: cleanId,
        compilerOptions: {
          target: typescript.ScriptTarget.ES2020,
          module: typescript.ModuleKind.ESNext,
          useDefineForClassFields: false,
          esModuleInterop: true,
          verbatimModuleSyntax: false
        }
      });

      return result.outputText;
    }
  };
}

export default defineConfig({
  plugins: [tsAccessorDecoratorPlugin(), fileTypeMocksPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/visual-tests/**', '**/*.VisualTest.ts'],
    setupFiles: [path.resolve(__dirname, './test-utilities/src/setupVitest.ts')],
    env: {
      MIXPANEL_TOKEN: 'test'
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      exclude: [
        '**/*.test.ts',
        '**/*.VisualTest.ts',
        'packages/*/visual-tests/**',
        'visual-tests/**',
        'test-utilities/**',
        '**/*.d.ts',
        '**/*.json',
        '**/dist/**',
        '**/app/**'
      ]
    },
    environmentOptions: {
      jsdom: {
        url: 'https://api.cognitedata.com'
      }
    }
  }
});
