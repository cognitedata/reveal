// This should be fixed and enabled
describe.skip('AI search', () => {
  it('should display ai welcome page', () => {
    cy.clickButton('Search using AI');
    cy.contains('Search for data using AI in').should('be.visible');
  });

  it('should allow search from suggestions', () => {
    cy.getBySel('search-bar').should('be.visible').click();
    cy.contains('Help me find all directors').should('be.visible');
  });

  it('should allow search from text', () => {
    cy.performSearch('All movies made in 2012');
  });

  it('should show search results', () => {
    cy.getBySel('Movie-Argo')
      .should('be.visible')
      .should('contain.text', 'MovieArgo')
      .should('contain.text', '2012');
  });

  it('should show and change filters', () => {
    cy.clickButton('Inspect applied filter');
    cy.findByTestId('ai-query-builder')
      .should('be.visible')
      .should('contain.text', 'Equals')
      .should('contain.text', 'releasedYear');
    cy.findByTestId('ai-filter-input').clear().type('2014');
    cy.clickButton('Update filters');
    cy.findByTestId('ai-summary-filter-section').should('contain.text', '2014');
  });

  it('should allow aggregation', () => {
    cy.performSearch('count of movies made in 2010s');
    cy.findByTestId('ai-chart').should('be.visible');
    cy.findByTestId('ai-summary').should(
      'contain.text',
      'Where releasedYear is 2014'
    );
  });
});
