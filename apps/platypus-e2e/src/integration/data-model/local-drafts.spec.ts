const addType = () => {
  // Add new type
  cy.get('[aria-label="UI editor"]').click();
  cy.getBySel('edit-schema-btn').should('be.visible').click();
  cy.getBySel('add-type-btn').should('be.visible').click();
  cy.getBySel('type-name-input').should('be.visible').type('Horse');
  cy.getBySel('modal-ok-button').should('be.visible').click();
  cy.getBySel('schema-type-field').type('name');

  // Wait for visualizer to be updated with new type before reloading page
  cy.get('div#Horse.node').should('be.visible');
};

const ensureCurrentVersionIsDraft = () => {
  // Version selector should display "Local draft"
  cy.getBySel('schema-version-select').contains('Local draft');

  // Discard draft button should become visible next to publish button
  cy.getBySel('discard-btn').should('be.visible');

  // All changes saved status text should display next to version selector
  cy.getBySel('changes-saved-status-text').should('be.visible');
};

const ensureCurrentVersionIsNotDraft = () => {
  // Discard draft button should be hidden
  cy.getBySel('discard-btn').should('not.exist');

  // "All changes saved" status text should be hidden
  cy.getBySel('changes-saved-status-text').should('not.exist');
  // Version selector should not display "Local draft"
  cy.getBySel('schema-version-select').should('not.have.text', 'Local draft');
};

describe('Data Model Page - Local Drafts', () => {
  beforeEach(() => cy.visit('/platypus/solutions/new-schema/latest/data'));

  it('persists unpublished changes after page refresh', () => {
    addType();
    ensureCurrentVersionIsDraft();

    // New type is still present after page refresh
    cy.reload();
    cy.getBySel('schema-version-select')
      .click()
      .contains('Local draft')
      .click();
    cy.getBySel('type-list-item-Horse').should('be.visible');
  });

  it('persists unpublished changes after navigating away and back', () => {
    addType();
    ensureCurrentVersionIsDraft();

    cy.visit('/platypus/');
    cy.visit('/platypus/solutions/new-schema/latest/data');

    cy.getBySel('schema-version-select')
      .click()
      .contains('Local draft')
      .click();
    cy.getBySel('type-list-item-Horse').should('be.visible');
  });

  it('clears local draft when user clicks to discard', () => {
    addType();

    cy.getBySel('discard-btn').click();

    ensureCurrentVersionIsNotDraft();

    // UI editor, code editor and schema visualizer should be updated
    cy.get('div#Horse.node').should('not.exist');
    cy.getBySel('type-list-item-Horse').should('not.exist');
    cy.get('[aria-label="Code editor"]').click();
    cy.get('.monaco-editor textarea:first')
      .type('{selectAll}')
      .should('not.have.text', 'type Horse');
  });

  it('publishes draft', () => {
    addType();
    cy.getBySel('publish-schema-btn').click();

    // A toast message should notify user when schema has been published successfully
    cy.getBySel('toast-title').should('have.text', 'Data model updated');

    ensureCurrentVersionIsNotDraft();
  });
});
