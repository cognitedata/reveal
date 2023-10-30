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
import '../commands';
// This will also register cypress commands defined in @fusion/shared/cypress like loginWithAADClientCredentials()
import { interceptProfileMe } from '@fusion/shared/cypress';

import {
  cluster,
  project,
  tenant,
  clientId,
  clientSecret,
  baseUrl,
  targetAppPackageName,
} from '../config';

Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from
  // failing the test
  if (err.message.includes('cluster not found')) {
    return false;
  }
  return;
});

beforeEach(() => {
  interceptProfileMe(cluster, project);

  cy.session(
    [cluster, tenant, clientId, clientSecret],
    () => {
      cy.setImportMapOverrides([
        {
          module: targetAppPackageName,
          domain: 'https://localhost:3010/index.js',
        },
      ]);
      cy.visit(baseUrl);
      cy.loginWithAADClientCredentials(cluster, tenant, clientId, clientSecret);
    },
    { cacheAcrossSpecs: true }
  );
});

afterEach(() => {
  cy.resetE2eTestSession();
});
