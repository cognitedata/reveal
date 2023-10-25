/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
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
    getCogsToast<E extends Node = HTMLElement>(
      type: 'success' | 'error'
    ): Chainable<JQuery<E>>;
    getBySel<E extends Node = HTMLElement>(
      selector: string
    ): Chainable<JQuery<E>>;
  }
}

Cypress.Commands.add('ensurePageFinishedLoading', () => {
  const timeoutInMs = 10000;

  // Make sure app has started loading elements,
  // or else checks below will pass before loaders are added to DOM
  cy.get('#root', { timeout: timeoutInMs })
    .children()
    .should('have.length.greaterThan', 0);
});
