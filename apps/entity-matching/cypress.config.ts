import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname, { cypressDir: 'cypress' }),
    experimentalModifyObstructiveThirdPartyCode: true,
    chromeWebSecurity: true,
  },
  env: process.env,
});
