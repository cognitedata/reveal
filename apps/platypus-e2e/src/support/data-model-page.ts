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

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    discardDraft(): void;
    enableEditMode(): void;
    ensureCurrentVersionIsDraft(): void;
    ensureCurrentVersionIsNotDraft(): void;
    ensureLatestVersionIs(version: string): void;
    openUIEditor(): void;
    publishSchema(version?: string, confirmModal?: boolean): void;
    selectDraftVersion(): void;
    selectLatestVersion(): void;
  }
}

Cypress.Commands.add('discardDraft', () => {
  cy.getBySel('discard-btn').click();
});

Cypress.Commands.add('enableEditMode', () => {
  cy.getBySel('edit-schema-btn').should('be.visible').click();
});

Cypress.Commands.add('ensureCurrentVersionIsDraft', () => {
  // Version selector should display "Local draft"
  cy.getBySel('schema-version-select').contains('Local draft');

  // Discard draft button should become visible next to publish button
  cy.getBySel('discard-btn').should('be.visible');
});

Cypress.Commands.add('ensureCurrentVersionIsNotDraft', () => {
  // Discard draft button should be hidden
  cy.getBySel('discard-btn').should('not.exist');

  // Version selector should not display "Local draft"
  cy.getBySel('schema-version-select').should('not.have.text', 'Local draft');
});

Cypress.Commands.add('ensureLatestVersionIs', (version: string) => {
  cy.getBySel('schema-version-select')
    .find('button')
    .first()
    .should('contain.text', 'Latest')
    .should('contain.text', version);
});

Cypress.Commands.add('openUIEditor', () => {
  cy.get('[aria-label="UI editor"]').click();
});

Cypress.Commands.add('openUIEditor', () => {
  cy.get('[aria-label="UI editor"]').click();
});

Cypress.Commands.add('publishSchema', (version, confirmModal = true) => {
  cy.getBySel('publish-schema-btn')
    .not('.cogs-button--disabled')
    .should('not.be.disabled')
    .click();

  if (version !== undefined) {
    cy.get('input[name="create-new-version-radio"]').click();

    //should use getFDMVersion(), but if you add import at the top of this file
    //vscode blows up and throws errors everywhere in this file,
    //but also in the tests using these functions
    //using Cypress.env for now
    if (Cypress.env('FDM_VERSION') === '3') {
      cy.getBySel('publish-new-version-input').clear();
      cy.getBySel('publish-new-version-input').click().type(version);
    }
  }

  if (confirmModal) {
    cy.get('.cogs-modal-footer-buttons > .cogs-button--type-primary').click();
  }
});

Cypress.Commands.add('selectDraftVersion', () => {
  cy.getBySel('schema-version-select').click();
  cy.getBySel('schema-version-select-menu').contains('Local draft').click();
});

Cypress.Commands.add('selectLatestVersion', () => {
  cy.getBySel('schema-version-select').click();
  cy.getBySel('schema-version-select-menu')
    .contains('Latest')
    .click({ force: true });
});
