import { NO_RESULTS_TEXT } from '../../../src/components/emptyState/constants';

Cypress.Commands.add('goToTab', (tab: 'Documents' | 'Wells' | 'Seismic') => {
  cy.log(`Go to ${tab} tab`);
  // reg exp because tab name might have number of entries with them
  cy.findByRole('tab', { name: new RegExp(tab) })
    .should('be.visible')
    .click();
});

Cypress.Commands.add(
  'selectCategory',
  (category: 'Documents' | 'Wells' | 'Seismic') => {
    cy.log(`Open ${category} category`);
    cy.findByTestId('side-bar')
      .findByText(category)
      .should('be.visible')
      .click();
  }
);

Cypress.Commands.add('clearAllFilters', (expectEmptyResults = true) => {
  if (expectEmptyResults) {
    cy.log(`Searching for 'no results'`);
    cy.get('span').contains(NO_RESULTS_TEXT).should('exist');
  }

  cy.log(`Clicking on clear all filters`);
  cy.findAllByTestId('clear-all-filter-button').should('be.visible').click();
  cy.findAllByTestId('filter-tag').should('not.exist');
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

Cypress.Commands.add(
  'performWellsSearch',
  ({ search: { query, filters }, select }: WellSearch) => {
    if (filters) {
      cy.log('Applying filters');

      filters.forEach(({ category, subCategory, value: { name, type } }) => {
        cy.log(`Select ${category} in sidebar`);

        if (type === 'checkbox') {
          cy.selectItemFromCheckboxFilterCategory(category, subCategory, name);
        }

        if (type === 'select') {
          cy.selectItemFromDropdownFilterCategory(category, subCategory, name);
        }

        // Add logic for other type of filters (date-range, select, etc)
      });
    }

    if (query) {
      cy.log(`Searching for '${query}'`);
      cy.performSearch(query);
    }

    // Do an empty search so the table appears
    if (!filters && !query) {
      cy.performSearch('');
    }

    cy.goToTab('Wells');

    if (select) {
      if (select === 'ALL') {
        cy.log('Select all wells');
        cy.findByTitle('Toggle All Rows Selected').should('be.visible').click();
        return;
      }

      if (select.wells) {
        select.wells.forEach((wellName) => {
          cy.log(`Selecting well "${wellName}"`);
          cy.findByTestId('well-result-table')
            .findByTitle(wellName)
            .closest('[data-testid="table-row"]')
            .find('input[type=checkbox]')
            .check({ force: true });
        });
      }

      // Next step is to allow for selecting specific wellbores within the well.
      // if (select.wellbores) {}
    }

    // Implement the logic for unselecting specific well/wellbores
    // if (unselect) {}
  }
);

type WellSearch = {
  search?: {
    query?: string;
    filters?: {
      category: 'Source' | 'Data Availability';
      subCategory?: string;
      value: {
        name: string;
        type: 'checkbox' | 'select' | 'date-range';
      };
    }[];
  };
  select?:
    | {
        wells?: string[];
        wellbores?: string[];
      }
    | 'ALL';
  unselect?:
    | {
        wells?: string[];
        wellbores?: string[];
      }
    | 'ALL';
};

export interface SearchCommands {
  performSearch(searchString: string, clearAllFilters?: boolean): void;
  clearAllFilters(expectEmptyResults?: boolean): void;
  performWellsSearch(search: WellSearch): void;
  goToTab(tab: 'Documents' | 'Wells' | 'Seismic'): void;
  selectCategory(category: 'Documents' | 'Wells' | 'Seismic'): void;
}
