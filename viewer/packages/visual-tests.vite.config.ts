/*!
 * Copyright 2021 Cognite AS
 */

import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import wasm from 'vite-plugin-wasm';
import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';
import typescript from 'typescript';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

function setTestFixture(testFixture: string | undefined): string | boolean {
  if (testFixture === undefined) {
    return false;
  }
  const parsedTestFixturePath = path.parse(testFixture);
  if (parsedTestFixturePath === undefined) {
    throw new Error('Unknown test fixture argument');
  }
  return '/?testfixture=' + parsedTestFixturePath.name;
}

function readCdfEnv(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../visual-tests/.cdf-env.json')).toString();
  } catch (_) {
    const yellowColor = '\x1b[33m';
    console.warn(yellowColor, '\nWARNING: CDF environments are not set which only allows local models to be loaded\n');
    return 'undefined';
  }
}

// Serve additional static directories (equivalent to webpack-dev-server `static` option)
function additionalStaticPlugin(dirs: Array<{ directory: string; watch?: boolean }>): Plugin {
  return {
    name: 'additional-static',
    configureServer(server) {
      dirs.forEach(({ directory }) => {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();
          const filePath = path.join(directory, req.url.split('?')[0]);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.end(fs.readFileSync(filePath));
          } else {
            next();
          }
        });
      });
    }
  };
}

// Serve a generated index.html (equivalent of HtmlWebpackPlugin)
function htmlPlugin(): Plugin {
  return {
    name: 'visual-test-html',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (url === '/' || /^\/?(\?[^/]*)?$/.test(url)) {
          res.setHeader('Content-Type', 'text/html');
          res.end(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <script type="module" src="/visual-tests/VisualTest.browser.ts"></script>
  </body>
</html>`);
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(({ command }) => {
  const open = setTestFixture(process.env.testFixture);
  const cdfEnv = readCdfEnv();

  return {
    root: path.resolve(__dirname, '..'),

    plugins: [
      nodePolyfills({ include: ['process'] }),
      tsAccessorDecoratorPlugin(),
      htmlPlugin(),
      glsl(),
      additionalStaticPlugin([{ directory: path.resolve(__dirname, '../../examples/public'), watch: false }])
    ],

    resolve: {
      alias: {
        path: 'path-browserify'
      },
      extensions: ['.ts', '.js'],
      preserveSymlinks: false
    },

    define: {
      CDF_ENV: cdfEnv,
      process: JSON.stringify({
        env: { NODE_ENV: process.env.NODE_ENV ?? 'production' },
        browser: true,
        platform: 'browser',
        version: ''
      })
    },

    server: {
      allowedHosts: true,
      port: 8080,
      open,
      watch: {
        ignored: [path.resolve(__dirname, '../../examples/public')]
      },
      fs: {
        allow: [
          path.resolve(__dirname, '..'),
          path.resolve(__dirname, 'sector-parser/app'),
          path.resolve(__dirname, '../../examples/public')
        ]
      }
    },

    build: {
      outDir: path.resolve(__dirname, 'dist'),
      sourcemap: 'inline',
      rollupOptions: {
        input: path.resolve(__dirname, '../visual-tests/VisualTest.browser.ts')
      }
    },

    worker: {
      format: 'es',
      plugins: () => [wasm()]
    }
  };
});

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
