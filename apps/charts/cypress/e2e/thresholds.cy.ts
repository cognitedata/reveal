import { TIMESERIES_NAME, DUPLICATE_THRESHOLD_NAME } from '../support/constant';
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

    cy.addThreshold('10', '1', '5');

    cy.duplicateThreshold(DUPLICATE_THRESHOLD_NAME);
    cy.deleteThreshold(0);
    cy.deleteThreshold(0);

    cy.deleteChart();
  });
});
