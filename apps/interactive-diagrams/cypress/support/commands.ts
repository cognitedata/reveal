/* eslint-disable @typescript-eslint/no-var-requires */
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

const { targetAppPackageName } = require('../config');
const { getUrl } = require('../utils/getUrl');

// const { getUrl, targetAppPackageName } = require('../config');

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    getBySelector<E extends Node = HTMLElement>(
      selector: string,
      options?: Partial<Loggable & Timeoutable & Withinable & Shadow>
    ): Chainable<JQuery<E>>;
    getBySelLike<E extends Node = HTMLElement>(
      selector: string,
      options?: Partial<Loggable & Timeoutable & Withinable & Shadow>
    ): Chainable<JQuery<E>>;
    getCogsToast<E extends Node = HTMLElement>(
      type: 'success' | 'error'
    ): Chainable<JQuery<E>>;
    assertElementWithTextExists<E extends HTMLElement>(
      selector: string,
      text: string
    ): Chainable<JQuery<E>>;
    checkElementsExist<E extends Node = HTMLElement>(
      selectors: string[]
    ): Chainable<JQuery<E>>;
    visitAndLoadPage(): Chainable<any>;
  }
}

Cypress.Commands.add('getBySelector', (selector, ...args) => {
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

Cypress.Commands.add('assertElementWithTextExists', (selector, text) => {
  return cy.getBySelector(selector).should('exist').contains(text);
});

Cypress.Commands.add('checkElementsExist', (selectors) => {
  selectors.forEach((selector) => {
    cy.getBySelector(selector).should('exist');
  });
});

Cypress.Commands.add('visitAndLoadPage', () => {
  cy.visit(getUrl());
  cy.ensureSpaAppIsLoaded(targetAppPackageName);
  cy.ensurePageFinishedLoading();
});
