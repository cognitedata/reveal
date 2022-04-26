describe('example', () => {
  before(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });

  it('should go to google.com', () => {
    cy.log('My test runs here');
  });
});
