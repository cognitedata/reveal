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
