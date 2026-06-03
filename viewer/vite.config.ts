/*!
 * Copyright 2026 Cognite AS
 */

import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import wasm from 'vite-plugin-wasm';
import pkg from './package.json' with { type: 'json' };
import dts from 'unplugin-dts/vite';
import type { Plugin } from 'vite';
import typescript from 'typescript';

export default defineConfig(({ command }) => {
  return {
    root: '.',
    plugins: [glsl(), dts({ tsconfigPath: './tsconfig.webpack.json' }), tsAccessorDecoratorPlugin()],

    worker: {
      format: 'es',
      plugins: () => [wasm()]
    },

    build: {
      outDir: 'dist',
      target: 'es2019',
      rolldownOptions: {
        external: [...getDependencyMatchers(pkg.dependencies), ...getDependencyMatchers(pkg.peerDependencies)],
        output: {
          preserveModules: false,
          entryFileNames: '[name].js'
        }
      },
      lib: {
        entry: 'index.ts',
        formats: ['es']
      }
    }
  };
});

function getDependencyMatchers(deps: Record<string, string>) {
  return Object.keys(deps).map(dep => new RegExp(`^${dep}(?:/.+)?$`));
}

// This plugin compiles TypeScript files containing accessor decorators using the TypeScript compiler,
// as Vite's default handling does not support this syntax.
// It only runs on the PointCloudMaterial.ts file to minimize overhead, as this is the only file in the project using accessor decorators.
// Once https://github.com/oxc-project/oxc/issues/9170 is resolved and merged upstream to vite, this plugin can be removed.
function tsAccessorDecoratorPlugin(): Plugin {
  return {
    name: 'vitest-ts-accessor-decorator',
    enforce: 'pre',
    transform: {
      filter: {
        id: /^.*[/\\]PointCloudMaterial\.ts$/
      },
      handler(code, id) {
        const cleanId = id.split('?')[0];
        if (!cleanId.endsWith('.ts') && !cleanId.endsWith('.tsx')) return;
        if (!/\baccessor\b/.test(code)) return;

        const result = typescript.transpileModule(code, {
          fileName: cleanId,
          compilerOptions: {
            target: typescript.ScriptTarget.ES2019,
            module: typescript.ModuleKind.ESNext,
            useDefineForClassFields: false,
            esModuleInterop: true
          }
        });

        return result.outputText;
      }
    }
  };
}
