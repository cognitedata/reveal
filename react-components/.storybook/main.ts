import type { StorybookConfig } from '@storybook/react-vite';
import { remove } from 'lodash';

import { addons } from '@storybook/manager-api';

addons.setConfig({
  enableShortcuts: false
});

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],

  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: './vite.config.ts'
      }
    }
  },

  typescript: {
    reactDocgen: false
  },

  staticDirs: ['../stories/public'],

  async viteFinal(config, { configType }) {
    if (config.plugins !== undefined) {
      remove(config.plugins, (plugin) => {
        return (plugin as any).name === 'vite-plugin-externalize-deps';
      });
      if (configType === 'PRODUCTION') {
        remove(config.plugins, (plugin) => {
          return (plugin as any).name === 'vite:dts';
        });
      }
    }

    if (config.build !== undefined) {
      config.build.sourcemap = false;
      config.build.minify = false;
    }

    config.define = {
      'process.env': {}
    };
    return config;
  }
};

export default config;
