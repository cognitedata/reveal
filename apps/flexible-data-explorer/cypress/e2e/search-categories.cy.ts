const GENERIC_CATEGORIES = ['Person', 'Actor', 'Movie', 'Director', 'Review'];

describe('Search categories', () => {
  before(() => {
    cy.navigateToApp();
    cy.setupDataModelSelection();
    cy.performEmptySearch();
  });

  it('should be able to view all search results', () => {
    cy.selectSearchCategory('All');

    GENERIC_CATEGORIES.forEach((category) => {
      cy.findByTestId(`generic-results-${category}`)
        .scrollIntoView()
        .containsExact(category)
        .should('be.visible');
    });

    cy.findByTestId('timeseries-results')
      .scrollIntoView()
      .containsExact('Time series')
      .should('be.visible');

    cy.findByTestId('file-results')
      .scrollIntoView()
      .containsExact('Files')
      .should('be.visible');

    // Scroll back to top
    cy.findByTestId('search-categories').scrollIntoView();
  });

  it('should be able to view generic search results', () => {
    GENERIC_CATEGORIES.forEach((category) => {
      cy.selectSearchCategory(category);
      cy.findByTestId(`generic-results-${category}`)
        .containsExact(category)
        .should('be.visible');
    });
  });

  it('should be able to view timeseries results', () => {
    cy.selectSearchCategory('Time series');
    cy.findByTestId('timeseries-results')
      .containsExact('Time series')
      .should('be.visible');
  });

  it('should be able to view file results', () => {
    cy.selectSearchCategory('File');
    cy.findByTestId('file-results').containsExact('Files').should('be.visible');
  });
});
