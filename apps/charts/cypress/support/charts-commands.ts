// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    createChart(): void;
    deleteChart(): void;
    selectChart(chartName: string): void;
    addTimeseries(timeseriesName: string): void;
  }
}

Cypress.Commands.add('createChart', () => {
  cy.get('[data-testid="new-chart-button"]', { timeout: 30000 })
    .should('exist')
    .click();
});

Cypress.Commands.add('deleteChart', () => {
  cy.contains('Actions').click();

  cy.contains('Delete chart').should('exist').click();

  cy.get('.cogs-modal-footer-buttons').contains('Delete').click();
});

Cypress.Commands.add('selectChart', (chartName: string) => {
  cy.contains(chartName).should('exist').click();
});

Cypress.Commands.add('addTimeseries', (timeseriesName: string) => {
  cy.get('input[placeholder="Find time series"]').type(timeseriesName);

  cy.get('input[type="checkbox"]').eq(0).check();
});
