describe('App tests', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
  });

  it('Check page content', () => {
    cy.log('Checking for page content');
    cy.contains('Select a room');
  });

  it('Logout redirects to the main page', () => {
    cy.log('Open sidebar');
    cy.get('[aria-label="Open sidebar"]').click();

    cy.log('Click logout button');
    cy.get('button[aria-label="Logout"]').click();

    cy.location().should((location) => {
      expect(location.href.slice(0, -1)).eql(location.origin);
    });
  });
});
