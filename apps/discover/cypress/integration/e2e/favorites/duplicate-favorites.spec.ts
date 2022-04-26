import { PROJECT } from '../../../app.constants';

describe('Duplicate Favorites', () => {
  const favoriteToDuplicate = `favorite to duplicate, ${Date.now()}`;

  const goToFavoritesPage = () => {
    cy.log('go to Favorites page');
    cy.findByTestId('top-bar').findByRole('tab', { name: 'Favorites' }).click();
    cy.url().should('include', '/favorites');
  };

  before(() => {
    cy.deleteAllFavorites();
    cy.createFavorite({
      name: favoriteToDuplicate,
      content: {
        documentIds: [6372919362425870],
        wells: {
          'a6cd65a-a323-4607-afb3-8e2362ae60b6': [],
        },
      },
    });

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    goToFavoritesPage();
  });

  it('can be done from favorites list', () => {
    cy.intercept({
      url: `/${PROJECT}/favorites/duplicate/*`,
      method: 'POST',
    }).as('duplicateFavorite');

    cy.intercept({
      url: `/${PROJECT}/favorites`,
      method: 'GET',
    }).as('getFavorites');

    cy.log('Duplicate favorite');
    cy.findByTestId(`favorite-card-${favoriteToDuplicate}`)
      .findByLabelText('More options')
      .trigger('mouseenter');

    cy.findByRole('button', { name: 'Duplicate' }).click({ force: true });
    cy.findByRole('button', { name: 'Cancel' }).click();

    cy.findByTestId(`favorite-card-${favoriteToDuplicate}`)
      .findByLabelText('More options')
      .trigger('mouseenter');

    cy.findByRole('button', { name: 'Duplicate' }).click({ force: true });
    cy.findByLabelText('Name')
      .as('nameInput')
      .should('have.value', `${favoriteToDuplicate} (Duplicate)`);

    cy.get('@nameInput').type('{selectall}').type('Duplicated favorite');
    cy.findByLabelText('Description').type('With some description');
    cy.findByRole('button', { name: 'Create' }).click();

    cy.wait('@duplicateFavorite');
    cy.wait('@getFavorites');

    cy.log('check that favorite is created with content');
    cy.findByText('Duplicated favorite').should('be.visible').click();
    cy.findByRole('tab', {
      name: /documents 1/i,
    }).should('be.visible');

    cy.findByRole('tab', {
      name: /wells 1/i,
    }).should('be.visible');
  });
});
