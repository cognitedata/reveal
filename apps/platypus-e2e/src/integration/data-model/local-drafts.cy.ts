import { getFDMVersion, getUrl } from '../../utils';

describe('Data model page - Local drafts', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
    cy.visit(getUrl('/blog/blog/latest'));
    cy.ensurePageFinishedLoading();
  });

  it('persists unpublished changes after page refresh', () => {
    const typeName = 'Currency';
    const type = `type ${typeName} {name: String}\n`;

    cy.enableEditMode();
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.appendTextToCodeEditor(type);
    cy.ensureCurrentVersionIsDraft();

    // Writing localStorage to disk seems to be done in the
    // background async. If we reload immediately after appending text
    // it doesn't have enough time to write to disk resulting
    // in localStorage not beeing saved, therefore we need to check the visualizer
    // before reloading
    cy.typeShouldExistInVisualizer(typeName);

    cy.reload();
    cy.ensurePageFinishedLoading();

    cy.selectDraftVersion();

    cy.typeShouldExistInVisualizer(typeName);
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.codeEditorContains(type);

    // Publish button is clickable
    cy.getBySel('publish-schema-btn').should(
      'not.have.class',
      'cogs-button--disabled'
    );
  });

  it('clears the draft when user removes all types from an unpublished data model', () => {
    // Create new data model
    cy.visit(getUrl(''));
    cy.ensurePageFinishedLoading();
    cy.createDataModel('cypress-test', 'cypress-test');

    // Add and then remove a type
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }

    cy.setCodeEditorText(`type Person {name: String}`);
    cy.typeShouldExistInVisualizer('Person');

    cy.reload();
    cy.ensurePageFinishedLoading();

    cy.typeShouldExistInVisualizer('Person');

    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.clearCodeEditor();
    cy.typeShouldNotExistInVisualizer('Person');

    // After refreshing, the draft should not contain the Person type
    cy.reload();
    cy.ensurePageFinishedLoading();
    cy.typeShouldNotExistInVisualizer('Person');
    cy.getBySel('editor_panel').contains('Unable to parse').should('not.exist');
  });

  it('persists unpublished changes after navigating away and back', () => {
    const typeName = 'Currency';

    cy.enableEditMode();
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.appendTextToCodeEditor(`type ${typeName} {name: String}`);
    cy.ensureCurrentVersionIsDraft();
    cy.typeShouldExistInVisualizer(typeName);

    cy.visit(getUrl(''));
    cy.ensurePageFinishedLoading();
    cy.visit(getUrl('/blog/blog/latest'));
    cy.ensurePageFinishedLoading();

    cy.selectDraftVersion();

    cy.typeShouldExistInVisualizer(typeName);
  });

  it('clears local draft when user clicks to discard', () => {
    const typeName = 'Currency';
    cy.enableEditMode();
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.appendTextToCodeEditor(`type ${typeName} { name: String }`);
    cy.ensureCurrentVersionIsDraft();
    cy.typeShouldExistInVisualizer(typeName);

    cy.discardDraft();

    cy.ensureCurrentVersionIsNotDraft();
    cy.typeShouldNotExistInVisualizer(typeName);
    cy.codeEditorDoesNotContain(`type ${typeName}`);
    // Edit button is visible again
    cy.getBySel('edit-schema-btn').should('be.visible');
  });

  it('publishes draft', () => {
    cy.enableEditMode();
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.appendTextToCodeEditor(`type Currency { name: String}`);

    cy.publishSchema();

    // A toast message should notify user when schema has been published successfully
    cy.getBySel('toast-title').should('have.text', 'Data model published');

    cy.ensureCurrentVersionIsNotDraft();

    // Edit button is visible again
    cy.getBySel('edit-schema-btn').should('be.visible');
    cy.enableEditMode();

    // Publish button should be disabled until we make a change
    cy.getBySel('publish-schema-btn').should(
      'have.class',
      'cogs-button--disabled'
    );
  });

  it('loads only drafts owned by Data Model ', () => {
    const typeName = 'Currency';
    // Edit current data model and create a draft
    cy.enableEditMode();
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.appendTextToCodeEditor(`type ${typeName} { name: String }`);
    cy.ensureCurrentVersionIsDraft();
    cy.typeShouldExistInVisualizer(typeName);

    // Go back to Data Models Page and Create new Data Model
    cy.visit(getUrl(''));
    cy.ensurePageFinishedLoading();
    cy.createDataModel('cypress-test-drafts', 'cypress-test-drafts');

    cy.typeShouldNotExistInVisualizer(typeName);
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.codeEditorDoesNotContain(typeName);
  });
});
