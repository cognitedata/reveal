/* eslint-disable prettier/prettier */
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
    appendTextToCodeEditor(text: string): void;
    clearCodeEditor(): void;
    codeEditorContains(value: string): void;
    codeEditorDoesNotContain(value: string): void;
    ensureCodeEditorIsVisible(): void;
    openCodeEditorTab(): void;
    setCodeEditorText(text: string): void;
    typeTextInCodeEditor(text: string): void;
  }
}

Cypress.Commands.add('appendTextToCodeEditor', (text: string) => {
  cy.ensureCodeEditorIsVisible();
  cy.get('.monaco-editor textarea:first')
    .type(`{pageDown}\n\n`, { force: true })
    .type(text, { parseSpecialCharSequences: false, force: true });
});

Cypress.Commands.add('clearCodeEditor', () => {
  cy.ensureCodeEditorIsVisible();
  cy.setCodeEditorText('');
});

Cypress.Commands.add('codeEditorContains', (value: string) => {
  cy.ensureCodeEditorIsVisible();
  cy.window()
    .its('monaco')
    .should('exist')
    .should((monaco) => {
      expect(monaco.editor.getModels()[0].getValue()).to.contain(value);
    });
});

Cypress.Commands.add('codeEditorDoesNotContain', (value: string) => {
  cy.ensureCodeEditorIsVisible();
  cy.window()
    .its('monaco')
    .should('exist')
    .should((monaco) => {
      //Editor might be empty and not contain anything
      if (monaco.editor.getModels().length) {
        expect(monaco.editor.getModels()[0].getValue()).to.not.contain(value);
      }
    });
});

Cypress.Commands.add('ensureCodeEditorIsVisible', () => {
  cy.get('.monaco-editor textarea:first').should('be.visible');
  // cy.get('.monaco-editor.rename-box');
});

Cypress.Commands.add('openCodeEditorTab', () => {
  cy.getBySel('code-editor-tab-btn').click();
  cy.ensurePageFinishedLoading();
});

Cypress.Commands.add('setCodeEditorText', (text: string) => {
  cy.ensureCodeEditorIsVisible();
  /**
   * TODO(@nrwl/cypress): Nesting Cypress commands in a should assertion now throws.
   * You should use .then() to chain commands instead.
   * More Info: https://docs.cypress.io/guides/references/migration-guide#-should
   **/
  cy.window()
    .its('monaco')
    .should('exist')
    .should((monaco) => {
      monaco.editor.getModels()[0].setValue(text);
    })
    .then(() => {
      // Trigger onChange events
      cy.typeTextInCodeEditor('\n');
    });
});

Cypress.Commands.add('typeTextInCodeEditor', (text: string) => {
  cy.ensureCodeEditorIsVisible();
  cy.get('.monaco-editor textarea:first').type(text, {
    parseSpecialCharSequences: false,
    force: true,
  });
});
