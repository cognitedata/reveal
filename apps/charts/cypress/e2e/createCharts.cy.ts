import { getUrl } from '../utils/getUrl';

describe('Create chart', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('should be able to create & delete chart', () => {
    cy.createChart();

    cy.log('chart title should be visible');
    cy.contains('New chart', { timeout: 20000 }).should('exist');

    cy.log('chart view should visible');
    cy.get('[id="chart-view"]', { timeout: 15000 }).should('exist');

    cy.deleteChart();

    cy.getBySel('new-chart-button').should('exist');
  });
});
