import capitalize from 'lodash/capitalize';

import { CLUSTER } from '../constants';

Cypress.Commands.add('login', () => {
  cy.log('Login as Normal user');
  cy.contains(`Login with Fake IDP (${capitalize(CLUSTER)} User)`)
    .should('exist')
    .should('be.visible')
    .click();
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.log('Login as Admin user');
  cy.contains(`Login with Fake IDP (${capitalize(CLUSTER)} Admin)`)
    .should('exist')
    .should('be.visible')
    .click();
});

Cypress.Commands.add('acceptCookies', () => {
  cy.contains('Accept').should('be.visible').click();
});

export interface LoginCommand {
  login(): void;
  loginAsAdmin(): void;
  acceptCookies(): void;
}
