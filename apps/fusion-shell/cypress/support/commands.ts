import { getAppUrl } from '@fusion/shared/cypress'; // adds custom commands defined in shared cypress package

import { BASE_URL, PROJECT, CLUSTER } from '../utils/config';

import '@testing-library/cypress/add-commands';
// Sometimes page loads a bit slow, and loaders displays for more than
// 4 sec causing tests to fail, this check will wait a bit longer (9 sec)
// if any loaders are present in the dom, making tests a lot more stable
Cypress.Commands.add('ensurePageFinishedLoading', () => {
  const timeoutInMs = 20000;

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

Cypress.Commands.add('navigate', (subAppPath: string) => {
  const url = getAppUrl(BASE_URL, PROJECT, subAppPath, CLUSTER);
  cy.visit(url);
});
