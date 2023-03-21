import { getUrl } from '../../utils/url';

describe('Platypus Data Preview Page - Column Selection', () => {
  beforeEach(() => {
    window.sessionStorage.setItem('agGridVirtualizationModeDisabled', 'true');
    cy.request('http://localhost:4200/reset');
    cy.visit(getUrl('/blog/blog/latest/data-management/preview'));
    cy.ensurePageFinishedLoading();
  });

  it('should toggle off column', () => {
    cy.getBySel('page-title').contains('Data management');
    cy.getBySel('column-select-dropdown').should('not.exist');
    cy.getBySel('column-select').click();
    cy.getBySel('column-select-dropdown').should('be.visible');
    // toggle externalId
    cy.get('input[type="checkbox"]#externalId').should('be.checked');
    cy.get('input[type="checkbox"]#externalId').click();
    cy.get('input[type="checkbox"]#externalId').should('not.be.checked');

    cy.getBySel('column-select').click();

    cy.get('.ag-header-row').should('contain', 'title');
    cy.get('.ag-header-row').should('not.contain', 'externalId');
  });

  it('should toggle all on and off column', () => {
    cy.getBySel('page-title').contains('Data management');
    cy.getBySel('column-select-dropdown').should('not.exist');
    cy.getBySel('column-select').click();
    cy.getBySel('column-select-dropdown').should('be.visible');
    // toggle de select all
    cy.getBySel('deselect-all').click();
    cy.get('input[type="checkbox"]#title').should('not.be.checked');

    // toggle select all
    cy.getBySel('select-all').click();
    cy.get('input[type="checkbox"]#title').should('be.checked');

    // keep just externalId on
    cy.getBySel('deselect-all').click();
    cy.get('input[type="checkbox"]#title').should('not.be.checked');
    cy.get('input[type="checkbox"]#externalId').click();

    cy.getBySel('column-select').click();

    cy.get('.ag-header-row').should('not.contain', 'title');
    cy.get('.ag-header-row').should('contain', 'externalId');
  });

  it('should see all selected', () => {
    cy.getBySel('page-title').contains('Data management');
    cy.getBySel('column-select-dropdown').should('not.exist');
    cy.getBySel('column-select').click();
    cy.getBySel('column-select-dropdown').should('be.visible');

    // keep just externalId on
    cy.getBySel('deselect-all').click();
    cy.get('input[type="checkbox"]#title').should('not.be.checked');
    cy.get('input[type="checkbox"]#externalId').click();

    cy.getBySel('column-select-dropdown').should('contain', 'title');
    cy.getBySel('selected-columns-only').click();
    cy.getBySel('column-select-dropdown').should('not.contain', 'title');

    cy.getBySel('column-select').click();

    cy.get('.ag-header-row').should('not.contain', 'title');
    cy.get('.ag-header-row').should('contain', 'externalId');
  });
});
