import capitalize from 'lodash/capitalize';

import { CLUSTER } from '../constants';

Cypress.Commands.add('login', () => {
  cy.contains(`Login with Fake IDP (${capitalize(CLUSTER)} User)`).click();
});

Cypress.Commands.add('acceptCookies', () => {
  cy.contains('Accept').click();
});

export interface LoginCommand {
  login(): Cypress.Chainable<void>;
  acceptCookies(): Cypress.Chainable<void>;
}
