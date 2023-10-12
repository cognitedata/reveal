import { TIMESERIES_NAME } from '../support/constant';
import { getUrl } from '../utils/getUrl';

const E2E_MONITORING_JOB_NAME = 'AUTOMATED e2e monitoring job';

describe('Monitoring Job', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('should be able to create and delete monitoring job', () => {
    cy.createChart();

    cy.addTimeseries(TIMESERIES_NAME);

    // cy.contains('DO_NOT_DELETE', { timeout: 10000 }).should('exist').click();

    cy.log('Click monitoring sidebar button to open monitoring side panel');
    cy.get('[aria-label="Toggle monitoring sidebar"]', { timeout: 10000 })
      .should('exist')
      .click();

    cy.log('Click Create button in monitoring side panel to open form');
    cy.get('[aria-label="Add monitoring task"]', { timeout: 4000 })
      .should('exist')
      .click();

    cy.log('Fill monitoring task details');
    cy.get('input[placeholder="Describe monitoring job"]').type(
      E2E_MONITORING_JOB_NAME,
      { log: false }
    );

    cy.get('[data-testid="monitoring-sidebar-container"]')
      .should('exist')
      .within(() => {
        cy.contains('Select...').click();
        cy.get('.cogs-select__option').first().should('exist').click();
      });

    cy.contains('Select or create folder').should('exist').click();
    cy.get('.cogs-select__option')
      .first()
      .within(() => cy.contains('e2e'))
      .should('exist')
      .click();

    cy.contains('button', 'Next')
      .should('exist')
      .should('not.be.disabled')
      .click();

    cy.contains('button', 'Start monitoring').should('exist').click();

    cy.contains('Your monitoring job is successfully added', {
      timeout: 10000,
    }).should('exist');

    cy.contains('View monitoring job').should('exist').click();
    cy.contains('Monitoring job created successfully').should('exist');

    cy.contains('Monitoring job created successfully', {
      timeout: 15000,
    }).should('not.exist');

    cy.get('[data-testid="monitoring-sidebar-container"]')
      .should('exist')
      .within(() => {
        cy.get('.cogs-icon--type-ellipsisvertical')
          .should('exist')
          .first()
          .click();
        cy.contains('Delete').should('exist').click();
      });

    cy.contains('Monitoring Job deleted successfully', {
      timeout: 5000,
    }).should('exist');
    cy.contains('Monitoring Job deleted successfully', {
      timeout: 15000,
    }).should('not.exist');

    cy.get('[data-testid="monitoring-sidebar-container"]')
      .should('exist')
      .within(() => {
        cy.get('.cogs-icon--type-close')
          .should('exist')
          .parent('button')
          .click();
      });

    // cy.contains('button', 'All charts');

    cy.deleteChart();
  });
});
