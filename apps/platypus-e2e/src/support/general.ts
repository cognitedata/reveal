/* eslint-disable @typescript-eslint/no-explicit-any */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    ensurePageFinishedLoading(): void;
    getBySel<E extends Node = HTMLElement>(
      selector: string
    ): Chainable<JQuery<E>>;
    getBySelLike<E extends Node = HTMLElement>(
      selector: string
    ): Chainable<JQuery<E>>;
    getCogsToast<E extends Node = HTMLElement>(
      type: 'success' | 'error'
    ): Chainable<JQuery<E>>;
    mockUserToken(): void;
    selectSpace(name: string): void;
  }
}

//
// -- Helpers --

// Sometimes page loads a bit slow, and loaders displays for more than
// 4 sec causing tests to fail, this check will wait a bit longer (8 sec)
// if any loaders are present in the dom, making tests a lot more stable
Cypress.Commands.add('ensurePageFinishedLoading', () => {
  const increasedTimeout = 9000;

  // Make sure app has started loading elements,
  // or else checks below will pass before loaders are added to DOM
  cy.get('#root', { timeout: increasedTimeout })
    .children()
    .should('have.length.greaterThan', 0);

  // Make sure no loaders are present
  cy.get('.cogs-loader', { timeout: increasedTimeout }).should('not.exist');
  cy.get("[data-testid='data_model_loader']", {
    timeout: increasedTimeout,
  }).should('not.exist');
  cy.get("[data-cy='loader-container']", { timeout: increasedTimeout }).should(
    'not.exist'
  );
});

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-cy*=${selector}]`, ...args);
});

Cypress.Commands.add('getCogsToast', (type, ...args) => {
  const cogsTypeClass =
    type === 'success' ? 'cogs-toast-success' : 'cogs-toast-error';

  return cy.get(`.Toastify .${cogsTypeClass}`, ...args);
});

Cypress.Commands.add('mockUserToken', () => {
  cy.request('POST', 'http://localhost:4200/api/v1/token/inspect', {
    subject: 'OcJ9QWErtY35I-uzLiS2Razr7-i3ayRFG3oY5wbS-12345',
    projects: [
      {
        projectUrlName: 'platypus',
        groups: [123456789],
      },
    ],
    capabilities: [
      {
        dataModelsAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            dataModelScope: { externalIds: [] },
          },
          version: 1,
        },
        projectScope: {
          projects: ['platypus'],
        },
      },
      {
        dataModelInstancesAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            dataModelScope: { externalIds: [] },
          },
          version: 1,
        },
        projectScope: {
          projects: ['platypus'],
        },
      },
    ],
  });
});

Cypress.Commands.add('selectSpace', (name) => {
  cy.get('.cogs-select__placeholder').contains('Select space').click();
  cy.getBySel('create-space-btn').click();
  cy.getBySel('input-data-model-space').type(name);
  cy.getBySel('input-data-model-space')
    .parents('.cogs-modal')
    .find('.cogs-modal-footer-buttons > .cogs-button--type-primary')
    .should('be.visible')
    .click();
  // newly created space is auto selected, so we don't have to select it via dropdown again
  cy.getBySel('input-data-model-space').should('not.exist');
});
