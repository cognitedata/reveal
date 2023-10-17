import { TIMESERIES_NAME } from '../support/constant';
import { getUrl } from '../utils/getUrl';

describe('Events', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('should be able to add, duplicate & delete new event filter ', () => {
    cy.createChart();

    cy.addTimeseries(TIMESERIES_NAME);

    cy.get('[aria-label="Toggle events sidebar"]', { timeout: 10000 })
      .should('exist')
      .click();

    cy.get('[aria-label="Add event filter"]', { timeout: 10000 })
      .should('exist')
      .click();

    cy.get('[data-testid="filter-Data sets"]')
      .should('exist')
      .within(() => {
        cy.contains('Select...').click();
        cy.get('.cogs-select__option').first().should('exist').click();
      });

    cy.get('[data-testid="filter-Assets"]')
      .should('exist')
      .click()
      .within(() => {
        cy.contains('Select...').click();
        cy.get('.cogs-select__option').first().should('exist').click();
      });

    cy.contains('More filters').click();

    cy.contains('Metadata').should('be.visible');
    cy.contains('Sources').should('be.visible');
    cy.contains('External ID').should('be.visible');

    cy.duplicateEventFilter();

    cy.deleteEventFilter(1);
    cy.deleteEventFilter(0);

    cy.contains('New event filter 1').should('not.exist');

    cy.closeSidebar('events-sidebar-container');

    cy.deleteChart();
  });
});
