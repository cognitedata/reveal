// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    ensurePageFinishedLoading(): void;
  }
}

// TODO remove data_model_loader - only applies to platypus?
Cypress.Commands.add('ensurePageFinishedLoading', () => {
  const timeoutInMs = 9000;

  // Make sure app has started loading elements,
  // or else checks below will pass before loaders are added to DOM
  cy.get('#root', { timeout: timeoutInMs })
    .children()
    .should('have.length.greaterThan', 0);

  // This should be updated to use data-testid instead of class
  cy.get('.cogs-icon--type-loader', { timeout: timeoutInMs }).should(
    'not.exist'
  );
  cy.get("[data-testid='data_model_loader']", {
    timeout: timeoutInMs,
  }).should('not.exist');
  cy.get("[data-cy='loader-container']", { timeout: timeoutInMs }).should(
    'not.exist'
  );
});
