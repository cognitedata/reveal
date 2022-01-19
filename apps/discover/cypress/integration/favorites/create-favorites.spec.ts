describe('Creating Favorites', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });

  const createFavorite = (name: string) => {
    cy.findByLabelText('Name').type(name);
    cy.findByLabelText('Description').type('Some description');
    cy.findByRole('button', { name: 'Create' }).click();
  };

  const goToFavoritesPage = () => {
    cy.log('go to Favorites page');
    cy.findByTestId('top-bar').findByRole('tab', { name: 'Favorites' }).click();
    cy.url().should('include', '/favorites');
  };

  const checkFavoriteIsCreated = (name) => {
    cy.log('Check if favorite is created');
    cy.findByText('Favorite set created').should('be.visible');
    cy.findByText(name).should('be.visible');
  };

  const checkFavoriteContainsDocument = (favoriteName) => {
    cy.log('Check if favorite is created with the document');
    cy.findByText(favoriteName).should('be.visible').click();
    cy.findByTestId('favorite-documents-table')
      .findAllByTestId('table-row')
      .should('have.length', 1);
  };

  const checkFavoriteContainsWell = (favoriteName) => {
    cy.log('Check if favorite is created with the well');
    cy.findByText(favoriteName).should('be.visible').click();
    cy.findByTestId('favorite-details-content-navigation')
      .findAllByRole('tab')
      .eq(1)
      .click();

    cy.findByTestId('favorite-wells-table')
      .findAllByTestId('table-row')
      .should('have.length', 1);
  };

  describe('Favorites Page', () => {
    it('has the option to create favorites from  here', () => {
      goToFavoritesPage();
      cy.log('Create a new Favorite Set by pressing the "Create set" button');
      cy.findByLabelText('Plus').should('be.visible').click();
      cy.findByText('Create new set').should('be.visible');

      const favoriteName = `Favorite from Page, ${Date.now()}`;
      createFavorite(favoriteName);

      checkFavoriteIsCreated(favoriteName);
    });
  });

  describe('Document results page', () => {
    it('Create favorite from Document results hover on item', () => {
      cy.performSearch('');

      cy.findByTestId('doc-result-table')
        .findAllByTestId('table-row')
        .first()
        .children()
        .last()
        .children()
        .first()
        .invoke('attr', 'style', 'opacity: 1')
        .findByTestId('menu-button')
        .trigger('mouseenter', { force: true });

      cy.findByText('Add to favorites').trigger('mouseenter', {
        force: true,
      });

      cy.findByText('Create new Set').click({ force: true });
      cy.findByText('Create new set').should('be.visible');

      const favoriteName = `Favorite from DocumentResult hover, ${Date.now()}`;
      createFavorite(favoriteName);
      goToFavoritesPage();
      checkFavoriteIsCreated(favoriteName);
      checkFavoriteContainsDocument(favoriteName);
    });

    it('Create favorite from Document results bulk actions', () => {
      cy.performSearch('');
      cy.findByTestId('doc-result-table')
        .findAllByTestId('table-row')
        .first()
        .children()
        .first()
        .click();

      const favoriteName = `Favorite from DocumentResult bulk actions, ${Date.now()}`;

      cy.findByTestId('table-bulk-actions')
        .findByTestId('document-favorite-all-button')
        .should('be.visible')
        .click();

      cy.findByText('Create new Set').click({ force: true });
      cy.findByText('Create new set').should('be.visible');
      createFavorite(favoriteName);
      goToFavoritesPage();
      checkFavoriteIsCreated(favoriteName);
      checkFavoriteContainsDocument(favoriteName);
    });
  });

  describe('Well results page', () => {
    it('Create favorite from Well results hover on well', () => {
      cy.performSearch('');
      cy.findByRole('tab', { name: 'Wells' }).click();

      cy.findByTestId('well-result-table')
        .findAllByTestId('table-row')
        .first()
        .children()
        .last()
        .children()
        .first()
        .invoke('attr', 'style', 'opacity: 1')
        .findByTestId('menu-button')
        .trigger('mouseenter', { force: true });

      cy.findByText('Add to favorites').trigger('mouseenter', {
        force: true,
      });

      cy.findByText('Create new Set').click({ force: true });
      cy.findByText('Create new set').should('be.visible');

      const favoriteName = `Favorite from WellResult hover well, ${Date.now()}`;
      createFavorite(favoriteName);
      goToFavoritesPage();
      checkFavoriteIsCreated(favoriteName);
      checkFavoriteContainsWell(favoriteName);
    });

    it('Create favorite from Well results hover on wellbore', () => {
      cy.performSearch('');
      cy.findByRole('tab', { name: 'Wells' }).click();
      cy.findByTestId('well-result-table')
        .findAllByTestId('table-cell-expanded')
        .first()
        .findAllByTestId('table-row')
        .first()
        .children()
        .last()
        .children()
        .first()
        .invoke('attr', 'style', 'opacity: 1')
        .findByTestId('menu-button')
        .trigger('mouseenter', { force: true });

      cy.findByText('Add to favorites').trigger('mouseenter', {
        force: true,
      });

      cy.findByText('Create new Set').click({ force: true });
      cy.findByText('Create new set').should('be.visible');

      const favoriteName = `Favorite from WellResult hover wellbore, ${Date.now()}`;
      createFavorite(favoriteName);
      goToFavoritesPage();
      checkFavoriteIsCreated(favoriteName);
      checkFavoriteContainsWell(favoriteName);
    });

    it('Create favorite from Well results bulk actions', () => {
      cy.performSearch('');
      cy.findByRole('tab', { name: 'Wells' }).click();

      cy.findByTestId('well-result-table')
        .findAllByTestId('table-row')
        .first()
        .children()
        .first()
        .click();

      cy.findByTestId('table-bulk-actions')
        .findByTestId('welldata-favorite-all-button')
        .click();

      cy.findByText('Create new Set').click({ force: true });
      cy.findByText('Create new set').should('be.visible');

      const favoriteName = `Favorite from WellResult bulk actions, ${Date.now()}`;
      createFavorite(favoriteName);
      goToFavoritesPage();
      checkFavoriteIsCreated(favoriteName);
      checkFavoriteContainsWell(favoriteName);
    });
  });
});
