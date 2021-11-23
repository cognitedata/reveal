describe('Favorites', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.log('Create 2 Favorites just for testing purposes');
    cy.createFavorite({ name: `Favorite: ${Date.now()}` });
    cy.createFavorite({ name: `Favorite: ${Date.now()}` });
  });
  it('this is demo', () => {
    cy.log('Go to favorites page');
    cy.findByTestId('top-bar')
      .findByRole('link', { name: 'Favorites' })
      .click();
    cy.url().should('include', '/favorites');

    cy.log('Check that we get the same number of favorites from API');
    cy.listFavorites().should((res) => {
      cy.findByTestId('favorite-card-container')
        .findAllByTestId(/^favorite-card-/)
        .should('have.length', res.body.length);
    });
  });
});
