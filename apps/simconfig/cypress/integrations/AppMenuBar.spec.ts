/// <reference types="cypress" />

import modelsFixture from '../fixtures/models.json';
import simulatorsFixture from '../fixtures/simulators.json';
import simulatorDetailsFixture from '../fixtures/simulators__ProcessSim__simconnect-e2e.json';

import login from '../login.test';

beforeEach(login);

describe('Application Framework', () => {
  beforeEach(() => {
    cy.get('[data-cy="top-bar"]').as('App TopBar visible').should('be.visible');
    cy.get('[data-cy="model-library-container"]')
      .as('Model Library visible')
      .should('be.visible');

    // Fixtures
    cy.intercept('GET', `**/models?labelIds=`, {
      fixture: 'models.json',
    }).as('models');
    cy.intercept('GET', `**/simulators`, {
      fixture: 'simulators.json',
    }).as('simulators');
  });

  it('has correct project information in header', () => {
    cy.get('.cogs-topbar header h6').contains(
      'Cognite Simulator Configuration'
    );
    cy.get('#project-name').invoke('text').should('eq', 'simconfig-e2e');
  });

  it('should displays information and details about a simulator', () => {
    cy.get('#simulator-status-0').click();
    cy.get('#simulator-header-0').click();

    const simInfoList = cy.get('[data-cy="simulator-information-list"]');

    simInfoList
      .get('[data-cy="data-set"]')
      .invoke('text')
      .should('eq', simulatorsFixture.simulators[0].dataSetName)
      .as('data set name matches fixture');
    simInfoList
      .get('[data-cy="connector-version"]')
      .invoke('text')
      .should('eq', simulatorsFixture.simulators[0].connectorVersion)
      .as('connector version matches fixture');

    cy.get('.simulator-collapse .rc-collapse-item:first-child')
      .click()
      .as('open simulator submenu');

    cy.wrap(simulatorDetailsFixture)
      .its('models')
      .should('be.equal', modelsFixture.modelFileList.length)
      .as('model count matches model list');

    const simInfoDetails = cy.get(
      '[data-cy="simulator-information-list-details"]'
    );

    simInfoDetails
      .get('[data-cy="model-files"]')
      .invoke('text')
      .then(parseFloat)
      .should('eq', simulatorDetailsFixture.models)
      .as('model files matches fixture');
    simInfoDetails
      .get('[data-cy="calculation-files"]')
      .invoke('text')
      .then(parseFloat)
      .should('eq', simulatorDetailsFixture.calculations)
      .as('calculation files matches fixture');
    simInfoDetails
      .get('[data-cy="calculation-run-events"]')
      .invoke('text')
      .then(parseFloat)
      .should('eq', simulatorDetailsFixture.calculationsRuns)
      .as('calculation events matches fixture');
  });
});

afterEach(() => {
  it('Should log out successfully', () => {
    cy.get('.cogs-avatar').click();
    cy.get('.cogs-menu-item[data-cy="logout-button"]').click();
    cy.contains('Login with Fake IDP (azure-dev)');
  });
});
