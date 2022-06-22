describe('Data Model Page - Local Drafts', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
    cy.visit('/platypus/data-models/blog/latest/data');
  });

  it('persists unpublished changes after page refresh', () => {
    cy.getBySel('discard-btn').should('not.exist');
    cy.addDataModelType('Currency');
    cy.ensureCurrentVersionIsDraft();

    // New type is still present after page refresh
    cy.reload();
    cy.getBySel('schema-version-select')
      .click()
      .contains('Local draft')
      .click();
    cy.getBySel('type-list-item-Currency').should('be.visible');
  });

  it('persists unpublished changes after navigating away and back', () => {
    cy.addDataModelType('Currency');
    cy.ensureCurrentVersionIsDraft();

    cy.visit('/platypus/');
    cy.visit('/platypus/data-models/blog/latest/data');

    cy.getBySel('schema-version-select')
      .click()
      .contains('Local draft')
      .click();
    cy.getBySel('type-list-item-Currency').should('be.visible');
  });

  it('clears local draft when user clicks to discard', () => {
    cy.addDataModelType('Currency');

    cy.getBySel('discard-btn').click();

    cy.ensureCurrentVersionIsNotDraft();

    // UI editor, code editor and schema visualizer should be updated
    cy.get('div#Currency.node').should('not.exist');
    cy.getBySel('type-list-item-Currency').should('not.exist');
    cy.get('[aria-label="Code editor"]').click();
    cy.get('.monaco-editor textarea:first')
      .type('{selectAll}')
      .should('not.have.text', 'type Currency');
  });

  it('publishes draft', () => {
    cy.addDataModelType('Currency');
    cy.getBySel('publish-schema-btn').click();

    // A toast message should notify user when schema has been published successfully
    cy.getBySel('toast-title').should('have.text', 'Data model updated');

    cy.ensureCurrentVersionIsNotDraft();
  });
});
