import { getFDMVersion, getUrl } from '../../utils';

describe('Platypus Data Models Page - Create Data Model', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
    cy.visit(getUrl(''));
  });

  it('should contain create button', () => {
    cy.getBySel('create-data-model-btn').should('be.visible');
  });

  it('should create data model', () => {
    cy.getBySel('create-data-model-btn').click();
    cy.getBySelLike('modal-title').contains('Create Data Model');
    cy.getBySel('input-data-model-name').type('cypress-test');

    // if V3, select space
    if (getFDMVersion() === 'V3') {
      cy.selectSpace('cypress-test-space');
    }

    cy.getBySel('modal-ok-button').click();

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
