import { getUrl } from '../../utils/url';

describe('Data Model Page - UI editor', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset').then(() => {
      cy.visit(getUrl('/blog/blog/latest'));
      cy.ensurePageFinishedLoading();
      cy.openUiEditorTab();
    });
  });

  it('renders with correct types', () => {
    cy.ensureUIEditorIsVisible();
    cy.typeShouldExistInUIEditor('Post');
    cy.typeShouldExistInUIEditor('UserType');
    cy.typeShouldExistInUIEditor('Comment');
    cy.typeShouldExistInUIEditor('TypeWithoutData');
  });

  it('can add type', () => {
    cy.enableEditMode();
    cy.addTypeViaUIEditor('CypressTest');

    cy.goBackToUIEditorTypeList();

    cy.typeShouldExistInUIEditor('CypressTest');
    cy.typeShouldExistInVisualizer('CypressTest');

    cy.openCodeEditorTab();
    cy.codeEditorContains('type CypressTest');
  });

  it('can delete type', () => {
    cy.enableEditMode();
    cy.deleteTypeViaUIEditor('Post');

    cy.typeShouldNotExistInUIEditor('Post');
    cy.typeShouldNotExistInVisualizer('Post');

    cy.openCodeEditorTab();
    cy.codeEditorDoesNotContain('type Post');
  });

  // Requires cypress window to be focused if using --watch
  it('can add type with fields', () => {
    const typeName = 'CypressTest';

    cy.enableEditMode();
    cy.addTypeViaUIEditor(typeName);

    cy.ensureTypeDefsEditorIsVisible();
    cy.addFieldViaUIEditor('nameZ', 'String', true);
    cy.addFieldViaUIEditor('ageZ', 'Int');
    cy.addFieldViaUIEditor('isActiveZ', 'Boolean', true);

    cy.goBackToUIEditorTypeList();

    cy.typeShouldExistInUIEditor(typeName);
    cy.typeShouldHaveFieldInVisualizer(typeName, ['name', 'age', 'isActive']);

    cy.openCodeEditorTab();
    cy.codeEditorContains('type CypressTest');
    cy.codeEditorContains('nameZ: String!');
    cy.codeEditorContains('ageZ: Int');
    cy.codeEditorContains('isActiveZ: Boolean!');
  });

  // Requires cypress browser to be focused when using --watch
  it('can edit type fields', () => {
    cy.enableEditMode();
    cy.goToUIEditorType('Post');

    cy.editFieldViaUIEditor('title', undefined, 'Boolean', true);
    cy.typeShouldHaveFieldInVisualizer('Post', [
      { field: 'title', type: 'Boolean', required: true },
    ]);

    cy.openCodeEditorTab();
    cy.codeEditorContains('title: Boolean!');
  });

  it('can delete type fields', () => {
    cy.enableEditMode();
    cy.goToUIEditorType('Post');

    cy.deleteFieldViaUIEditor('title');
    cy.typeShouldNotHaveFieldInVisualizer('Post', 'title');

    cy.openCodeEditorTab();
    cy.codeEditorDoesNotContain('title');
  });

  it('updates and reflects changes correctly when draft is discarded', () => {
    cy.enableEditMode();
    cy.addTypeViaUIEditor('Cypress');
    cy.discardDraft();
    cy.typeShouldNotExistInUIEditor('Cypress');
  });

  it('loads and displays types without fields correctly', () => {
    cy.enableEditMode();
    cy.addTypeViaUIEditor('Cypress');
    cy.reload();
    cy.ensurePageFinishedLoading();
    cy.openUiEditorTab();
    cy.ensureUIEditorIsVisible();
    cy.typeShouldExistInUIEditor('Cypress');
  });

  it('updates correctly when navigating between versions', () => {
    cy.enableEditMode();
    cy.addTypeViaUIEditor('Cypress');
    cy.goBackToUIEditorTypeList();

    cy.ensureCurrentVersionIsDraft();
    cy.typeShouldExistInUIEditor('Cypress');

    cy.selectLatestVersion();

    cy.typeShouldNotExistInUIEditor('Cypress');

    cy.selectDraftVersion();
    cy.typeShouldExistInUIEditor('Cypress');
  });
});
