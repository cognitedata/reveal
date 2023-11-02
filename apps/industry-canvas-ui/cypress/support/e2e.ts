// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
// Import commands.ts using ES2015 syntax:

// This will also register cypress commands defined in @fusion/shared/cypress like loginWithAADClientCredentials()
import {
  baseUrl,
  idpInternalId,
  AADUsername,
  AADPassword,
  project,
} from '../config';
import './industry-canvas-commands';

// The code bellow works perfectly fine, there is some weird linting
// @ts-ignore
Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from
  // failing the test
  if (err.message.includes('cluster not found')) {
    return false;
  }
  // this can be removed after resolve AH-2142
  if (
    err.message.includes(
      `Cannot read properties of undefined (reading 'setAttrs')`
    )
  ) {
    return false;
  }
});

beforeEach(() => {
  cy.session(
    [AADUsername],
    () => {
      cy.loginWithAADUserCredentials(
        baseUrl,
        idpInternalId,
        project,
        AADUsername,
        AADPassword
      );
      cy.setImportMapOverrides([
        {
          module: '@cognite/cdf-industry-canvas-ui',
          domain: 'https://localhost:3011/index.js',
        },
      ]);
    },
    { cacheAcrossSpecs: true }
  );
});
