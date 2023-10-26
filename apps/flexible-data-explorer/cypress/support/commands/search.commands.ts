const performSearch = (searchString: string) => {
  cy.findByTestId('search-bar').click().clear().type(searchString);
};

const clearSearchInput = () => {
  cy.log('clear search input');
  cy.findByTestId('search-bar').click().clear();
};

const performEmptySearch = () => {
  cy.log('Perform empty search');
  cy.findByTestId('search-bar').type('{enter}');
};

const selectSearchCategory = (searchCategory: string) => {
  cy.log(`Select search category: ${searchCategory}`);

  cy.findByTestId('search-categories')
    .contains(searchCategory)
    .should('be.visible')
    .click();
};

Cypress.Commands.add('performSearch', performSearch);
Cypress.Commands.add('clearSearchInput', clearSearchInput);
Cypress.Commands.add('performEmptySearch', performEmptySearch);
Cypress.Commands.add('selectSearchCategory', selectSearchCategory);

export interface SearchCommands {
  performSearch: (searchString: string) => void;
  clearSearchInput: () => void;
  performEmptySearch: () => void;
  selectSearchCategory: (item: string) => void;
}
