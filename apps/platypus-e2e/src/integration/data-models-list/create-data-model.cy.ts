import { getFDMVersion, getUrl } from '../../utils';

describe('Data models list - Create data model', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
    cy.visit(getUrl(''));
    cy.ensurePageFinishedLoading();
  });

  it('can create data model', () => {
    cy.createDataModel('cypress-test', 'cypress-test-space');

    // we should be redirected to /dashboard
    cy.url().should(
      'include',
      getUrl(
        `/${
          getFDMVersion() === 'V2' ? 'cypress_test' : 'cypress-test-space'
        }/cypress_test/latest`
      )
    );
    cy.getCogsToast('success').contains('Data Model successfully created');

    // we should see version select dropdown with draft
    cy.getBySel('schema-version-select').contains('Local draft');
  });
});
