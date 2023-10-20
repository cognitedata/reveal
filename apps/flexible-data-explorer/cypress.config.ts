import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

import { loginWithAzureClientCredentials } from './cypress/support/loginWithClientCredentials';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'cypress', bundler: 'vite' }),
    chromeWebSecurity: false,
    testIsolation: false,
    env: process.env,
    async setupNodeEvents(
      on: Cypress.PluginEvents,
      config: Cypress.PluginConfigOptions
    ) {
      const result = await loginWithAzureClientCredentials(
        config.env.CLIENT_ID,
        config.env.CLIENT_SECRET
      );

      config.env.ACCESS_TOKEN = result.accessToken;

      return config;
    },
  },
  defaultCommandTimeout: 10000,
  viewportWidth: 1920,
  viewportHeight: 1080,
});
