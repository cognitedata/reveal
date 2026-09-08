/*!
 * Copyright 2026 Cognite AS
 */

import { defineConfig, type Plugin } from 'vite';
import glsl from 'vite-plugin-glsl';
import pkg from './package.json' with { type: 'json' };
import dts from 'unplugin-dts/vite';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ command }) => {
  return {
    root: '.',
    plugins: [
      watchShaderIncludes(),
      glsl({ minify: true }),
      dts({
        tsconfigPath: './tsconfig.lib.json',
        compilerOptions: {
          paths: {
            '@reveal/*': ['./packages/*']
          }
        }
      })
    ],

    worker: {
      format: 'es'
    },

    build: {
      outDir: 'dist',
      target: 'es2019',
      // The `clean` script empties dist before a build. Leaving it to Vite instead would wipe
      // dist on every rebuild of `build:watch`, and since declarations are only generated on
      // the first build, consumers linking to dist would lose their types after one rebuild.
      emptyOutDir: false,
      sourcemap: command === 'build',
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
    },

    css: {
      modules: {
        scopeBehaviour: 'global' // Disables hashing/renaming globally
      }
    },

    test: {
      globals: true,
      isolate: false,
      restoreAllMocks: true,
      environment: 'happy-dom',
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
  };
});

function getDependencyMatchers(deps: Record<string, string>) {
  return Object.keys(deps).map(dep => new RegExp(`^${dep}(?:/.+)?$`));
}

/**
 * Makes `vite build --watch` rebuild when a shader that is only reachable through an
 * `#include` changes. vite-plugin-glsl registers included chunks as watch dependencies
 * itself, but skips that when NODE_ENV is 'production', which it always is during a build.
 */
function watchShaderIncludes(): Plugin {
  return {
    name: 'watch-shader-includes',
    enforce: 'pre',
    transform: {
      filter: { id: /\.(glsl|vert|frag)$/ },
      handler(source, id) {
        for (const include of collectShaderIncludes(source, id, new Set())) {
          this.addWatchFile(include);
        }
        return null;
      }
    }
  };
}

/** Resolves `#include ./someShader.glsl;` directives to absolute paths, recursively. */
function collectShaderIncludes(source: string, shaderPath: string, found: Set<string>): Set<string> {
  const includePattern = /^\s*#include\s+["']?([^"'\s;]+)/gm;

  for (const [, includePath] of source.matchAll(includePattern)) {
    const resolved = path.resolve(path.dirname(shaderPath), includePath);
    const file = path.extname(resolved) === '' ? `${resolved}.glsl` : resolved;

    if (found.has(file) || !fs.existsSync(file)) {
      continue;
    }
    found.add(file);
    collectShaderIncludes(fs.readFileSync(file, 'utf8'), file, found);
  }

  return found;
}
