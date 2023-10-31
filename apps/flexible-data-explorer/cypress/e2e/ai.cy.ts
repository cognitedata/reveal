describe('AI search', () => {
  it('should display ai welcome page', () => {
    cy.clickButton('Search using AI');
    cy.contains('Search for data using AI in').should('be.visible');
  });

  it('should allow search from suggestions', () => {
    cy.getBySel('search-bar').should('be.visible').click();
    cy.contains('Help me find all work orders').should('be.visible');
  });

  it('should allow search from text', () => {
    cy.performSearch('All workorders duration of 2 hours');
  });

  it('should show search results', () => {
    cy.getBySel('"WorkOrder-<PH> VEDLIKEHOLD AV PSD VENTILER *** (*** month)"')
      .should('be.visible')
      .should('contain.text', '2');
  });

  it('should show and change filters', () => {
    cy.clickButton('Inspect applied filter');
    cy.findByTestId('ai-query-builder')
      .should('be.visible')
      .should('contain.text', 'Equals')
      .should('contain.text', 'durationHours');
    cy.findByTestId('ai-filter-input').clear().type('3');
    cy.clickButton('Update filters');
    cy.findByTestId('ai-summary-filter-section').should('contain.text', '3');
  });

  it('should allow aggregation', () => {
    cy.performSearch('count of workorders by duration');
    cy.findByTestId('ai-chart').should('be.visible');
    cy.findByTestId('ai-summary').should(
      'contain.text',
      'Where durationHours is 2'
    );
  });
});
