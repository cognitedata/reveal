import { CLEAR_ALL_TEXT, NO_RESULTS_TEXT } from '../constants';

Cypress.Commands.add('clearAllFilters', () => {
  cy.log(`Searching for 'no results'`);
  cy.get('span').contains(NO_RESULTS_TEXT).should('exist');

  cy.log(`Clicking on clear all filters`);
  cy.contains(CLEAR_ALL_TEXT).click();
});

Cypress.Commands.add(
  'doSearch',
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

export interface DocumentsCommands {
  doSearch(
    searchString: string,
    clearAllFilters?: boolean
  ): Cypress.Chainable<void>;
  clearAllFilters(): Cypress.Chainable<void>;
}
