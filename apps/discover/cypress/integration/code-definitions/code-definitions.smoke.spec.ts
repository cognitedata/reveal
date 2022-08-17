import { PROJECT } from '../../app.constants';
import { cancelFrontendMetricsRequest } from '../../support/interceptions';

describe('Project Config', () => {
  beforeEach(() => {
    cancelFrontendMetricsRequest();
    cy.visit(Cypress.env('BASE_URL'));
  });

  it('cannot be accessed by a normal user', () => {
    cy.login();

    cy.url().should('include', '/search');
    cy.checkAdminSettingsIsNotVisible();
    cy.checkUserCannotAccessPage('admin/legend');
  });

  it('can be accessed by Admin to update different project configs', () => {
    cy.intercept({
      url: '*/user/roles*',
      method: 'GET',
    }).as('getUserRoles');

    cy.loginAsAdmin();
    cy.acceptCookies();

    cy.log('Check that we can access the page directly through the url');
    cy.visit(`${Cypress.env('BASE_URL')}/${PROJECT}/admin/legend`);
    cy.wait('@getUserRoles');
    cy.url().should('include', '/admin/legend');
    cy.visit(`${Cypress.env('BASE_URL')}/${PROJECT}`);

    cy.log('Check that the "Code Definitions" button is visible');
    cy.findByTestId('top-bar')
      .contains('Admin Settings')
      .should('be.visible')
      .click();
    cy.contains('Code Definitions').should('be.visible').click();
    cy.url().should('include', '/admin/legend');

    cy.log('The default General category should be open');
    cy.findAllByText('NPT Codes').should('be.visible');

    cy.log('Open NPT subcode category');
    cy.findByTestId('left-panel')
      .should('be.visible')
      .findByText('NPT Subcode')
      .should('be.visible')
      .click();
    cy.findByTestId('right-panel')
      .should('be.visible')
      .findAllByText('NPT Subcode')
      .should('be.visible');
  });
});
