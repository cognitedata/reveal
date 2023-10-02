describe('Pending Interactive Diagrams', () => {
  beforeEach(() => {
    cy.visitAndLoadPage();
  });

  it('Renders no pending interactive diagrams page', () => {
    cy.assertElementWithTextExists(
      'breadcrumb-item',
      'Interactive engineering diagrams'
    );
    cy.assertElementWithTextExists(
      'pending-diagrams-title',
      'Pending interactive diagrams'
    );

    cy.getBySelector('create-new-interactive-diagrams-button').should('exist');
  });
});
