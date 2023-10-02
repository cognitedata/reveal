import { TIMESERIES_NAME } from '../support/constant';
import { getUrl } from '../utils/getUrl';

describe('Add time series', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('should be able to add timeseries ', () => {
    cy.createChart();

    cy.addTimeseries(TIMESERIES_NAME);

    cy.get('tbody').find('tr').should('have.length', 1);

    cy.deleteChart();
  });
});
