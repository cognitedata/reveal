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
    getDataModelFieldRow<E extends Node = HTMLElement>(
      fieldName: string
    ): Chainable<JQuery<E>>;
    ensureCurrentVersionIsDraft(): void;
    ensureCurrentVersionIsNotDraft(): void;
    mockUserToken(): void;
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

Cypress.Commands.add('assertQueryExplorerResult', (mockSuccess) => {
  return cy
    .window()
    .its('g.resultComponent.viewer')
    .invoke('getValue')
    .should('deep.equal', JSON.stringify(mockSuccess, null, 2));
});

Cypress.Commands.add(
  'addDataModelTypeField',
  (typeName: string, fieldName: string, isRequired?: boolean) => {
    // Add new type
    cy.get('[aria-label="Add field"]').click();
    cy.get('.ag-row-last [col-id="name"]').click();
    cy.get('.ag-row-last [col-id="name"] [data-cy="schema-type-field"]')
      .click()
      .type(fieldName)
      .type('{enter}');

    if (isRequired) {
      cy.get(`[data-cy="schema-type-field"][data-cy-value="${fieldName}"]`)
        .closest('.ag-row')
        .as('row');

      cy.get('@row').find(`[col-id="nonNull"] label`).click();
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

    cy.get(`[data-cy="schema-type-field"][data-cy-value="${fieldName}"]`)
      .closest('.ag-row')
      .as('row');

    cy.get('@row').find(`[col-id="name"]`).click();

    cy.get('@row')
      .find(`[col-id="name"] input`)
      .type('{selectAll}')
      .type(value)
      .type('{enter}');

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
  // // get cell renderer and click to focus and activate the cell editor
  // cy.get('.ag-row-last div[col-id="name"]').click();
  // cy.getBySel('schema-type-field').type('name').type('{enter}');

  // Find the row in the grid and click
  // initially the cell renderer is displayed
  // we need to click the cell to display the cell editor
  cy.get(`.ag-row-last div[col-id="name"]`).click();
  cy.get(`.ag-row-last [col-id="name"] [data-cy="schema-type-field"]`)
    .type('name')
    .type('{enter}');

  const typeSelector = `div#${typeName}.node`;
  // Wait for visualizer to be updated with new type before reloading page
  cy.get(typeSelector).should('be.visible').contains('name');
});

Cypress.Commands.add('deleteDataModelType', (typeName: string) => {
  cy.get(`[aria-label="Additional actions for ${typeName}"]`).click();
  cy.get('button').contains('Delete type').should('be.visible').click();
  cy.getBySel('modal-ok-button').should('contain', 'Delete Type').click();
});

Cypress.Commands.add('getDataModelFieldRow', (fieldName: string) => {
  return cy
    .get(`[data-cy="schema-type-field"][data-cy-value="${fieldName}"]`)
    .closest('.ag-row');
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

Cypress.Commands.add('mockUserToken', () => {
  cy.request('POST', 'http://localhost:4200/api/v1/token/inspect', {
    subject: 'OcJ9QWErtY35I-uzLiS2Razr7-i3ayRFG3oY5wbS-12345',
    projects: [
      {
        projectUrlName: 'platypus',
        groups: [123456789],
      },
    ],
    capabilities: [
      {
        dataModelsAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            dataModelScope: { externalIds: [] },
          },
          version: 1,
        },
        projectScope: {
          projects: ['platypus'],
        },
      },
      {
        dataModelInstancesAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            dataModelScope: { externalIds: [] },
          },
          version: 1,
        },
        projectScope: {
          projects: ['platypus'],
        },
      },
    ],
  });
});
