import { getFDMVersion } from '../../utils';
import { getUrl } from '../../utils/url';

describe('Data model page - Publishing', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
    cy.visit(getUrl('/blog/blog/latest'));
    cy.ensurePageFinishedLoading();
  });

  it('can publish new data model versions', () => {
    let version = 'beta';
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
      version = '2';
    }

    cy.enableEditMode();

    cy.appendTextToCodeEditor('type Author {name: String}');
    cy.ensureDraftHasBeenSaved();

    cy.publishSchema(version);
    cy.typeShouldExistInVisualizer('Author');
    cy.ensureLatestVersionIs(version);
  });

  it('should validate unsuported features when publishing', () => {
    cy.enableEditMode();
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.setCodeEditorText('enum Role { Admin, User }');

    cy.publishSchema(undefined, false);
    // breaking changes dialog should be displayed even before publishing
    cy.getBySelLike('toast-title').contains(
      'Error: could not validate data model'
    );
    cy.getBySelLike('toast-body').contains(
      'Your Data Model GraphQL schema contains errors.'
    );
  });

  it('should validate GraphQl schema with breaking changes when publishing', () => {
    cy.enableEditMode();
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.setCodeEditorText('type Post { title: String }');

    if (getFDMVersion() === 'V2') {
      cy.publishSchema(undefined, false);
      cy.getBySel('breaking-changes-container').should(
        'contain.text',
        'Breaking change(s)'
      );
      cy.getBySel('breaking-changes-container').should(
        'contain.text',
        "* Type 'User' was removed"
      );
    } else {
      cy.publishSchema();
      // breaking changes dialog should be displayed even before publishing
      cy.getBySelLike('toast-title').contains(
        'Error: could not update data model'
      );
      cy.getBySelLike('toast-body').contains('Breaking change(s):');
    }
  });
});
