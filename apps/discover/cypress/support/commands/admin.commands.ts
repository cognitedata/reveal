import { INSUFFICIENT_ACCESS_RIGHTS_MESSAGE } from '../../../src/core/constants';
import { PROJECT } from '../../app.constants';

function checkUserCannotAccessPage(path: string): void {
  cy.intercept({
    url: '*/user/roles*',
    method: 'GET',
  }).as('getUserRoles');

  cy.log(
    'Check that we cannot access the admin page via URL and that it returns us to the home page'
  );
  cy.visit(`${Cypress.env('BASE_URL')}/${PROJECT}/${path}`);
  cy.url().should('include', path);
  cy.wait('@getUserRoles');
  cy.url().should('not.include', path);
  cy.url().should('include', '/search');
  cy.log('We check that the insufficient access message is shown');
  cy.contains(INSUFFICIENT_ACCESS_RIGHTS_MESSAGE).should('be.visible');
}

function checkAdminSettingsIsNotVisible(): void {
  cy.log('Check that the Admin Settings button is not visible');
  cy.findByTestId('top-bar').contains('Admin Settings').should('not.exist');
}

Cypress.Commands.add('checkUserCannotAccessPage', checkUserCannotAccessPage);
Cypress.Commands.add(
  'checkAdminSettingsIsNotVisible',
  checkAdminSettingsIsNotVisible
);

export interface AdminCommands {
  checkUserCannotAccessPage(path: string): void;
  checkAdminSettingsIsNotVisible(): void;
}
