/* eslint-disable @typescript-eslint/no-explicit-any */

Cypress.Commands.add('createNewPipeline', () => {
  cy.getBySelector('create-pipeline-button').should('exist').click();
  cy.getBySelector('create-pipeline-modal').should('exist');
  cy.getBySelector('create-pipeline-name')
    .should('exist')
    .type('Test Pipeline ' + Date.now());
  cy.getBySelector('create-pipeline-description')
    .should('exist')
    .type('Test pipeline created by e2e tests at ' + new Date());
  cy.getBySelector('create-pipeline-ok').should('exist').click();
});

Cypress.Commands.add('startQuickMatch', () => {
  cy.getBySelector('quick-match-button').should('exist').click();
});

export interface HomePageCommands {
  createNewPipeline(): Cypress.Chainable<any>;
  startQuickMatch(): Cypress.Chainable<any>;
}
