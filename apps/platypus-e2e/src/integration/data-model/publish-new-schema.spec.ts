describe('Data Model Page - Publish new schema', () => {
  beforeEach(() =>
    cy.visit('/platypus/solutions/schema-versions-test/latest/data')
  );

  it('should edit and publish new schema', () => {
    // This should come imported from the mock package
    const currentSchema = 'type Test @template { name: String }\n';
    const selectAllKeys = Cypress.platform == 'darwin' ? '{cmd}a' : '{ctrl}a';

    cy.getBySel('edit-schema-btn').click();
    cy.get('.monaco-editor textarea:first')
      .click()
      .focused()
      .type(selectAllKeys)
      .type('{selectall}{backspace}{selectall}{backspace}');

    cy.get('.monaco-editor textarea:first')
      .click()
      .focused()
      .type(currentSchema, {
        force: true,
        parseSpecialCharSequences: false,
      });

    cy.get('.monaco-editor textarea:first').should('have.value', currentSchema);

    cy.get('div#Test.node').should('be.visible');
    cy.getBySel('publish-schema-btn').click();

    cy.getCogsToast('success').contains('Schema was succesfully saved.');
  });
});
