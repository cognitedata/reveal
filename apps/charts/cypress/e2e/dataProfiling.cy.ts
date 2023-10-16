import { TIMESERIES_NAME } from '../support/constant';
import { getUrl } from '../utils/getUrl';

describe('Events', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('should be able select source and see relevant data', () => {
    cy.createChart();

    cy.addTimeseries(TIMESERIES_NAME);

    cy.get('[aria-label="Toggle data profiling sidebar"]', { timeout: 10000 })
      .should('exist')
      .click();

    cy.getBySel('dataprofiling-sidebar-container')
      .should('exist')
      .within(() => {
        cy.contains('Select...').click();
        cy.get('.cogs-select__option')
          .first()
          .should('exist')
          .click({ timeout: 10000 });
      });

    cy.log('below fields should display');
    cy.contains('Gaps').should('exist');
    cy.contains('Time Delta').should('exist');
    cy.contains('Data Points').should('exist');
    cy.contains('Metric Distribution').should('exist');

    cy.deleteChart();
  });
});
