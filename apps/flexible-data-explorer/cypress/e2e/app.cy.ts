describe('flexible-data-explorer', () => {
  before(() => {
    cy.navigateToApp();
    cy.setupDataModelSelection();
  });

  it('should display welcome page', () => {
    cy.contains('Search for data').should('be.visible');
  });
});
