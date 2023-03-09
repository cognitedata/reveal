/* eslint-disable @typescript-eslint/no-explicit-any */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { getFDMVersion } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    createDataModel(name: string, space: string): void;
  }
}

Cypress.Commands.add('createDataModel', (name: string, space: string) => {
  cy.getBySel('create-data-model-btn').click();
  cy.getBySel('input-data-model-name').type(name);

  if (getFDMVersion() === 'V3') {
    cy.get('.cogs-select').click();
    cy.getBySel('open-create-space-modal-btn').click();
    cy.getBySel('input-data-model-space').type(space);

    cy.contains('Create new space')
      .parent()
      .parent()
      .siblings('.cogs-modal-footer')
      .find('.cogs-modal-footer-buttons')
      .contains('Confirm')
      .click();
  }
  cy.get('.cogs-modal-footer-buttons').contains('Create').click();
});
