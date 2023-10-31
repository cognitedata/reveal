describe('Three-D', () => {
  before(() => {
    cy.performEmptySearch();
  });

  it('Should be able to navigate to the 3D ', () => {
    cy.clickIconButton('3D view');
    cy.findByTestId('three-d-canvas').should('be.visible');

    cy.goBack();
  });
});
