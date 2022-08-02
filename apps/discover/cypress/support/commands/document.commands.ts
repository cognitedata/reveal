const getDocumentResultTable = () => {
  return cy.findByTestId('doc-result-table');
};

Cypress.Commands.add('getDocumentResultTable', getDocumentResultTable);

export interface DocumentCommands {
  getDocumentResultTable(): Cypress.Chainable<JQuery<HTMLElement>>;
}
