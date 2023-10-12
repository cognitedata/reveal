import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

import { loginWithAzureClientCredentials } from './src/support/loginWithClientCredentials';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname),
    chromeWebSecurity: false,
    testIsolation: false,
    env: {
      ORG: 'cog-dss',
      PROJECT: 'dss-dev',
      TENANT: 'dssbycognite.onmicrosoft.com',
      CLUSTER: 'greenfield.cognitedata.com',
      ENV: 'greenfield',
      OVERRIDE_URL: 'http://localhost:3010/index.js',
    },
    async setupNodeEvents(
      on: Cypress.PluginEvents,
      config: Cypress.PluginConfigOptions
    ) {
      const result = await loginWithAzureClientCredentials(
        config.env.DATA_EXPLORER_CLIENT_ID,
        config.env.DATA_EXPLORER_CLIENT_SECRET
      );

      config.env.ACCESS_TOKEN = result.accessToken;

      return config;
    },
  },
  hosts: {
    '*.localhost': '127.0.0.1',
  },
  defaultCommandTimeout: 10000,
  viewportWidth: 1920,
  viewportHeight: 1080,
});
