/* eslint-disable testing-library/prefer-screen-queries */
/* eslint-disable testing-library/await-async-query */
Cypress.Commands.add(
  'goToTab',
  (tab: 'Assets' | 'Time series' | 'Files' | 'Events') => {
    cy.log(`Go to ${tab} tab`);
    cy.findByRole('tab', { name: new RegExp(tab) })
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

export interface SearchCommand {
  goToTab(tab: 'Assets' | 'Time series' | 'Files' | 'Events'): void;
  performSearch(searchString: string): void;
  clearSearchInput(): void;
}
