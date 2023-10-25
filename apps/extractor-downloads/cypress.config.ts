import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname, { cypressDir: 'cypress' }),
    experimentalModifyObstructiveThirdPartyCode: true,
    chromeWebSecurity: true,
    video: true,
  },
  env: process.env,

  viewportWidth: 1920,
  viewportHeight: 1080,
});
