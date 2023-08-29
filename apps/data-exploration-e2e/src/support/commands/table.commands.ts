const getTableById = (id: string) => {
  return cy.findAllByTestId(id);
};

const tableSholudBeVisible = (id: string) => {
  cy.getTableById(id).should('be.visible');
};

Cypress.Commands.add('getTableById', getTableById);
Cypress.Commands.add('tableSholudBeVisible', tableSholudBeVisible);

export interface TableCommands {
  getTableById: (id: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  tableSholudBeVisible: (id: string) => void;
}
