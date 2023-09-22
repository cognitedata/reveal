import type { StorybookConfig } from '@storybook/react-vite';
import { remove } from 'lodash';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions'
  ],
  framework: '@storybook/react-vite',
  core: {
    builder: '@storybook/builder-vite'
  },
  async viteFinal(config, { configType }) {
    if (config.plugins !== undefined) {
      remove(config.plugins, (plugin) => {
        return (plugin as any).name === 'vite-plugin-externalize-deps';
      });
    }

    config.define = {
      'process.env': {}
    };
    return config;
  }
};

export default config;
