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
    getBySel<E extends Node = HTMLElement>(
      selector: string
    ): Chainable<JQuery<E>>;
    getBySelLike<E extends Node = HTMLElement>(
      selector: string
    ): Chainable<JQuery<E>>;
    getCogsToast<E extends Node = HTMLElement>(
      type: 'success' | 'error'
    ): Chainable<JQuery<E>>;
    setQueryExplorerQuery(query: string): void;
    clickQueryExplorerExecuteQuery(): void;
    assertQueryExplorerResult(expectedResult: any, timeout?: number): void;
  }
}
//
// -- Helpers --
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

Cypress.Commands.add('clickQueryExplorerExecuteQuery', () => {
  // eslint-disable-next-line
  cy.wait(300);
  return cy.get('.execute-button').click();
});

Cypress.Commands.add('setQueryExplorerQuery', (query: string) => {
  // eslint-disable-next-line
  cy.wait(300);
  cy.window().then((window) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return window.g.getQueryEditor().setValue(query);
  });
});

Cypress.Commands.add(
  'assertQueryExplorerResult',
  (mockSuccess, timeout = 400) => {
    // eslint-disable-next-line
    cy.wait(timeout);
    return cy.window().then((w) => {
      // eslint-disable-next-line
      // @ts-ignore
      const value = w.g.resultComponent.viewer.getValue();
      expect(value).to.deep.equal(JSON.stringify(mockSuccess, null, 2));
    });
  }
);
