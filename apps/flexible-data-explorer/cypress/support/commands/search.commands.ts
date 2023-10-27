const performSearch = (searchString: string) => {
  cy.findByTestId('search-bar')
    .click()
    .clear()
    .type(searchString)
    .type('{enter}');
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
    .containsExact(searchCategory)
    .should('be.visible')
    .click();
};

const performGlobalSearchCategory = (category: string) => {
  cy.findByTestId('search-bar')
    .click()
    .clear()
    .type(category)
    .pressKeyTab()
    .type('{enter}');
};

const removeCategory = (category: string) => {
  cy.clickIconButton(`Remove ${category}`);
};

Cypress.Commands.add('performSearch', performSearch);
Cypress.Commands.add('clearSearchInput', clearSearchInput);
Cypress.Commands.add('performEmptySearch', performEmptySearch);
Cypress.Commands.add('selectSearchCategory', selectSearchCategory);
Cypress.Commands.add(
  'performGlobalSearchCategory',
  performGlobalSearchCategory
);
Cypress.Commands.add('removeCategory', removeCategory);

export interface SearchCommands {
  performSearch: (searchString: string) => void;
  clearSearchInput: () => void;
  performEmptySearch: () => void;
  selectSearchCategory: (item: string) => void;
  performGlobalSearchCategory: (category: string) => void;
  removeCategory: (category: string) => void;
}
