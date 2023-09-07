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
  addons: [
    '@storybook/addon-essentials',
    '@nx/react/plugins/storybook',
    '@storybook/addon-interactions',
  ],
  async viteFinal(config, { configType }) {
    const NODE_ENV = configType.toLowerCase();
    const env = {
      NODE_ENV: NODE_ENV,
      ...loadEnv(NODE_ENV, process.cwd(), 'REACT_APP_'),
      ...loadEnv(NODE_ENV, process.cwd(), 'PUBLIC_URL'),
    };

    // Add your configuration here
    return mergeConfig(config, {
      plugins: [
        viteTsConfigPaths({
          projects: [
            `${searchForWorkspaceRoot(process.cwd())}/tsconfig.base.json`,
            './tsconfig.json',
          ],
        }),
        macrosPlugin(),
      ],
      define: {
        'process.env': env,
      },
      server: {
        fs: {
          allow: [searchForWorkspaceRoot(process.cwd())],
        },
      },
    });
  },
};

export default config;
