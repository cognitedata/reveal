import { getUrl } from '../../utils/url';

describe('Data models list - List data models', () => {
  beforeEach(() => {
    window.sessionStorage.setItem('agGridVirtualizationModeDisabled', 'true');
    cy.request('http://localhost:4200/reset');
    cy.visit(getUrl(''));
    cy.ensurePageFinishedLoading();
  });

  it('displays title', () => {
    cy.getBySel('data-models-title').contains('Data Models');
  });

  it('displays data models', () => {
    cy.get('.cog-data-grid').should('be.visible');

    // wait for rows to render
    cy.get('.ag-center-cols-container .ag-row')
      .its('length')
      .should('be.gte', 1);

    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="name"]'
    ).should('contains.text', 'blog');
  });

  it('can search for data models', () => {
    cy.get('.cog-data-grid').should('be.visible');
    cy.getBySel('search-data-models').should('be.visible');

    cy.getBySel('search-data-models').type('bl');

    // check the data
    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="name"]'
    ).should('contains.text', 'blog');
  });
});
