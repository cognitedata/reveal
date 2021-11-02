Cypress.Commands.add('login', () => {
  cy.contains('Login with Fake IDP (Bluefield User)').click();
});

export interface LoginCommand {
  login(): Cypress.Chainable<void>;
}
