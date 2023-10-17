type SearchResultMatchType = 'Exact' | 'Partial' | 'Fuzzy';

const performSearch = (searchString: string) => {
  cy.findAllByTestId('main-search-input')
    .click()
    .type('{selectall}')
    .type(searchString);
};

const clearSearchInput = () => {
  cy.log('clear search input');
  cy.clickIconButton('Clear input field');
};

const resetSearchFilters = () => {
  cy.log('reset search filters');
  cy.clickButton('Reset');
};

const shouldExistMatchLabelBy = (
  type: SearchResultMatchType,
  property: string
) => {
  cy.contains(new RegExp(`${type} match: .*${property}.*`)).should('exist');
};

const shouldExistExactMatchLabelBy = (property: string) => {
  cy.shouldExistMatchLabelBy('Exact', property);
};

const shouldExistFuzzyMatchLabelBy = (property: string) => {
  cy.shouldExistMatchLabelBy('Fuzzy', property);
};

Cypress.Commands.add('performSearch', performSearch);
Cypress.Commands.add('clearSearchInput', clearSearchInput);
Cypress.Commands.add('resetSearchFilters', resetSearchFilters);
Cypress.Commands.add('shouldExistMatchLabelBy', shouldExistMatchLabelBy);
Cypress.Commands.add(
  'shouldExistExactMatchLabelBy',
  shouldExistExactMatchLabelBy
);
Cypress.Commands.add(
  'shouldExistFuzzyMatchLabelBy',
  shouldExistFuzzyMatchLabelBy
);

export interface SearchCommand {
  performSearch: (searchString: string) => void;
  clearSearchInput: () => void;
  resetSearchFilters: () => void;
  shouldExistMatchLabelBy: (
    type: SearchResultMatchType,
    property: string
  ) => void;
  shouldExistExactMatchLabelBy: (property: string) => void;
  shouldExistFuzzyMatchLabelBy: (property: string) => void;
}
