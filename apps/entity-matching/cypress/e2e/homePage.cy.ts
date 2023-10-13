describe('Home Page', () => {
  beforeEach(() => {
    cy.visitAndLoadPage();
  });

  it('should have all basic components', () => {
    cy.assertElementWithTextExists('home-title', 'Entity Matching pipelines');
    cy.getBySelector('top-row').should('exist');
    cy.getBySelector('pipelines').should('exist');
  });
});
