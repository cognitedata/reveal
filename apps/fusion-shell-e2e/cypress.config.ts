import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

import { getSubappInfo } from './src/utils/getSubappsInfo';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname, {
      bundler: 'vite',
    }),
    chromeWebSecurity: true,
    testIsolation: false,
    env: process.env,
    video: true,
    screenshotOnRunFailure: true,
    videoUploadOnPasses: false,
    setupNodeEvents(
      on: Cypress.PluginEvents,
      config: Cypress.PluginConfigOptions
    ) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        getSubappInfo(subapp: string) {
          return getSubappInfo(subapp);
        },
      });
      return config;
    },
  },
  defaultCommandTimeout: 10000,
  viewportWidth: 1920,
  viewportHeight: 1080,
});
