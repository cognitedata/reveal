import { getUrl } from '../../utils/url';

describe('Platypus Data Models Page - List Data Models', () => {
  beforeEach(() => {
    window.sessionStorage.setItem('agGridVirtualizationModeDisabled', 'true');
    cy.request('http://localhost:4200/reset');
    cy.visit(getUrl(''));
  });

  it('should display title', () => {
    cy.getBySel('data-models-title').contains('Data Models');
  });

  it('should display data models', () => {
    cy.get('.cog-data-grid').should('be.visible');

    // wait for rows to render
    cy.get('.ag-center-cols-container .ag-row')
      .its('length')
      .should('be.gte', 1);

    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="name"]'
    ).should('contains.text', 'blog');
  });

  it('should search data models', () => {
    cy.get('.cog-data-grid').should('be.visible');
    cy.getBySel('search-data-models').should('be.visible');

    cy.getBySel('search-data-models').type('bl');

    // check the data
    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="name"]'
    ).should('contains.text', 'blog');
  });
});
