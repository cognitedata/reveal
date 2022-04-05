import capitalize from 'lodash/capitalize';

import { CLUSTER, USER_PREFIX } from '../../app.constants';

import { getTokenHeaders } from './helpers';

Cypress.Commands.add('login', () => {
  cy.log('Login as Normal user');
  cy.log('Logged in User ID', Cypress.env('REACT_APP_E2E_USER'));
  cy.findByRole('button', {
    name: `Login with Fake IDP (${capitalize(
      CLUSTER
    )} ${USER_PREFIX.toUpperCase()} User)`,
  })
    // .should('exist')
    .should('be.visible')
    .click();
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.log('Login as Admin user');
  cy.log('Logged in User ID', Cypress.env('REACT_APP_E2E_USER'));
  cy.findByRole('button', {
    name: `Login with Fake IDP (${capitalize(
      CLUSTER
    )} ${USER_PREFIX.toUpperCase()} Admin)`,
  })
    .should('exist')
    .should('be.visible')
    .click();
});

Cypress.Commands.add('logout', () => {
  cy.log('Logout');
  cy.findByTestId('user-avatar').click();
  cy.findByTestId('user-profile-open').findByLabelText('Logout').click();
});

Cypress.Commands.add('acceptCookies', () => {
  cy.contains('Accept').should('be.visible').click();
});

Cypress.Commands.add('syncAdminUser', () => {
  return cy.request({
    method: 'POST',
    body: {
      accessToken: Cypress.env('ACCESS_TOKEN_ADMIN'),
    },
    // url: `${Cypress.env('SIDECAR').userManagementServiceBaseUrl}/user/sync`,
    url: `https://user-management-service.staging.${CLUSTER}.cognite.ai/user/sync`,
    headers: getTokenHeaders(true),
  });
});

export interface LoginCommand {
  login(): void;
  loginAsAdmin(): void;
  acceptCookies(): void;
  logout(): void;
  syncAdminUser(): void;
}
