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
    getBySel<E extends Node = HTMLElement>(
      selector: string
    ): Chainable<JQuery<E>>;
    getBySelLike<E extends Node = HTMLElement>(
      selector: string
    ): Chainable<JQuery<E>>;
    getCogsToast<E extends Node = HTMLElement>(
      type: 'success' | 'error'
    ): Chainable<JQuery<E>>;
    setQueryExplorerQuery(query: string): void;
    clickQueryExplorerExecuteQuery(): void;
    assertQueryExplorerResult(expectedResult: any, timeout?: number): void;
    addDataModelType(typeName: string): void;
    deleteDataModelType(typeName: string): void;
    addDataModelTypeField(
      typeName: string,
      fieldName: string,
      isRequired?: boolean
    ): void;
    editDataModelTypeFieldName(
      typeName: string,
      fieldName: string,
      value: string,
      openType?: boolean
    ): void;
    ensureCurrentVersionIsDraft(): void;
    ensureCurrentVersionIsNotDraft(): void;
  }
}
//
// -- Helpers --
Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-cy*=${selector}]`, ...args);
});

Cypress.Commands.add('getCogsToast', (type, ...args) => {
  const cogsTypeClass =
    type === 'success' ? 'cogs-toast-success' : 'cogs-toast-error';

  return cy.get(`.Toastify .${cogsTypeClass}`, ...args);
});

Cypress.Commands.add('clickQueryExplorerExecuteQuery', () => {
  // eslint-disable-next-line
  cy.wait(300);
  return cy.get('.execute-button').click();
});

Cypress.Commands.add('setQueryExplorerQuery', (query: string) => {
  return cy
    .get('.CodeMirror-lines')
    .first()
    .click()
    .type('{selectAll}')
    .type(query, { parseSpecialCharSequences: false });
});

Cypress.Commands.add(
  'assertQueryExplorerResult',
  (mockSuccess, timeout = 400) => {
    // eslint-disable-next-line
    cy.wait(timeout);
    return cy.window().then((w) => {
      // eslint-disable-next-line
      // @ts-ignore
      const value = w.g.resultComponent.viewer.getValue();
      expect(value).to.deep.equal(JSON.stringify(mockSuccess, null, 2));
    });
  }
);

Cypress.Commands.add(
  'addDataModelTypeField',
  (typeName: string, fieldName: string, isRequired?: boolean) => {
    // Add new type
    cy.get('[aria-label="Add field"]').click();
    cy.getBySel('schema-type-field').last().click().type(fieldName);

    if (isRequired) {
      cy.getBySel('checkbox-field-required').last().click();
    }

    // Wait for visualizer to be updated with new type
    cy.get(`div#${typeName}.node`).should('be.visible').contains(fieldName);
  }
);
Cypress.Commands.add(
  'editDataModelTypeFieldName',
  (typeName: string, fieldName: string, value: string, openType = true) => {
    // Add new type
    cy.get('[aria-label="UI editor"]').click();
    if (openType) {
      cy.getBySel(`type-list-item-${typeName}`).click();
    }
    cy.get(`[data-cy=data_model_type_field_${fieldName}] > input`)
      .type('{selectAll}')
      .type(value);

    const typeSelector = `div#${typeName}.node`;
    // Wait for visualizer to be updated with new type before reloading page
    cy.get(typeSelector).should('be.visible').contains(value);
  }
);

Cypress.Commands.add('addDataModelType', (typeName: string) => {
  // Add new type
  cy.get('[aria-label="UI editor"]').click();
  cy.getBySel('edit-schema-btn').should('be.visible').click();
  cy.getBySel('add-type-btn').should('be.visible').click();
  cy.getBySel('type-name-input').should('be.visible').type(typeName);
  cy.getBySel('modal-ok-button').should('be.visible').click();
  cy.getBySel('schema-type-field').type('name');

  const typeSelector = `div#${typeName}.node`;
  // Wait for visualizer to be updated with new type before reloading page
  cy.get(typeSelector).should('be.visible').contains('name');
});

Cypress.Commands.add('deleteDataModelType', (typeName: string) => {
  cy.get(`[aria-label="Additional actions for ${typeName}"]`).click();
  cy.get('button').contains('Delete type').should('be.visible').click();
  cy.getBySel('modal-ok-button').should('contain', 'Delete Type').click();
});

Cypress.Commands.add('ensureCurrentVersionIsDraft', () => {
  // Version selector should display "Local draft"
  cy.getBySel('schema-version-select').contains('Local draft');

  // Discard draft button should become visible next to publish button
  cy.getBySel('discard-btn').should('be.visible');

  // All changes saved status text should display next to version selector
  cy.getBySel('changes-saved-status-text').should('be.visible');
});

Cypress.Commands.add('ensureCurrentVersionIsNotDraft', () => {
  // Discard draft button should be hidden
  cy.getBySel('discard-btn').should('not.exist');

  // "All changes saved" status text should be hidden
  cy.getBySel('changes-saved-status-text').should('not.exist');
  // Version selector should not display "Local draft"
  cy.getBySel('schema-version-select').should('not.have.text', 'Local draft');
});
