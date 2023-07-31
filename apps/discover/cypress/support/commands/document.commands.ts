const getDocumentResultTable = () => {
  return cy.findByTestId('doc-result-table');
};

Cypress.Commands.add('getDocumentResultTable', getDocumentResultTable);

Cypress.Commands.add(
  'clickClearAllFilterButtonInNoResultDocumentsTable',
  () => {
    cy.log('Click clear all button in documents result table');
    cy.findByTestId('empty-state-container')
      .should('be.visible')
      .findByTestId('clear-all-filter-button')
      .should('be.visible')
      .click();
  }
);

export interface DocumentCommands {
  getDocumentResultTable(): Cypress.Chainable<JQuery<HTMLElement>>;
  clickClearAllFilterButtonInNoResultDocumentsTable(): void;
}
