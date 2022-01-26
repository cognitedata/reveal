import { NO_RESULTS_TEXT } from '../../../src/components/emptyState/constants';
import { CLEAR_ALL_TEXT } from '../../../src/components/tableEmpty/constants';

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
      .type(`${searchString} {enter}`);
  }
);

export interface SearchCommands {
  performSearch(searchString: string, clearAllFilters?: boolean): void;
  clearAllFilters(): void;
}
