import { CLUSTER, USER_PREFIX } from '../../support/constants';

describe('Share Favorites', () => {
  const favoriteName = `shared favorite, ${Date.now()}`;

  before(() => {
    cy.createFavorite({
      name: favoriteName,
    });

    cy.intercept({
      url: `https://user-management-service.staging.${CLUSTER}.cognite.ai/user/sync`,
      method: 'POST',
    }).as('userSync');

    cy.visit(Cypress.env('BASE_URL'));
  });

  const goToFavoritesPage = () => {
    cy.log('go to Favorites page');
    cy.findByTestId('top-bar').findByRole('tab', { name: 'Favorites' }).click();
    cy.url().should('include', '/favorites');
  };

  it('from Favorites Page', () => {
    cy.loginAsAdmin(); // we do this so the sync registers the user
    cy.wait('@userSync');
    cy.logout();
    cy.login();
    goToFavoritesPage();

    cy.log('Share favorite with admin');
    cy.findByTestId(`menu-button-${favoriteName}`).trigger('mouseenter', {
      force: true,
    });

    cy.findByRole('button', { name: 'Share' }).click({ force: true });
    cy.findByTestId('shared-user-input')
      .should('be.visible')
      .type(Cypress.env('REACT_APP_E2E_USER'));
    cy.findByText(`Admin User ${USER_PREFIX.toUpperCase()}`)
      .should('exist')
      .should('be.visible')
      .click();
    cy.findByLabelText('Share').click();
    cy.findByRole('dialog').type('{esc}');

    cy.log('logout as normal user and login as admin');
    cy.logout();
    cy.loginAsAdmin();

    cy.log('Check that we have the shared favorite');
    goToFavoritesPage();
    cy.findByText(favoriteName).should('exist');

    cy.log('Check that we cannot share it with others');
    cy.findByTestId(`menu-button-${favoriteName}`).trigger('mouseenter', {
      force: true,
    });
    cy.findByRole('button', { name: 'Share' }).should('not.exist');
    cy.findByRole('button', { name: 'Duplicate' }).should('exist');

    cy.log('Remove share');
    cy.logout();
    cy.login();
    goToFavoritesPage();
    cy.findByText(favoriteName).click();
    cy.findByLabelText('Share').click();
    cy.findAllByLabelText('Remove').click();
  });
});
