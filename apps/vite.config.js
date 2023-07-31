const fs = require('fs');
const path = require('path');

const {
  NodeGlobalsPolyfillPlugin,
} = require('@esbuild-plugins/node-globals-polyfill');
const {
  NodeModulesPolyfillPlugin,
} = require('@esbuild-plugins/node-modules-polyfill');
const { loadEnv, splitVendorChunkPlugin } = require('vite');
const react = require('@vitejs/plugin-react');
const basicSsl = require('@vitejs/plugin-basic-ssl');
const tsConfigPaths = require('vite-tsconfig-paths').default;
const svgr = require('vite-plugin-svgr');
const macrosPlugin = require('vite-plugin-babel-macros').default;
const rollupNodePolyFill = require('rollup-plugin-node-polyfills');

function getLocalPackages(returnName) {
  const dir = fs.readdirSync(path.resolve(process.cwd(), '../../packages'), {
    withFileTypes: true,
  });
  return dir
    .filter((file) => file.isDirectory())
    .map((folder) => {
      if (returnName) {
        return `@cognite/${folder.name}`;
      }
      return new RegExp(`packages/${folder.name}`);
    });
}

module.exports = (command, appName) => {
  let env = {};
  const baseConfig = {
    plugins: [],
    optimizeDeps: {},
    build: {
      commonjsOptions: {},
    },
  };
  if (command === 'serve') {
    // Allows vite to get resources from node_modules, like cogs.js fonts
    baseConfig.plugins = [basicSsl()];
    baseConfig.server = {
      port: 3000,
      fs: {
        allow: ['../..'],
      },
    };
    env = {
      NODE_ENV: 'development',
      ...loadEnv('development', process.cwd(), 'REACT_APP_'),
      ...loadEnv('development', process.cwd(), 'PUBLIC_URL'),
    };
  } else {
    baseConfig.optimizeDeps = {
      include: [...getLocalPackages(true)],
    };
    baseConfig.build = {
      commonjsOptions: {
        include: [...getLocalPackages(false), /node_modules/],
      },
    };
    env = {
      NODE_ENV: 'production',
      ...loadEnv('production', process.cwd(), 'REACT_APP_'),
      ...loadEnv('production', process.cwd(), 'PUBLIC_URL'),
    };
  }
  return {
    ...baseConfig,
    plugins: [
      ...baseConfig.plugins,
      react(),
      tsConfigPaths({
        root: `${process.cwd()}/../..`,
        projects: ['tsconfig.json', `apps/${appName}/tsconfig.json`],
      }),
      svgr(),
      macrosPlugin(),
      splitVendorChunkPlugin(),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: [
        {
          find: 'crypto',
          replacement: require.resolve('rollup-plugin-node-builtins'),
        },
        {
          find: 'path',
          replacement: require.resolve('path-browserify'),
        },
        {
          find: 'stream',
          replacement: require.resolve('stream-browserify'),
        },
        {
          find: 'util',
          replacement: require.resolve(
            'rollup-plugin-node-polyfills/polyfills/util'
          ),
          customResolver: (defaultReplacement, path) => {
            if (path.endsWith('node_modules/assert/build/assert.js')) {
              return path.replace(
                'assert/build/assert.js',
                'assert/node_modules/util/util.js'
              );
            }
            return defaultReplacement.replace(/\/$/, '');
          },
        },
        {
          find: 'i18next-chained-backend',
          replacement:
            'i18next-chained-backend/dist/cjs/i18nextChainedBackend.js',
        },
        {
          find: 'styled-components',
          replacement:
            'styled-components/dist/styled-components.browser.cjs.js',
        },
        {
          find: 'camera-controls',
          replacement: 'camera-controls/dist/camera-controls.js',
        },
      ],
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      ...baseConfig.optimizeDeps,
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
          }),
          NodeModulesPolyfillPlugin(),
        ],
      },
    },
    base: command === 'build' ? '/PUBLIC_URL_VALUE/' : '/',
    define: {
      'process.env': env,
    },
    build: {
      ...baseConfig.build,
      sourcemap: command === 'build',
      rollupOptions: {
        plugins: [
          // Enable rollup polyfills plugin
          // used during production bundling
          rollupNodePolyFill(),
        ],
        preserveEntrySignatures: 'exports-only',
        treeshake: false,
        // output: {
        //   manualChunks(id) {
        //     if (id.includes('node_modules')) {
        //       const nodeModules = id.toString().split('node_modules/');
        //       const moduleChildren = nodeModules[1].split('/')[0];

        //       return moduleChildren.toString();
        //     }
        //     return null;
        //   },
        // },
      },
    },
  };
};
