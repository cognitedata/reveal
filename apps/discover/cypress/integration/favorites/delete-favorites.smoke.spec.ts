describe('Delete Favorites', () => {
  const favoriteToDelete = `favorite to delete, ${Date.now()}`;

  const goToFavoritesPage = () => {
    cy.log('go to Favorites page');
    cy.findByTestId('top-bar').findByRole('tab', { name: 'Favorites' }).click();
    cy.url().should('include', '/favorites');
  };

  before(() => {
    cy.deleteAllFavorites();
    cy.createFavorite({
      name: favoriteToDelete,
    });

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    goToFavoritesPage();
  });

  it('can be done from favorites list', () => {
    cy.log('Delete favorite');
    cy.findByTestId(`favorite-card-${favoriteToDelete}`)
      .findByLabelText('More options')
      .click();

    cy.findByRole('button', { name: 'Delete' }).click({ force: true });
    cy.findByRole('button', { name: 'Delete set' }).click();

    cy.findByTestId(`favorite-card-${favoriteToDelete}`).should('not.exist');
  });
});
