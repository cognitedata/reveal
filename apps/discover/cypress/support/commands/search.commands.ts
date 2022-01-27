import { NO_RESULTS_TEXT } from '../../../src/components/emptyState/constants';
import { CLEAR_ALL_TEXT } from '../../../src/components/tableEmpty/constants';

Cypress.Commands.add('goToTab', (tab: 'Documents' | 'Wells' | 'Seismic') => {
  cy.log(`Go to ${tab} tab`);
  return cy.findByRole('tab', { name: tab }).should('be.visible').click();
});

Cypress.Commands.add('clearAllFilters', () => {
  cy.log(`Searching for 'no results'`);
  cy.get('span').contains(NO_RESULTS_TEXT).should('exist');

  cy.log(`Clicking on clear all filters`);
  cy.contains(CLEAR_ALL_TEXT).click();
});

Cypress.Commands.add(
  'performSearch',
  (searchString: string, clearFilters = false) => {
    if (clearFilters) {
      cy.log('Clearing all filters');
      cy.clearAllFilters();
    }

    cy.log(`Searching for '${searchString}'`);

    cy.findByTestId('main-search-input')
      .click()
      .type('{selectall}')
      .type(`${searchString}{enter}`);
  }
);

Cypress.Commands.add('performWellsSearch', (wells: string[]) => {
  for (let i = 0; i < wells.length; i++) {
    const well = wells[i];
    cy.log(`Searching for '${well}'`);

    cy.performSearch(well);

    cy.goToTab('Wells');

    cy.findByTestId('well-result-table')
      .findByText(well)
      .closest('[data-testid="table-row"]')
      .find('input[type=checkbox]')
      .check({ force: true });

    // Next step is to allow for selecting specific wellbores within the well.
  }

  cy.findByTestId('wells-inspect-button').should('be.visible').click();
});

export interface SearchCommands {
  performSearch(searchString: string, clearAllFilters?: boolean): void;
  clearAllFilters(): void;
  performWellsSearch(wells: string[]): void;
  goToTab(tab: 'Documents' | 'Wells' | 'Seismic'): Cypress.Chainable;
}
