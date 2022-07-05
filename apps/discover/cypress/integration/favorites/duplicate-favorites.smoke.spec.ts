import {
  DOCUMENTS_SEARCH_ALIAS,
  DUPLICATE_FAVORITE_ALIAS,
  GET_FAVORITES_ALIAS,
  interceptDocumentsSearch,
  interceptDuplicateFavorite,
  interceptGetFavorites,
  interceptWellsByIds,
  WELLS_BY_IDS_ALIAS,
} from '../../support/interceptions';

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

    interceptGetFavorites();
    interceptDocumentsSearch();
    interceptWellsByIds();
    interceptDuplicateFavorite();

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    goToFavoritesPage();
    cy.wait(`@${GET_FAVORITES_ALIAS}`);
  });

  it('can be done from favorites list', () => {
    cy.log('Duplicate favorite');
    cy.findByTestId(`favorite-card-${favoriteToDuplicate}`)
      .findByLabelText('More options')
      .click();

    cy.findByTestId(`dropdown-menu-${favoriteToDuplicate}`).should(
      'be.visible'
    );

    cy.findByTestId(`dropdown-menu-${favoriteToDuplicate}`)
      .findByRole('button', { name: 'Duplicate' })
      .click({ force: true });
    cy.findByRole('button', { name: 'Cancel' }).click();

    cy.findByTestId(`favorite-card-${favoriteToDuplicate}`)
      .findByLabelText('More options')
      .click();

    cy.findByTestId(`dropdown-menu-${favoriteToDuplicate}`)
      .findByRole('button', { name: 'Duplicate' })
      .click({ force: true });
    cy.findByLabelText('Name')
      .as('nameInput')
      .should('have.value', `${favoriteToDuplicate} (Duplicate)`);

    cy.get('@nameInput').type('{selectall}').type('Duplicated favorite');
    cy.findByLabelText('Description').type('With some description');
    cy.findByRole('button', { name: 'Create' }).click();

    cy.wait(`@${DUPLICATE_FAVORITE_ALIAS}`)
      .its('response.statusCode')
      .should('eq', 200);
    cy.wait(`@${GET_FAVORITES_ALIAS}`);

    cy.log('check that favorite is created with content');
    cy.findByTitle('Duplicated favorite').should('be.visible').click();
    cy.wait(`@${DOCUMENTS_SEARCH_ALIAS}`);
    cy.wait(`@${WELLS_BY_IDS_ALIAS}`);
    cy.findByRole('tab', {
      name: /documents 1/i,
    }).should('be.visible');

    cy.findByRole('tab', {
      name: /wells 1/i,
    }).should('be.visible');
  });
});
