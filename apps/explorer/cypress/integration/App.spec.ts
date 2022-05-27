describe('App tests', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
  });

  it('Check page content', () => {
    cy.log('Checking for page content');
    cy.contains('What are you looking for?');
  });
});
