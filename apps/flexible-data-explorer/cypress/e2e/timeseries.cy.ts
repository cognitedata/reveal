describe('Timeseries ', () => {
  before(() => {
    cy.performEmptySearch();
    cy.selectSearchCategory('Time series');
  });

  it('Should be able to preview timeseries ', () => {
    const timeseries = '12ws';

    cy.containsExact(timeseries).click();

    cy.findByTestId('page-header')
      .containsExact('Timeseries')
      .should('be.visible');

    cy.findByTestId('page-header')
      .containsExact(timeseries)
      .should('be.visible');

    cy.findByText('Chart preview').should('be.visible');
    cy.findByText('Properties').should('be.visible');

    cy.goBack();
    cy.findByTestId('timeseries-results').should('exist');
  });
});
