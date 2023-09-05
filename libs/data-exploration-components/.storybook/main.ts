import * as fs from 'fs';
import * as path from 'path';

import { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig, loadEnv, searchForWorkspaceRoot } from 'vite';
import macrosPlugin from 'vite-plugin-babel-macros';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: ['../src/**/*.stories.@(mdx|js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@nx/react/plugins/storybook'],
  async viteFinal(config, { configType }) {
    const NODE_ENV = configType.toLowerCase();
    const env = {
      NODE_ENV: NODE_ENV,
      ...loadEnv(NODE_ENV, process.cwd(), 'REACT_APP_'),
      ...loadEnv(NODE_ENV, process.cwd(), 'PUBLIC_URL'),
    };

    // Add your configuration here
    return mergeConfig(config, {
      cacheDir:
        '../../node_modules/.vite/storybook/data-exploration-components-old',
      resolve: {
        dedupe: ['@cognite/plotting-components'],
        alias: {
          fs: require.resolve('rollup-plugin-node-builtins'),
        },
      },
      plugins: [
        viteTsConfigPaths({
          projects: [
            `${searchForWorkspaceRoot(process.cwd())}/tsconfig.base.json`,
            './tsconfig.json',
          ],
        }),
        macrosPlugin(),
        reactVirtualized(),
      ],
      define: {
        'process.env': env,
      },
      server: {
        fs: {
          allow: [searchForWorkspaceRoot(process.cwd())],
        },
      },
      build: {
        sourcemap: false,
      },
    });
  },
};

// REF: https://github.com/uber/baseweb/issues/4129#issuecomment-1208168306
const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;
export function reactVirtualized() {
  return {
    name: 'my:react-virtualized',
    configResolved() {
      const file = require
        .resolve('react-virtualized')
        .replace(
          path.join('dist', 'commonjs', 'index.js'),
          path.join('dist', 'es', 'WindowScroller', 'utils', 'onScroll.js')
        );
      const code = fs.readFileSync(file, 'utf-8');
      const modified = code.replace(WRONG_CODE, '');
      fs.writeFileSync(file, modified);
    },
  };
}

export default config;
