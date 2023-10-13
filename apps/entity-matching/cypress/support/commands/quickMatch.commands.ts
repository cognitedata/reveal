/* eslint-disable @typescript-eslint/no-explicit-any */

Cypress.Commands.add('quickRunModel', () => {
  cy.assertElementWithTextExists('next-button', 'Run model').click();
});

export interface QuickMatchCommands {
  quickRunModel(): Cypress.Chainable<any>;
}
