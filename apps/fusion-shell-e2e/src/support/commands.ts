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
    ensurePageFinishedLoading(): void;
    createLink(navigateTo: string): string;
    navigate(navigateTo: string): void;
    getBySel<E extends Node = HTMLElement>(
      selector: string
    ): Chainable<JQuery<E>>;
    getBySelLike<E extends Node = HTMLElement>(
      selector: string
    ): Chainable<JQuery<E>>;
  }
}

// -- This is a parent command --

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

const organization = 'cog-dss';
const project = 'dss-dev';
const cluster = 'greenfield.cognitedata.com';
const baseUrl = `https://${organization}.local.cognite.ai:4200`;

Cypress.Commands.add('createLink', (app) => {
  return `${baseUrl}/${project}/${app}?cluster=${cluster}`;
});

Cypress.Commands.add('navigate', (app) => {
  const url = `${baseUrl}/dss-dev/${app}?cluster=${cluster}`;
  cy.visit(url);
});

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-cy*=${selector}]`, ...args);
});
