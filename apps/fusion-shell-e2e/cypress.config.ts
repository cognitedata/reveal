import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

import { loginWithAzureClientCredentials } from './src/support/loginWithClientCredentials';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname, {
      bundler: 'vite',
    }),
    chromeWebSecurity: false,
    testIsolation: false,
    env: process.env,
    video: true,
    screenshotOnRunFailure: true,
    videoUploadOnPasses: false,
    async setupNodeEvents(
      on: Cypress.PluginEvents,
      config: Cypress.PluginConfigOptions
    ) {
      const result = await loginWithAzureClientCredentials(
        config.env.DATA_EXPLORER_CLIENT_ID,
        config.env.DATA_EXPLORER_CLIENT_SECRET
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      config.env.ACCESS_TOKEN = result!.accessToken!;

      return config;
    },
  },
  defaultCommandTimeout: 10000,
  viewportWidth: 1920,
  viewportHeight: 1080,
  chromeWebSecurity: false,
});
