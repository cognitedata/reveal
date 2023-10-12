// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    getBySelLike<E extends Node = HTMLElement>(
      selector: string
    ): Chainable<JQuery<E>>;
  }
}

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-testid*=${selector}]`, ...args);
});
