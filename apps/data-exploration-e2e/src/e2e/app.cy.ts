describe('data-exploration', () => {
  beforeEach(() => {
    cy.fusionLogin();
  });

  it('Should open Data Explorer from Home page', () => {
    cy.navigateToExplorer();
  });
});
