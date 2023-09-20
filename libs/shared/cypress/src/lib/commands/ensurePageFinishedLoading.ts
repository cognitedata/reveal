// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    ensurePageFinishedLoading(): void;
  }
}

Cypress.Commands.add('ensurePageFinishedLoading', () => {
  const timeoutInMs = 9000;

  // This should be improved https://cognitedata.slack.com/archives/C011E10CW2F/p1695049076764719
  cy.get('.cogs-loader', { timeout: timeoutInMs }).should('not.exist');

  cy.get('.cogs-icon--type-loader', { timeout: timeoutInMs }).should(
    'not.exist'
  );
});
