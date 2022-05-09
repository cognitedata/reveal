describe('Wells: result_table', () => {
  beforeEach(() => {
    cy.deleteAllFavorites();
    cy.deleteAllSavedSearches();
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });

  const createFavorite = (name: string) => {
    cy.findByLabelText('Name').type(name);
    cy.findByLabelText('Description').type('Some description');
    cy.findByRole('button', { name: 'Create' }).click();
  };

  it('Should be able to add search result into a saved search', () => {
    const savedSearchName = `Test saved search`;
    cy.performSearch('');
    cy.goToTab('Wells');
    cy.selectFirstWellInResults();

    cy.log(`click on saved searches button`);
    cy.get('[aria-label="saved search"]').click({ force: true });

    cy.log(`Create new window should appear `);
    cy.findByText('Create new').should('be.visible');

    cy.log(`Should be able to create a saved search`);
    cy.createNewSavedSearch(savedSearchName);
    cy.findByText('Saved search added').should('be.visible');

    cy.log(`navigate to saved search tab`);
    cy.goToSavedSearches();

    cy.log(`Created saved search should display on the table`);
    cy.findByTitle(savedSearchName).should('be.visible');

    cy.log('hoover on created saved search name');
    cy.findAllByTestId('table-row').invoke('show');

    cy.log('click view button');
    cy.findByTestId('button-view-saved-search').click({ force: true });

    cy.log('navigate to wells tab');
    cy.goToTab('Wells');

    cy.findByText('Loading saved search.').should('be.visible');
    cy.checkIfNthRowIsSelected(0);
  });

  it('Should be able to add searched result in to a existing favorite folder', () => {
    const favoriteName = `Test favorite`;

    cy.log('create new favorite');
    cy.goToFavoritesPage();
    cy.log('Create a new Favorite Set by pressing the "Create set" button');
    cy.findByLabelText('Plus').should('be.visible').click();
    cy.findByText('Create new set').should('be.visible');
    createFavorite(favoriteName);

    cy.log('navigate to search tab');
    cy.findByRole('tab', { name: 'Search' }).click();

    cy.performSearch('');
    cy.goToTab('Wells');
    cy.selectFirstWellInResults();

    cy.findAllByTestId('table-row')
      .first()
      .children()
      .last()
      .children()
      .first()
      .invoke('attr', 'style', 'opacity: 1');

    cy.findAllByTestId('menu-button')
      .eq(0)
      .trigger('mouseenter', { force: true });

    cy.findByText('Add to favorites').click({ force: true });

    cy.get('button').contains(favoriteName).click({ force: true });

    cy.goToFavoritesPage();

    cy.findByTitle(favoriteName).should('be.visible').click();
    cy.findByTestId('favorite-details-content-navigation')
      .findAllByRole('tab')
      .eq(1)
      .click();

    cy.findByTestId('favorite-wells-table')
      .findAllByTestId('table-row')
      .should('have.length', 1);
  });
});
