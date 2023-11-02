import { getFDMVersion, getUrl } from '../../utils';

describe('Data model page - Schema visualizer', () => {
  beforeEach(() => {
    cy.request('http://localhost:4201/reset');
    cy.visit(getUrl('/blog/blog/latest'));
    cy.ensurePageFinishedLoading();
  });

  it('renders schema visualizer', () => {
    // Should render the visualizer
    cy.get('div[title="Post"]').should('be.visible');
    cy.get('div[title="Comment"]').should('be.visible');
  });

  it('can toggle schema visualizer for large data models', () => {
    let gqlSchema = ``;
    for (let i = 1; i < 32; i++) {
      gqlSchema += `type Type${i} { field${i}: String }\n`;
    }

    cy.enableEditMode();
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.setCodeEditorText(gqlSchema);

    // wait until visualizer loads with new types
    cy.get('div[title="Type1"]').should('be.visible');

    cy.getBySel('schema-visualizer-toggle-btn').should('be.visible').click();
    cy.getBySel('schema-visualizer-err-ctr').should('be.visible');

    cy.visit(getUrl('/blog/blog/latest'));
    cy.ensurePageFinishedLoading();
    cy.getBySel('schema-visualizer-err-ctr').should('be.visible');
    cy.getBySel('schema-visualizer-toggle-btn').should('be.visible').click();
    cy.getBySel('schema-visualizer-err-ctr').should('not.exist');
  });
});
