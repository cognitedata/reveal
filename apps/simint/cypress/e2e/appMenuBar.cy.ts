/// <reference types="cypress" />

import { getUrl } from '../utils/getUrl';

describe('Simint top menu bar', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('should displays information and details about a simulator', () => {
    cy.get('[data-testid="simulator-status-0"]').click();
    cy.get('[data-testid="simulator-header-0"]').click();

    cy.get('[data-testid="simulator-information-list"]').as(
      'simulatorInfoList'
    );

    cy.get('@simulatorInfoList')
      .get('[data-testid="data-set"]')
      .invoke('text')
      .should('not.be.empty');

    cy.get('@simulatorInfoList')
      .get('[data-testid="connector-version"]')
      .invoke('text')
      .should('not.be.empty');

    cy.get('@simulatorInfoList')
      .get('[data-testid="simulator-version"]')
      .invoke('text')
      .should('not.be.empty');

    cy.contains('Data set details').click().as('open data set submenu');

    cy.get('[data-testid="simulator-information-list-details"]').as(
      'simulatorInfoDetails'
    );

    cy.get('@simulatorInfoDetails')
      .get('[data-testid="model-files"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', 0);

    cy.get('@simulatorInfoDetails')
      .get('[data-testid="calculation-files"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', 0);

    cy.get('@simulatorInfoDetails')
      .get('[data-testid="calculation-run-events"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', 0);
  });
});
