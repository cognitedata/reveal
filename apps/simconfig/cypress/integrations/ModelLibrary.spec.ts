/// <reference types="cypress" />

import login from '../login.test';

beforeEach(login);

describe('Model library', () => {
  beforeEach(() => {
    cy.get('[data-cy="top-bar"]').as('App TopBar visible').should('be.visible');
    cy.get('[data-cy="model-library-container"]')
      .as('Model Library visible')
      .should('be.visible');

    cy.get('[data-cy="top-bar"]')
      .find('.rc-tabs-tab-active')
      .as('Active Tab')
      .invoke('text')
      .should('contain', 'Model library');

    // Fixtures
    cy.intercept('GET', `**/models?labelIds=`, {
      fixture: 'models.json',
    }).as('models');
    cy.intercept('GET', `**/simulators`, {
      fixture: 'simulators.json',
    }).as('simulators');
  });

  it('should contain relevant tabs', () => {
    cy.get('#rc-tabs-0-tab-Model library')
      .as('Model library tab visible')
      .should('not.be.null');
    cy.get('div.rc-tabs-tab-active')
      .as('Model library tab active')
      .should('have.text', 'Model library');
    cy.get('#rc-tabs-0-tab-Run browser')
      .as('Run browser tab visible')
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
