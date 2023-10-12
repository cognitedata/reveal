import { getUrl } from '../../utils/url';

describe('Data model list - Access control', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
  });
  it('cannot access data model according to token', () => {
    cy.mockUserToken();
    // blog should not be visible
    cy.visit(getUrl('/blog/blog/latest'));
    cy.ensurePageFinishedLoading();

    // edit button should be disabled
    cy.getBySel('edit-schema-btn').should(
      'have.class',
      'cogs-button--disabled'
    );
  });
  it('cannot create data model according to token', () => {
    cy.mockUserToken();
    cy.visit(getUrl(''));
    cy.ensurePageFinishedLoading();

    cy.getBySel('create-data-model-btn').should('have.attr', 'aria-disabled');
  });
});
