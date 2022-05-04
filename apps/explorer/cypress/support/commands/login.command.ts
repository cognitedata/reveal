// import capitalize from 'lodash/capitalize';

import { CLUSTER } from '../constants';

Cypress.Commands.add('login', () => {
  cy.log('Login as Normal user');
  cy.log('Logged in User ID', Cypress.env('REACT_APP_E2E_USER'));
  cy.findByRole('button', {
    name: `Login with Fake IDP (${CLUSTER})`,
    // name: `Login with Fake IDP (${capitalize(CLUSTER)})`,
  })
    // .should('exist')
    .should('be.visible')
    .click();
});

export interface LoginCommand {
  login(): void;
}
