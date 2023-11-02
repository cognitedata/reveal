import { getFDMVersion } from '../../utils';
import { getUrl } from '../../utils/url';

describe('Data model page - Publishing', () => {
  beforeEach(() => {
    cy.request('http://localhost:4201/reset');
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
    // eslint-disable-next-line
    cy.wait(1000);

    cy.appendTextToCodeEditor('type Author {name: String}');
    cy.ensureVisualizerFinishedLoading();

    cy.publishSchema(version);
    cy.typeShouldExistInVisualizer('Author');
    cy.ensureLatestVersionIs(version);
  });

  it('should validate unsupported features when publishing', () => {
    cy.enableEditMode();
    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.setCodeEditorText('enum Role { Admin, User }');

    // since enums are not supported ensure that publish schema is disabled
    cy.getBySelLike('publish-schema-btn').should(
      'have.attr',
      'aria-disabled',
      'true'
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
