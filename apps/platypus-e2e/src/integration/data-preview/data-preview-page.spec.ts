describe('Platypus Data Preview Page - Preview', () => {
  beforeEach(() => {
    window.sessionStorage.setItem('agGridVirtualizationModeDisabled', 'true');
    cy.visit(
      '/platypus/solutions/posts-example/latest/data/data-management/preview'
    );
  });

  it('should load page', () => {
    cy.getBySel('page-title').contains('Data management');
    cy.getBySel('types-list-panel').should('be.visible');
    cy.getBySel('types-list-filter').should('be.visible');
    cy.getBySel('types-list-item').should('have.length', 3);
  });

  it('should display only types with storage', () => {
    cy.getBySel('types-list-item').should('have.length', 3);
    cy.get('[data-testid="Post"]').should('be.visible');
    cy.get('[data-testid="User"]').should('be.visible');
    cy.get('[data-testid="Comment"]').should('be.visible');
  });

  it('should filter types', () => {
    cy.getBySel('types-list-filter').should('be.visible');
    cy.getBySel('types-list-filter').type('Comment');
    cy.getBySel('types-list-item').should('have.length', 1);
    cy.get('[data-testid="User"]').should('not.exist');
    cy.get('[data-testid="Comment"]').should('be.visible');
  });

  it('should preview the data for selected type', () => {
    cy.get('[data-testid="Post"]').click();
    cy.get('[data-testid="Post"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');

    // check if all fields are rendered as cols
    cy.get('.ag-header .ag-header-cell[col-id="id"]').should('be.visible');
    cy.get('.ag-header .ag-header-cell[col-id="title"]').should('be.visible');
    cy.get('.ag-header .ag-header-cell[col-id="views"]').should('be.visible');

    // last two should be rendered but not visible (scroller)
    cy.get('.ag-header .ag-header-cell[col-id="user"]').should('exist');
    cy.get('.ag-header .ag-header-cell[col-id="comments"]').should('exist');

    // check the data
    // check strings
    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="title"]'
    ).should('have.text', 'Lorem Ipsum');

    // check numbers
    cy.get('.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="views"]')
      .should('have.text', '254')
      .should('have.class', 'ag-right-aligned-cell');

    // check custom col types
    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="user"] .cogs-tag'
    ).should('have.text', '{"_externalId":""}');
  });

  it('should display data preview if no data', () => {
    cy.get('[data-testid="Comment"]').click();
    cy.getBySel('data-preview-table').should('be.visible');
    cy.get('.ag-header .ag-header-cell[col-id="body"]').should('be.visible');
    cy.get('.ag-body-viewport .ag-row .ag-cell[col-id="body"]')
      .should('exist')
      .should('have.text', '');
  });
});
