/* eslint-disable @typescript-eslint/no-var-requires */
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'cypress' }),
    modifyObstructiveCode: false,
    video: true,
    videosFolder: '../../dist/cypress/apps/platypus/videos',
    screenshotsFolder: '../../dist/cypress/apps/platypus/screenshots',
    chromeWebSecurity: false,
    screenshotOnRunFailure: false,
    viewportHeight: 900, // macbook 15
    viewportWidth: 1440,
    experimentalRunAllSpecs: true,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
  },
  env: process.env,
});
