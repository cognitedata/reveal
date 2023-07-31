import { CLUSTER, PROJECT } from '../../app.constants';
import { cancelFrontendMetricsRequest } from '../../support/interceptions';

const filename = '15_9_19_A_1997_07_25';
describe.skip('Edit Favorites', () => {
  before(() => {
    cancelFrontendMetricsRequest();

    cy.deleteAllFavorites();

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });

  const goToFavoritesPage = () => {
    cy.log('go to Favorites page');
    cy.findByTestId('top-bar').findByRole('tab', { name: 'Favorites' }).click();
    cy.url().should('include', '/favorites');
  };

  describe('Name and Description', () => {
    const favoriteName = `favorite to edit, ${Date.now()}`;
    before(() => {
      cy.createFavorite({
        name: favoriteName,
      });

      goToFavoritesPage();
    });

    it('should be updated correctly', () => {
      // edit from the favorites list
      cy.log('Edit favorite from favorites list');
      cy.log('Click Edit button');
      cy.findByTestId(`menu-button-${favoriteName}`).trigger('mouseenter', {
        force: true,
      });

      cy.findByRole('button', { name: 'Edit' }).click({ force: true });
      cy.findByText('Edit set').should('be.visible');

      cy.log('Check that the Save Changes button is disabled without a change');
      cy.findByRole('button', { name: 'Save changes' }).should('be.disabled');

      cy.log('Update name and description');
      const editedName = `edited - ${favoriteName}`;
      cy.findByLabelText('Name').type('{selectall}').type(editedName);
      cy.findByLabelText('Description').type('Edited description');
      cy.findByRole('button', { name: 'Save changes' })
        .should('not.be.disabled')
        .click();

      cy.log('check the name is changed');
      cy.findByTestId(`favorite-card-${editedName}`).should('exist');
      cy.findByText(editedName).should('be.visible');

      // edit from favorite details
      cy.log('Edit from favorite details');
      cy.findByText(editedName).click();

      cy.log('Click Edit button');
      cy.findByLabelText('Edit').click({ force: true });

      const editedName2 = `edited 2 - ${favoriteName}`;
      cy.findByLabelText('Name').type('{selectall}').type(editedName2);
      cy.log('Save by pressing Enter');
      cy.findByLabelText('Name').type('{enter}');
      cy.findByText(editedName2).should('be.visible');
    });
  });

  describe('Content', () => {
    const favoriteName = `favorite to edit content, ${Date.now()}`;

    before(() => {
      cy.intercept({
        url: `https://${CLUSTER}.cognitedata.com/api/playground/projects/${PROJECT}/documents/search`,
        method: 'POST',
      }).as('documentSearch');

      cy.createFavorite({
        name: favoriteName,
      });
    });

    beforeEach(() => {
      cy.findByRole('heading', { name: 'Cognite Discover' }).click();

      cy.intercept({
        url: `/${PROJECT}/favorites/*/content`,
        method: 'PATCH',
      }).as('updateFavoriteContent');

      cy.intercept({
        url: `/${PROJECT}/favorites`,
        method: 'GET',
      }).as('getFavorites');

      cy.intercept({
        url: `/${PROJECT}/favorites/*`,
        method: 'GET',
      }).as('getOneFavorite');
    });

    it('should add and remove documents from content', () => {
      cy.performSearch(filename);
      cy.findByTestId('doc-result-table')
        .findAllByTestId('table-row')
        .first()
        .as('firstRow');

      cy.log('Select first row');
      cy.get('@firstRow').findAllByTestId('table-cell').first().click();

      cy.log('Click add to favorites button in bulk actions bar');
      cy.findByTestId('table-bulk-actions')
        .findByLabelText('Favorite all button')
        .click();

      cy.log('Add document to favorite');
      cy.findByRole('button', { name: favoriteName })
        .click({ force: true })
        .should('be.disabled');
      cy.wait('@updateFavoriteContent');

      goToFavoritesPage();
      cy.findByText(favoriteName).click();
      cy.url().should(
        'contain',
        `${Cypress.env('BASE_URL')}/${PROJECT}/favorites/`
      );
      cy.wait('@getOneFavorite');
      cy.wait('@documentSearch');

      cy.log('check documents is added to favorite');
      cy.findByTestId('favorite-documents-table')
        .findAllByTestId('table-row')
        .should('have.length', 1);

      cy.log('remove document from favorite');
      cy.findByTestId('favorite-documents-table')
        .findAllByTestId('table-row')
        .first()
        .children()
        .last()
        .children()
        .first()
        .invoke('attr', 'style', 'opacity: 1')
        .findByTestId('menu-button')
        .trigger('mouseenter', { force: true });

      cy.findByRole('button', { name: 'Remove' }).click({ force: true });
      cy.findByRole('button', { name: 'Delete' }).click();
      cy.wait('@updateFavoriteContent');

      cy.findByText(filename).should('not.exist');
    });

    // This in unstable, needs work
    it.skip('should add and remove wells and wellbores from content', () => {
      cy.log('Filter wells');
      cy.findByTestId('side-bar').findByText('Wells').click({ force: true });
      cy.findByText('Source').click({ force: true });
      cy.findByText('volve').click();

      cy.log('Add single wellbore by hovering');
      cy.findByTestId('table-cell-expanded')
        .findAllByTestId('table-row')
        .first()
        .children()
        .last()
        .children()
        .first()
        .invoke('attr', 'style', 'opacity: 1')
        .findByTestId('menu-button')
        .trigger('mouseenter', { force: true });

      cy.findByText('Add to favorites').trigger('mouseenter', { force: true });

      cy.findByRole('button', { name: favoriteName })
        .should('not.be.disabled')
        .click({ force: true })
        .should('be.disabled');

      cy.wait('@updateFavoriteContent');
      cy.wait('@getFavorites');
      cy.findByRole('button', { name: favoriteName }).should('be.disabled');

      cy.findAllByTestId('favorite-star-icon').should('have.length', 2);
      cy.findByTestId('well-result-table')
        .findAllByTestId('table-row')
        .first()
        .children()
        .eq(3)
        .click();
      cy.findByTestId('table-cell-expanded').should('not.exist');
      cy.findAllByTestId('favorite-star-icon').should('have.length', 1);

      cy.log('Add well through hover menu');
      cy.findByTestId('well-result-table')
        .findAllByTestId('table-row')
        .eq(1)
        .children()
        .last()
        .children()
        .first()
        .as('secondRow')
        .invoke('attr', 'style', 'opacity: 1')
        .findByTestId('menu-button')
        .trigger('mouseenter', { force: true });

      cy.findByText('Add to favorites').trigger('mouseenter', { force: true });

      cy.findByRole('button', { name: favoriteName })
        .should('not.be.disabled')
        .click({ force: true })
        .should('be.disabled');

      cy.wait('@updateFavoriteContent');
      cy.wait('@getFavorites');
      cy.get('@secondRow').invoke('attr', 'style', 'opacity: 0');

      cy.findAllByTestId('favorite-star-icon').should('have.length', 2);

      // add well and specific wellbores through selection
      cy.log('Add wells and wellbores through selection');

      cy.findByTestId('well-result-table')
        .findAllByTestId('table-row')
        .last()
        .children()
        .eq(1)
        .click();

      cy.findByTestId('table-cell-expanded')
        .findAllByTestId('table-row')
        .first()
        .findByTitle('Toggle Row Selected')
        .click();

      cy.findByTestId('well-result-table')
        .findAllByTestId('table-row')
        .eq(6)
        .findByTitle('Toggle Row Selected')
        .click();

      cy.findByTestId('table-bulk-actions')
        .findByTestId('welldata-favorite-all-button')
        .click();
      cy.findByRole('button', { name: favoriteName })
        .should('not.be.disabled')
        .click({ force: true })
        .should('be.disabled');

      goToFavoritesPage();
      cy.findByText(favoriteName).click();
      cy.findAllByRole('tab').last().click();
      cy.findByTestId('favorite-wells-table')
        .findAllByTestId('table-row')
        .should('have.length', 4);

      cy.log('Check if correct number of wellbores is assigned');

      // FIRST WELL
      cy.findByTestId('favorite-wells-table')
        .findAllByTestId('table-row')
        .first()
        .children()
        .eq(1)
        .click();

      cy.findAllByTestId('table-cell-expanded')
        .first()
        .findAllByTestId('table-row')
        .should('have.length', 1);

      // SECOND WELL
      cy.findByTestId('favorite-wells-table').findByText('F-1').click();
      cy.findAllByTestId('table-cell-expanded')
        .should('have.length', 2)
        .eq(1)
        .should('exist')
        .findAllByTestId('table-row')
        .should('have.length', 4);

      // THIRD WELL
      cy.findByTestId('favorite-wells-table').findByText('F-15').click();
      cy.findAllByTestId('table-cell-expanded')
        .should('have.length', 3)
        .eq(2)
        .should('exist')
        .findAllByTestId('table-row')
        .should('have.length', 5);

      // FOURTH WELL
      cy.findByTestId('favorite-wells-table').findByText('F-9').click();
      cy.findAllByTestId('table-cell-expanded')
        .should('have.length', 4)
        .eq(3)
        .should('exist')
        .findAllByTestId('table-row')
        .should('have.length', 1);

      // DELETE WELLBORES
      cy.log('Delete single wellbore from well');
      cy.findAllByTestId('table-cell-expanded')
        .should('have.length', 4)
        .eq(3)
        .findAllByTestId('table-row')
        .first()
        .children()
        .last()
        .children()
        .first()
        .invoke('attr', 'style', 'opacity: 1')
        .findByTestId('menu-button')
        .trigger('mouseenter', { force: true });

      cy.findByText('Remove from set').click({ force: true });
      cy.findByRole('button', { name: 'Remove' }).should('be.visible').click();
      cy.wait('@updateFavoriteContent');
      cy.wait('@getFavorites');

      // cy.findByTestId('favorite-wells-table')
      //   .findByText('F-9')
      //   .should('not.exist');
      // cy.findAllByTestId('table-cell-expanded').should('have.length', 3);

      cy.log('Delete single wellbore from well multiple wellbores');
      cy.findAllByTestId('table-cell-expanded')
        .eq(2)
        .findAllByTestId('table-row')
        .first()
        .children()
        .last()
        .children()
        .first()
        .invoke('attr', 'style', 'opacity: 1')
        .findByTestId('menu-button')
        .trigger('mouseenter', { force: true });

      cy.findByText('Remove from set').click({ force: true });
      cy.findByRole('button', { name: 'Remove' }).should('be.visible').click();
      cy.wait('@updateFavoriteContent');
      cy.wait('@getFavorites');

      // cy.findAllByTestId('table-cell-expanded').should('have.length', 3);
      // cy.findByTestId('favorite-wells-table')
      //   .findByText('Wellbore F-15')
      //   .should('not.exist');

      cy.log('Delete well with multiple wellbores');
      cy.findByTestId('favorite-wells-table')
        .findAllByTestId('table-row')
        .eq(3)
        .children()
        .last()
        .children()
        .first()
        .invoke('attr', 'style', 'opacity: 1')
        .findByTestId('menu-button')
        .trigger('mouseenter', { force: true });
      cy.findByText('Remove from set').click({ force: true });
      cy.findByRole('button', { name: 'Remove' }).should('be.visible').click();
      cy.wait('@updateFavoriteContent');
      // cy.wait('@getFavorites');

      // cy.findAllByTestId('table-cell-expanded').should('have.length', 2);
      // cy.findByTestId('favorite-wells-table')
      //   .findByText('F-1')
      //   .should('not.exist');
    });
  });
});
