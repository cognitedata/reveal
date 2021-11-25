import { PROJECT } from '../../support/constants';

describe('Project Config', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
  });

  it('cannot be accessed from a normal user', () => {
    cy.login();

    cy.url().should('include', '/search');
    cy.checkAdminSettingsIsNotVisible();
    cy.checkUserCannotAccessPage('admin/projectConfig');
  });

  it('can be accessed by Admin to update different project configs', () => {
    cy.intercept({
      url: '*/user/roles*',
      method: 'GET',
    }).as('getUserRoles');
    cy.loginAsAdmin();

    /**
     * Will enable this in another PR
     * */
    cy.log('Check that we can access the page directly through the url');
    cy.visit(`${Cypress.env('BASE_URL')}/${PROJECT}/admin/projectConfig`);
    cy.wait('@getUserRoles');
    cy.url().should('include', '/admin/projectConfig');
    cy.visit(`${Cypress.env('BASE_URL')}/${PROJECT}`);

    cy.log('Check that the Admin Settings button is visible');
    cy.findByTestId('top-bar')
      .contains('Admin Settings')
      .should('be.visible')
      .click();
    cy.contains('Manage Project Config').should('be.visible').click();
    cy.url().should('include', '/admin/projectConfig');

    cy.log('The default General category should be open');
    cy.findByRole('heading', { name: 'General' }).should('be.visible');
    cy.findAllByTestId('project-config-category')
      .first()
      .findByRole('tab', { expanded: true })
      .should('be.visible')
      .contains('General');

    cy.findAllByTestId('project-config-category')
      .first()
      .findByTestId('collapse-content')
      .contains('Company Information')
      .as('companyInformation')
      .should('be.visible');

    cy.log('Update project config company info');
    cy.get('@companyInformation').click();
    cy.findByRole('heading', { name: 'Company Information' }).should(
      'be.visible'
    );

    cy.log('Reset and Save buttons should be disabled if no change happened');
    cy.findByTestId('project-config-footer')
      .findByRole('button', {
        name: 'Reset',
      })
      .as('resetButton')
      .should('be.disabled');

    cy.findByTestId('project-config-footer')
      .findByRole('button', {
        name: 'Save',
      })
      .as('saveButton')
      .should('be.disabled');

    cy.log('Update company name and save');
    cy.findByLabelText('Company Name').type('{selectall}').type('New name');
    cy.get('@resetButton').should('not.be.disabled');
    cy.get('@saveButton').should('not.be.disabled').click();

    cy.reload();
    cy.log('Check that the company name change is persisted');
    cy.get('@resetButton').should('be.disabled');
    cy.get('@saveButton').should('be.disabled');

    cy.findByLabelText('Company Name').should('have.value', 'New name');
    cy.findByTestId('top-bar').get('#user-avatar').click();
    cy.findByTestId('user-profile-open').contains('New name');
  });
});
