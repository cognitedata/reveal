describe('Map', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });

  it('should visible the floating action buttons properly', () => {
    cy.log('click on draw polygon button');
    cy.findByTestId('freedraw-button').click();

    cy.log('waiting for load the map completely');
    cy.wait(2000);

    cy.log('draw the polygon');
    cy.findAllByRole('region')
      .first()
      .as('map')
      .should('be.visible')
      .click(300, 300);
    cy.get('@map').click('bottomRight', { force: true });
    cy.get('@map').click(300, 500);

    cy.log('type enter to finish the edit ');
    cy.get('@map').type('{enter}');

    cy.log('checking the visibility of floating action buttons');
    cy.findByTestId('floating-search-button').should('be.visible');
    cy.findByTestId('floating-delete-button').should('be.visible');
  });
});
