type ResourceTab =
  | 'Assets'
  | 'Time series'
  | 'Files'
  | 'Events'
  | 'Sequence'
  | 'All resources'
  | 'Hierarchy';

Cypress.Commands.add(
  'goToTab',
  { prevSubject: 'optional' },
  (subject, tab: ResourceTab) => {
    cy.log(`Go to ${tab} tab`);
    cy.wrap(subject)
      .findByRole('tab', { name: new RegExp(tab) })
      .should('be.visible')
      .click();
  }
);

Cypress.Commands.add('performSearch', (searchString: string) => {
  cy.findAllByTestId('main-search-input')
    .click()
    .type('{selectall}')
    .type(searchString);
});

Cypress.Commands.add('clearSearchInput', () => {
  cy.log('clear search input');
  cy.get('[aria-label="Clear input field"]').click();
});

Cypress.Commands.add('fuzzySearchDisable', () => {
  cy.get('input[role="switch"]').then(($toggle) => {
    if ($toggle.is(':checked')) {
      cy.findAllByTestId('fuzzy-search-toggle').click({ multiple: true });
    }
  });
});

Cypress.Commands.add('fuzzySearchEnable', () => {
  cy.get('input[role="switch"]').then(($toggle) => {
    if ($toggle.is(':not(:checked)')) {
      cy.findAllByTestId('fuzzy-search-toggle').click({ multiple: true });
    }
  });
});

Cypress.Commands.add('columnSelection', (columnName) => {
  cy.get('[aria-label="Column Selection"]').click();

  cy.get(`[id=${columnName}]`).then(($columnCheckbox) => {
    if ($columnCheckbox.is(':not(:checked)')) {
      cy.get(`[id=${columnName}]`).click();
    } else {
      cy.log(`${columnName} column is already selected`);
    }
  });
});

Cypress.Commands.add('excludeSearchParameter', (parameterID) => {
  cy.get(`[id=${parameterID}]`).then(($searchParameter) => {
    if ($searchParameter.is(':checked')) {
      cy.get(`[id=${parameterID}]`).uncheck();
    }
  });
});

Cypress.Commands.add('includeSearchParameter', (parameterID) => {
  cy.get(`[id=${parameterID}]`).then(($searchParameter) => {
    if ($searchParameter.is(':not(:checked)')) {
      cy.get(`[id=${parameterID}]`).click();
    }
  });
});
export interface SearchCommand {
  goToTab(tab: ResourceTab): void;
  performSearch(searchString: string): void;
  clearSearchInput(): void;
  fuzzySearchDisable(): void;
  fuzzySearchEnable(): void;
  columnSelection(columnName: string): void;
  excludeSearchParameter(parameterName: string): void;
  includeSearchParameter(parameterName: string): void;
}
