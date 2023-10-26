describe('flexible-data-explorer', () => {
  it('should display welcome page', () => {
    cy.contains('Search for data').should('be.visible');
  });
});
