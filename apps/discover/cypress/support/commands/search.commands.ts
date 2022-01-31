import { NO_RESULTS_TEXT } from '../../../src/components/emptyState/constants';
import { CLEAR_ALL_TEXT } from '../../../src/components/tableEmpty/constants';

Cypress.Commands.add('goToTab', (tab: 'Documents' | 'Wells' | 'Seismic') => {
  cy.log(`Go to ${tab} tab`);
  cy.findByRole('tab', { name: tab }).should('be.visible').click();
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

Cypress.Commands.add(
  'performWellsSearch',
  ({ search: { query, filters }, select }: WellSearch) => {
    if (filters) {
      cy.log('Applying filters');

      filters.forEach(({ category, value: { name, type } }) => {
        cy.log(`Select ${category} in sidebar`);
        cy.findByTestId('side-bar')
          .contains(category)
          .should('be.visible')
          .click();

        if (type === 'checkbox') {
          cy.findByTestId('side-bar')
            .contains(name)
            .should('be.visible')
            .click();
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
            .findByText(wellName)
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
      category: 'Source';
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
  clearAllFilters(): void;
  performWellsSearch(search: WellSearch): void;
  goToTab(tab: 'Documents' | 'Wells' | 'Seismic'): void;
}
