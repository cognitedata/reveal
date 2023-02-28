import { getFDMVersion } from '../../utils';
import { getUrl } from '../../utils/url';

describe('Data Model Page - Code editor', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset').then(() => {
      cy.visit(getUrl('/blog/blog/latest'));
      cy.ensurePageFinishedLoading();
    });
  });

  it('renders code editor', () => {
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.ensureCodeEditorIsVisible();
  });

  it('can type text to code editor with changes reflected in UI editor and visualizer', () => {
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }

    cy.enableEditMode();
    const text = `type Tag { name: String! }\n\n`;
    cy.typeTextInCodeEditor(text);

    cy.codeEditorContains(text);

    cy.typeShouldExistInVisualizer('Tag');
    cy.typeShouldHaveFieldInVisualizer('Tag', [
      { field: 'name', type: 'String', required: true },
    ]);

    if (getFDMVersion() === 'V2') {
      cy.openUIEditorTab();
      cy.typeShouldExistInUIEditor('Tag');
    }
  });
});
