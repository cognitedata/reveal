/* eslint-disable testing-library/prefer-screen-queries */
/* eslint-disable testing-library/await-async-query */
Cypress.Commands.add('goToTab', (tab: 'Assets' | 'Time series') => {
  cy.log(`Go to ${tab} tab`);
  cy.findByRole('tab', { name: new RegExp(tab) })
    .should('be.visible')
    .click();
});

Cypress.Commands.add('performSearch', (searchString: string) => {
  cy.findAllByTestId('main-search-input')
    .click()
    .type('{selectall}')
    .type(searchString);
});

export interface SearchCommand {
  goToTab(tab: 'Assets' | 'Time series'): void;
  performSearch(searchString: string): void;
}
