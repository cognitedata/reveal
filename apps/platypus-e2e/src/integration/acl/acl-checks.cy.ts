import { getUrl } from '../../utils/url';

describe('Platypus Data Models Page - Create Data Model', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
  });
  it('should not have access to data model according to token', () => {
    cy.mockUserToken();
    // blog should not be visible
    cy.visit(getUrl('/blog/blog/latest'));

    // edit button should be disabled
    cy.getBySel('edit-schema-btn').should('be.disabled');
  });
  it('should not have access to creating a data model according to token', () => {
    cy.mockUserToken();
    cy.visit(getUrl(''));
    cy.getBySel('create-data-model-btn').should('be.disabled');
  });
});
