describe('Data Model Page - Local Drafts', () => {
  function createDataModel(name: string) {
    // Create new data model
    cy.visit('/');
    cy.getBySel('create-data-model-btn').click();
    cy.getBySel('input-data-model-name').type(name);
    cy.getBySel('modal-ok-button').click();
  }

  function typeShouldNotExist(typeName: string) {
    cy.get(`div#${typeName}.node`).should('not.exist');
    cy.getBySel(`type-list-item-${typeName}`).should('not.exist');
  }

  function typeShouldExist(typeName: string) {
    cy.get(`div#${typeName}.node`).should('exist');
    cy.getBySel(`type-list-item-${typeName}`).should('exist');
  }

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

    // Publish button is clickable
    cy.getBySel('publish-schema-btn').should('not.have.attr', 'disabled');
  });

  it('clears the draft when user removes all types from a published data model', () => {
    const typeNames = ['Post', 'User', 'Comment'];
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    typeNames.forEach((typeName) => {
      cy.deleteDataModelType(typeName);
    });

    function checkIfLocalDraftIsEmpty() {
      cy.getBySel('schema-version-select')
        .click()
        .contains('Local draft')
        .click();
      typeNames.forEach((typeName) => typeShouldNotExist(typeName));
    }

    // No types are present after page refresh
    cy.reload();
    checkIfLocalDraftIsEmpty();

    // Discard button should still be visible when schema is empty
    cy.getBySel('discard-btn').should('be.visible');

    // after switching versions, local draft should still be empty
    cy.getBySel('schema-version-select').click().contains('Latest').click();

    // Discard button should still be visible when schema is empty
    cy.getBySel('edit-schema-btn').should('be.visible');
    cy.getBySel('type-list-item-Post').should('exist');
    typeShouldExist('Post');

    checkIfLocalDraftIsEmpty();
  });

  it('clears the draft when user removes all types from an unpublished data model', () => {
    // Create new data model
    createDataModel('cypress-test');

    // Add and then remove a type
    cy.get('[aria-label="Add type"]').click();
    cy.getBySel('type-name-input').should('be.visible').type('Person');
    cy.getBySel('modal-ok-button').should('be.visible').click();
    cy.getBySel('type-view-back-button').should('be.visible').click();
    cy.deleteDataModelType('Person');

    // After refreshing, the draft should not contain the Person type
    cy.reload();
    cy.getBySel('type-list-item-Person').should('not.exist');
    cy.getBySel('editor_panel').contains('Unable to parse').should('not.exist');
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
    typeShouldNotExist('Currency');

    cy.get('[aria-label="Code editor"]').click();
    cy.get('.monaco-editor textarea:first')
      .type('{selectAll}')
      .should('not.have.text', 'type Currency');

    // Edit button is visible again
    cy.getBySel('edit-schema-btn').should('be.visible');
  });

  it('publishes draft', () => {
    cy.addDataModelType('Currency');
    cy.getBySel('publish-schema-btn').click();

    // A toast message should notify user when schema has been published successfully
    cy.getBySel('toast-title').should('have.text', 'Data model updated');

    cy.ensureCurrentVersionIsNotDraft();

    // Edit button is visible again
    cy.getBySel('edit-schema-btn').click();

    // Publish button should be disabled until we make a change
    cy.getBySel('publish-schema-btn').should('have.attr', 'disabled');
    cy.getBySel(`type-list-item-Currency`).click();
    cy.addDataModelTypeField('Currency', 'foo');
    cy.getBySel('publish-schema-btn').should('not.have.attr', 'disabled');
  });

  it('Loads only drafts owned by Data Model ', () => {
    // Edit current data model and create a draft
    cy.visit('/platypus/data-models/blog/latest/data');
    cy.addDataModelType('Currency');

    // Go back to Data Models Page and Create new Data Model
    createDataModel('cypress-test-drafts');

    typeShouldNotExist('Currency');

    cy.get('[aria-label="Code editor"]').click();
    cy.get('.monaco-editor textarea:first')
      .type('{selectAll}')
      .should('not.have.text', 'type Currency');
  });
});
