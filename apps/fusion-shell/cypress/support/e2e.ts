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

import {
  AAD_IDP_INTERNAL_ID,
  AAD_PASSWORD,
  AAD_USERNAME,
  BASE_URL,
  PROJECT,
} from '../utils/config';

import './commands';
import { interceptProfileMe } from './interceptProfileMe';

Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('cluster not found')) {
    return false;
  }
});

function overrideAffectedSubapps() {
  const affectedAppsEnv = Cypress.env('AFFECTED_APPS');
  const pullRequestNumber = Cypress.env('PULL_REQUEST_NUMBER');
  if (!affectedAppsEnv) {
    // no affected apps, nothing to do
    return;
  }
  if (pullRequestNumber == null) {
    throw new Error('The env PULL_REQUEST_NUMBER is not set');
  }
  const affectedApps: string[] = JSON.parse(affectedAppsEnv);
  affectedApps.forEach((app) => {
    cy.task('getSubappInfo', app).then((packageName: unknown) => {
      if (!packageName || typeof packageName !== 'string') {
        // some apps are not subapps in Fusion, e.g. "platypus-cdf-cli"
        return;
      }
      const key = `import-map-override:${packageName}`;
      const previewUrl = `https://${app}-${pullRequestNumber}.fusion-preview.preview.cogniteapp.com/index.js`;
      cy.task('log', 'overriding subapp: ' + key + ': ' + previewUrl);
      window.localStorage.setItem(key, previewUrl);
    });
  });
}

before(() => {
  interceptProfileMe();

  cy.session(
    [AAD_USERNAME],
    () => {
      overrideAffectedSubapps();

      cy.loginWithAADUserCredentials(
        BASE_URL,
        AAD_IDP_INTERNAL_ID,
        PROJECT,
        AAD_USERNAME,
        AAD_PASSWORD
      );
    },
    { cacheAcrossSpecs: true }
  );
});
