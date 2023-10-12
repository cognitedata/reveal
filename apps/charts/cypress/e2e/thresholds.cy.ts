import { TIMESERIES_NAME } from '../support/constant';
import { getUrl } from '../utils/getUrl';

describe('Thresholds', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('should be able to add, duplicate & delete thresholds ', () => {
    cy.createChart();

    cy.addTimeseries(TIMESERIES_NAME);

    cy.get('[aria-label="Toggle threshold sidebar"]', { timeout: 10000 })
      .should('exist')
      .click();

    cy.get('[aria-label="Add threshold"]', { timeout: 10000 })
      .should('exist')
      .click();

    cy.getBySel('thresholds-sidebar-container')
      .should('exist')
      .within(() => {
        cy.contains('Select...').click();
        cy.get('.cogs-select__option').first().should('exist').click();
      });

    cy.getBySel('thresholds-sidebar-container')
      .should('exist')
      .within(() => {
        cy.get('[aria-label="ChevronDown"]').click();
        cy.contains('Under').click();
      });

    cy.contains('Filter length').click();

    cy.get('input[placeholder="Value"]').type('10');

    cy.get('input[placeholder="Min"]').type('1');

    cy.get('input[placeholder="Max"]').type('5');

    cy.duplicateThreshold();
    cy.deleteThreshold(0);
    cy.deleteThreshold(0);

    cy.deleteChart();
  });
});
