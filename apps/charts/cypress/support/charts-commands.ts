// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    createChart(): void;
    deleteChart(): void;
    selectChart(chartName: string): void;
    addTimeseries(timeseriesName: string): void;
    deleteEventFilter(eventNumber: number): void;
    duplicateEventFilter(): void;
    closeSidebar(sidebarContainerID: string): void;
    duplicateThreshold(duplicateThresholdName: string): void;
    deleteThreshold(eventNumber: number): void;
    selectFirstOption(selector: string): void;
    addThreshold(value: string, min: string, max: string): void;
    addCalculation(): void;
  }
}

Cypress.Commands.add('createChart', () => {
  cy.get('[data-testid="charts-list-loading"]', { timeout: 20000 }).should(
    'exist'
  );
  cy.get('[data-testid="charts-list-loading"]', { timeout: 20000 }).should(
    'not.exist'
  );
  cy.get('[data-testid="new-chart-button"]', { timeout: 30000 })
    .should('exist')
    .should('not.be.disabled')
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
  cy.get('[data-testid="chart-action-btn"]', { timeout: 20000 }).click();

  cy.contains('Add time series').click();

  cy.log('navigates to time series tab');
  cy.contains('span', 'Time series').click();

  cy.get('input[placeholder="Find time series"]').type(timeseriesName, {
    log: false,
  });

  cy.get('input[type="checkbox"]').eq(0).check();
});

Cypress.Commands.add('deleteEventFilter', (eventNumber: number) => {
  cy.get('footer button[aria-label="Delete"]').eq(eventNumber).click();

  cy.contains('Confirm').click();
});

Cypress.Commands.add('duplicateEventFilter', () => {
  cy.get('[aria-label="Duplicate"]').eq(0).click();

  cy.contains('Confirm').click();

  cy.contains('New event filter 1 (Duplicate)').should('exist');
});

Cypress.Commands.add('closeSidebar', (sidebarContainerID: string) => {
  cy.get(`[data-testid=${sidebarContainerID}]`)
    .should('exist')
    .within(() => {
      cy.get('.cogs-icon--type-close').should('exist').parent('button').click();
    });
});

Cypress.Commands.add('duplicateThreshold', (duplicateThresholdName: string) => {
  cy.get('[aria-label="Duplicate"]').eq(0).click();

  cy.contains(duplicateThresholdName).should('exist');
});

Cypress.Commands.add('deleteThreshold', (eventNumber: number) => {
  cy.get('footer button[aria-label="Delete"]').eq(eventNumber).click();

  cy.contains('Confirm').click();
});

Cypress.Commands.add('selectFirstOption', (selector: string) => {
  cy.getBySel(selector)
    .should('exist')
    .within(() => {
      cy.contains('Select...').click();
      cy.get('.cogs-select__option').first().should('exist').click();
    });
});

Cypress.Commands.add(
  'addThreshold',
  (value: string, min: string, max: string) => {
    cy.get('[aria-label="Add threshold"]', { timeout: 10000 })
      .should('exist')
      .click();

    cy.selectFirstOption('thresholds-sidebar-container');

    cy.getBySel('thresholds-sidebar-container')
      .should('exist')
      .within(() => {
        cy.get('[aria-label="ChevronDown"]').click();
        cy.contains('Under').click();
      });

    cy.contains('Filter length').click();

    cy.get('input[placeholder="Value"]').type(value);

    cy.get('input[placeholder="Min"]').type(min);

    cy.get('input[placeholder="Max"]').type(max);
  }
);

Cypress.Commands.add('addCalculation', () => {
  cy.get('[data-testid="chart-action-btn"]', { timeout: 20000 }).click();

  cy.contains('Add calculation').click();

  cy.getBySel('output-nodeWrapper')
    .trigger('mousedown', { which: 1 })
    .trigger('mousemove', { clientX: 0, clientY: 0 })
    .trigger('mouseup', { force: true });

  cy.contains('Add node').click();
  cy.contains('Source').click();

  cy.getBySel('source-dropdown-menu')
    .should('exist')
    .within(() => {
      cy.get('button[type="button"]').click();
    });

  cy.getBySel('source-nodeWrapper').click();

  cy.get('[aria-label="FullScreen"]').click();

  cy.get('[data-handlepos="right"]').trigger('mousedown', { which: 1 });
  cy.get('[data-handlepos="left"]').trigger('mousemove').trigger('mouseup');
});
