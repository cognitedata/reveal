import { unlinkSync } from 'fs';

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
      removePassedSpecs(on);

      return config;
    },
  },
  defaultCommandTimeout: 10000,
  viewportWidth: 1920,
  viewportHeight: 1080,
});

/**
 * Delete videos for specs that do not contain failing or retried tests.
 * This function is to be used in the 'setupNodeEvents' configuration option as a replacement to
 * 'videoUploadOnPasses' which has been removed.
 *
 * https://docs.cypress.io/guides/guides/screenshots-and-videos#Delete-videos-for-specs-without-failing-or-retried-tests
 **/
function removePassedSpecs(on) {
  on('after:spec', (spec, results) => {
    if (results && results.vide) {
      const hasFailures = results.tests.some((t) =>
        t.attempts.some((a) => a.state === 'failed')
      );

      if (!hasFailures) {
        unlinkSync(results.video);
      }
    }
  });
}
