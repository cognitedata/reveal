/// <reference types="cypress" />

import login from '../login.test';

beforeEach(login);

describe('Run browser', () => {
  beforeEach(() => {
    cy.get('[data-cy="top-bar"]').as('App TopBar visible').should('be.visible');

    cy.get('[data-cy="top-bar"]')
      .get('.rc-tabs-tab')
      .contains('Run browser')
      .as('Run browser tab')
      .click();
  });

  it('should contain calculation run filter form', () => {
    cy.get('[data-cy="calc-run-filter-form"]')
      .as('Calc Run Filter Form')
      .should('not.be.null');
  });
});

afterEach(() => {
  it('Should log out successfully', () => {
    cy.get('.cogs-avatar').click();
    cy.get('.cogs-menu-item[data-cy="logout-button"]').click();
    cy.contains('Login with Fake IDP (azure-dev)');
  });
});
