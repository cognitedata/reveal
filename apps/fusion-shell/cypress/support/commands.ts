import { baseUrl, project, cluster, tenant } from '../utils/config';
import '@testing-library/cypress/add-commands';
// Sometimes page loads a bit slow, and loaders displays for more than
// 4 sec causing tests to fail, this check will wait a bit longer (9 sec)
// if any loaders are present in the dom, making tests a lot more stable
Cypress.Commands.add('ensurePageFinishedLoading', () => {
  const timeoutInMs = 9000;

  // Make sure app has started loading elements,
  // or else checks below will pass before loaders are added to DOM
  cy.get('#root', { timeout: timeoutInMs })
    .children()
    .should('have.length.greaterThan', 0);

  // Make sure no loaders are present
  cy.get('.cogs-loader', { timeout: timeoutInMs }).should('not.exist');
  cy.get("[data-testid='data_model_loader']", {
    timeout: timeoutInMs,
  }).should('not.exist');
  cy.get("[data-cy='loader-container']", { timeout: timeoutInMs }).should(
    'not.exist'
  );
});

Cypress.Commands.add('createLink', (app) => {
  return `${baseUrl}/${project}/${app}?cluster=${cluster}`;
});

Cypress.Commands.add('navigate', (app) => {
  cy.setup();
  const url = `${baseUrl}/${project}/${app}?cluster=${cluster}`;
  cy.visit(url);
});

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-cy*=${selector}]`, ...args);
});

Cypress.Commands.add('setup', () => {
  cy.session(
    'inject access token & overide affected subapps',
    () => {
      overrideAffectedSubapps();
      injectAccessToken();
    },
    { cacheAcrossSpecs: true }
  );
});

function injectAccessToken() {
  cy.visit(baseUrl);
  cy.request({
    url: `https://login.microsoftonline.com/${encodeURIComponent(
      tenant
    )}/oauth2/v2.0/token`,
    method: 'POST',
    body: {
      grant_type: 'client_credentials',
      client_id: Cypress.env('CLIENT_ID'),
      client_secret: Cypress.env('CLIENT_SECRET'),
      scope: `https://${cluster}/.default`,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'no-cors': true,
    },
  }).then(({ body }) => {
    window.localStorage.setItem('CY_TOKEN', body.access_token);
  });
}

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
    cy.task('getSubappInfo', app).then((packageName: string | null) => {
      if (!packageName) {
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
