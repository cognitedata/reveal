export default () => {
  cy.visit(Cypress.env('BASE_URL'));
  cy.contains('Login with Fake IDP (azure-dev)').click();
};
