// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    ensureSpaAppIsLoaded(name: string): void;
  }
}

Cypress.Commands.add('ensureSpaAppIsLoaded', (name) => {
  const timeoutInMs = 10000;

  // Cypress throws error when using #id when id contains @, so we use [id=].
  cy.get(`[id="single-spa-application:${name}"]`, {
    timeout: timeoutInMs,
  })
    .children()
    .should('have.length.greaterThan', 0);
});
