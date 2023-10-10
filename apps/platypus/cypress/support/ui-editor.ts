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
    addFieldViaUIEditor(
      fieldName: string,
      fieldType: string,
      isRequired?: boolean
    ): void;
    addTypeViaUIEditor(typeName: string): void;
    deleteFieldViaUIEditor(fieldName: string): void;
    deleteTypeViaUIEditor(typeName: string): void;
    deleteUIEditorType(type: string): void;
    editFieldViaUIEditor(
      fieldName: string,
      newName?: string,
      fieldType?: string,
      required?: boolean
    ): void;
    ensureUIEditorIsVisible(): void;
    ensureTypeDefsEditorIsVisible(): void;
    getFieldRowViaUIEditor<E extends Node = HTMLElement>(
      fieldName: string
    ): Chainable<JQuery<E>>;
    goBackToUIEditorTypeList(): void;
    goToUIEditorType(type: string): void;
    openUIEditorTab(): void;
    typeShouldExistInUIEditor(typeName: string): void;
    typeShouldNotExistInUIEditor(typeName: string): void;
  }
}

Cypress.Commands.add(
  'addFieldViaUIEditor',
  (fieldName: string, fieldType: string, isRequired?: boolean) => {
    //This only works when cypress window is focused if you debug with --watch
    cy.get('body')
      .then(($body) => {
        if ($body.find("[data-cy='add-field-btn']").length) {
          cy.getBySel('add-field-btn').as('add-field-btn');
          cy.get('@add-field-btn').click();
        }
      })
      .then(() => {
        cy.get('.ag-row-last [col-id="name"]').click();
        cy.get('.ag-row-last [col-id="name"] [data-cy="schema-type-field"]')
          .click()
          .type(fieldName)
          .type('{enter}');

        cy.get(
          '.ag-row-last [col-id="type"] [data-cy="schema-type-field"]'
        ).click();

        cy.get('[data-cy="select-String"]')
          .find('.cogs-select__menu-list')
          .contains(fieldType)
          .should('exist')
          .click();

        if (isRequired) {
          cy.get(`[data-cy="schema-type-field"][data-cy-value="${fieldName}"]`)
            .closest('.ag-row')
            .as('row');
          cy.get('@row').find(`[col-id="nonNull"]`).click();
        }
      });
  }
);

Cypress.Commands.add('addTypeViaUIEditor', (typeName: string) => {
  // Add new type
  cy.getBySel('add-type-btn').should('be.visible').click();
  cy.getBySel('type-name-input').should('be.visible').type(typeName);
  cy.get('.cogs-modal-footer-buttons > .cogs-button--type-primary')
    .should('be.visible')
    .click();
});

Cypress.Commands.add('deleteFieldViaUIEditor', (field) => {
  cy.get(`[data-cy="schema-type-field"][data-cy-value="${field}"]`)
    .closest('.ag-row')
    .as('row');

  cy.get('@row').find("[data-cy='delete-field-btn']").click();
});

Cypress.Commands.add('deleteTypeViaUIEditor', (typeName: string) => {
  cy.get(`[aria-label="Additional actions for ${typeName}"]`).click();
  cy.get('button').contains('Delete type').should('be.visible').click();
  cy.get('.cogs-button--type-destructive')
    .should('contain', 'Delete Type')
    .click();
});

Cypress.Commands.add('deleteUIEditorType', (type: string) => {
  cy.getBySel(`type-list-item-${type}`).should('be.visible').as('typeListItem');

  cy.get('@typeListItem').find('.cogs-dropdown').click();
  cy.get('@typeListItem').contains('Delete type').click();
});

Cypress.Commands.add(
  'editFieldViaUIEditor',
  (fieldName, newName?, fieldType?, required?) => {
    cy.get(`[data-cy="schema-type-field"][data-cy-value="${fieldName}"]`)
      .closest('.ag-row')
      .as('row');

    if (newName && newName !== '') {
      cy.get('@row').find(`[col-id="name"]`).click();
      cy.get('@row')
        .find(`[col-id="name"] input`)
        .type('{selectAll}')
        .type(newName)
        .type('{enter}');
    }

    if (fieldType && fieldType != '') {
      cy.get('@row').find('[col-id="type"]').click();

      cy.get('[data-cy="select-String"]')
        .find('.cogs-select__menu-list')
        .contains(fieldType)
        .should('exist')
        .click();
    }

    if (typeof required !== 'undefined') {
      cy.get('body').then(($body) => {
        const col = $body
          .find(`[data-cy="schema-type-field"][data-cy-value="${fieldName}"]`)
          .find(`[col-id="nonNull"]`);
        const input = col.find('input');

        // eslint-disable-next-line
        // @ts-ignore
        if (input.checked !== required) {
          col.click();
        }
      });
    }
  }
);

Cypress.Commands.add('ensureUIEditorIsVisible', () => {
  cy.getBySel('ui-editor-list-title').should('be.visible');
});

Cypress.Commands.add('ensureTypeDefsEditorIsVisible', () => {
  cy.get(
    '[data-cy="editor_panel"] .cog-data-grid.cog-data-grid-compact'
  ).should('be.visible');

  cy.get(
    '[data-cy="editor_panel"] .cog-data-grid.cog-data-grid-compact .ag-row'
  )
    .its('length')
    .should('be.gte', 1);
});

Cypress.Commands.add('getFieldRowViaUIEditor', (fieldName: string) => {
  return cy
    .get(`[data-cy="schema-type-field"][data-cy-value="${fieldName}"]`)
    .closest('.ag-row');
});

Cypress.Commands.add('goBackToUIEditorTypeList', () => {
  cy.getBySel('type-view-back-button').should('be.visible').click();
});

Cypress.Commands.add('goToUIEditorType', (type: string) => {
  cy.getBySel(`type-list-item-${type}`).should('be.visible').click();
});

Cypress.Commands.add('openUIEditorTab', () => {
  cy.getBySel('ui-editor-tab-btn').should('be.visible').click();
  cy.ensurePageFinishedLoading();
});

Cypress.Commands.add('typeShouldExistInUIEditor', (typeName: string) => {
  cy.getBySel(`type-list-item-${typeName}`).should('exist');
});

Cypress.Commands.add('typeShouldNotExistInUIEditor', (typeName: string) => {
  cy.getBySel(`type-list-item-${typeName}`).should('not.exist');
});
