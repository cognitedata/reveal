import { TIMESERIES_NAME } from '../support/constant';
import { getUrl } from '../utils/getUrl';

describe('Add time series', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('should be able to add timeseries ', () => {
    cy.createChart();

    cy.get('[data-testid="chart-action-btn"]', { timeout: 20000 }).click();

    cy.contains('Add time series').click();

    cy.log('navigates to time series tab');
    cy.contains('span', 'Time series').click();

    cy.addTimeseries(TIMESERIES_NAME);

    cy.get('tbody').find('tr').should('have.length', 1);

    cy.deleteChart();
  });
});
