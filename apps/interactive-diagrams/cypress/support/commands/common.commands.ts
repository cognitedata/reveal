/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

const { targetAppPackageName } = require('../../config');
const { getUrl } = require('../../utils/getUrl');

Cypress.Commands.add('waitForPageToLoad', () => {
  const timeoutInMs = 20000;
  cy.get('.cogs-loader', { timeout: timeoutInMs }).should('not.exist');
  cy.get('.cogs-icon--type-loader', { timeout: timeoutInMs }).should(
    'not.exist'
  );
});

Cypress.Commands.add('getBySelector', (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

Cypress.Commands.add('assertElementWithTextExists', (selector, text) => {
  return cy.getBySelector(selector).should('exist').contains(text);
});

Cypress.Commands.add('visitAndLoadPage', () => {
  cy.visit(getUrl());
  cy.ensureSpaAppIsLoaded(targetAppPackageName);
  cy.waitForPageToLoad();
});

export interface CommonCommands {
  waitForPageToLoad(): void;

  getBySelector<E extends Node = HTMLElement>(
    selector: string,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ): Cypress.Chainable<JQuery<E>>;

  assertElementWithTextExists<E extends HTMLElement>(
    selector: string,
    text: string
  ): Cypress.Chainable<JQuery<E>>;

  visitAndLoadPage(): Cypress.Chainable<any>;
}
