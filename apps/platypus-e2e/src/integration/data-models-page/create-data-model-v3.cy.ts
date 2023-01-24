import { getV3Url } from '../../utils/url';

describe('Platypus Data Models Page - Create Data Model - V3', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
    cy.visit(getV3Url(''));
  });

  it('should contain create button', () => {
    cy.getBySel('create-data-model-btn').should('be.visible');
  });

  it('should create data model', () => {
    cy.getBySel('create-data-model-btn').click();
    cy.getBySelLike('modal-title').contains('Create Data Model');
    cy.getBySel('input-data-model-name').type('cypress-test');

    cy.get('.cogs-select__placeholder').contains('Select space').click();
    cy.getBySel('create-space-btn').click();
    cy.getBySel('input-data-model-space').type('cypress-test-space');
    cy.getBySelLike('modal-title')
      .contains('Create new space')
      .parents('.cogs-modal-content')
      .children('.buttons')
      .children('[data-cy="modal-ok-button"]')
      .click();
    // newly created space is auto selected, so we don't have to select it via dropdown again
    cy.getBySelLike('modal-title')
      .contains('Create new space')
      .should('be.hidden');

    cy.getBySel('modal-ok-button').should('be.visible').click();
    // we should be redirected to /dashboard
    cy.url().should(
      'include',
      '/data-models/cypress-test-space/cypress_test/latest'
    );
    cy.getCogsToast('success').contains('Data Model successfully created');

    // we should see version select dropdown with draft
    cy.getBySel('schema-version-select').contains('Local draft');
  });
});
