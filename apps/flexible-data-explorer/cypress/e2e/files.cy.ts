describe('Files', () => {
  before(() => {
    cy.performEmptySearch();
    cy.selectSearchCategory('File');
  });

  it('Should be able to preview file', () => {
    const file = 'sol_166.xlsx';

    cy.containsExact(file).click();

    cy.findByTestId('page-header').containsExact('File').should('be.visible');

    cy.findByTestId('page-header').containsExact(file).should('be.visible');

    cy.findByText('File preview').should('be.visible');
    cy.findByText('Properties').should('be.visible');

    cy.goBack();
    cy.findByTestId('file-results').should('exist');
  });
});
