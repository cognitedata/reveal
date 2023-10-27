const GENERIC_CATEGORIES = ['Person', 'Actor', 'Movie', 'Director', 'Review'];

describe('Search categories', () => {
  it('should perform global search using category card', () => {
    const category = 'Person';

    cy.findAllByTestId('category-card')
      .containsExact(category)
      .should('be.visible')
      .click();

    cy.findByTestId(`generic-results-${category}`)
      .findByTestId('search-results-header')
      .containsExact(category)
      .should('be.visible');

    cy.goBack();
  });

  it('should perform global search', () => {
    const category = 'Person';

    cy.performGlobalSearchCategory(category);
    cy.findByTestId(`generic-results-${category}`)
      .findByTestId('search-results-header')
      .containsExact(category)
      .should('be.visible');

    cy.goBack();
    cy.removeCategory(category);
  });

  it('should be able to view all search results', () => {
    cy.performEmptySearch();
    cy.selectSearchCategory('All');

    GENERIC_CATEGORIES.forEach((category) => {
      cy.findByTestId(`generic-results-${category}`)
        .findByTestId('search-results-header')
        .scrollIntoView()
        .containsExact(category)
        .should('be.visible');
    });

    cy.findByTestId('timeseries-results')
      .findByTestId('search-results-header')
      .scrollIntoView()
      .containsExact('Time series')
      .should('be.visible');

    cy.findByTestId('file-results')
      .findByTestId('search-results-header')
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
        .findByTestId('search-results-header')
        .containsExact(category)
        .should('be.visible');
    });
  });

  it('should be able to view timeseries results', () => {
    cy.selectSearchCategory('Time series');
    cy.findByTestId('timeseries-results')
      .findByTestId('search-results-header')
      .containsExact('Time series')
      .should('be.visible');
  });

  it('should be able to view file results', () => {
    cy.selectSearchCategory('File');
    cy.findByTestId('file-results')
      .findByTestId('search-results-header')
      .containsExact('Files')
      .should('be.visible');
  });
});
