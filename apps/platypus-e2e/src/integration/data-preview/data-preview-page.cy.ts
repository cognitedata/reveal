describe('Platypus Data Preview Page - Preview', () => {
  beforeEach(() => {
    window.sessionStorage.setItem('agGridVirtualizationModeDisabled', 'true');
    cy.request('http://localhost:4200/reset');
    cy.visit('/platypus/data-models/blog/latest/data/data-management/preview');
  });

  it('should load page', () => {
    cy.getBySel('page-title').contains('Data management');
    cy.getBySel('types-list-panel').should('be.visible');
    cy.getBySel('types-list-filter').should('be.visible');
    cy.getBySel('types-list-item').should('have.length', 4);
  });

  it('should display only types with storage', () => {
    cy.getBySel('types-list-item').should('have.length', 4);
    cy.get('[data-testid="Post"]').should('be.visible');
    cy.get('[data-testid="User"]').should('be.visible');
    cy.get('[data-testid="Comment"]').should('be.visible');
  });

  it('should redirect to first type', () => {
    cy.get('[data-testid="Post"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');
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
    cy.get('.ag-header .ag-header-cell[col-id="externalId"]').should(
      'be.visible'
    );
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
    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="views"]'
    ).should('have.text', '254');

    // check custom col types
    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="user"] .cogs-tag'
    ).should('have.text', '123');
  });

  it('should search through primitive type list in the side panel', () => {
    cy.get('[data-testid="Post"]').click();
    cy.get('[data-testid="Post"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');

    // wait for rows to render
    cy.get('.ag-center-cols-container .ag-row').should('have.length', 3);

    // check if all fields are rendered as cols
    cy.get('.ag-header .ag-header-cell[col-id="externalId"]').should(
      'be.visible'
    );
    cy.get('.ag-header .ag-header-cell[col-id="title"]').should('be.visible');
    cy.get('.ag-header .ag-header-cell[col-id="views"]').should('be.visible');

    // last two should be rendered but not visible (scroller)
    cy.get('.ag-header .ag-header-cell[col-id="user"]').should('exist');
    cy.get('.ag-header .ag-header-cell[col-id="comments"]').should('exist');

    // check strings
    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="title"]'
    ).should('have.text', 'Lorem Ipsum');

    // check custom col types
    cy.contains(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="tags"]',
      'Lorem'
    ).dblclick();

    // search for Lorem
    cy.getBySel('side-panel-search-button').click();
    cy.getBySel('side-panel-search-input').type('Lorem');

    // check if other options are visible
    cy.getBySel('data-preview-side-panel').should('not.contain.text', 'Ipsum');

    // close panel
    cy.getBySel('data-preview-side-panel')
      .get('[aria-label="side-panel-close-button"]')
      .click();
    cy.getBySel('data-preview-side-panel').should('not.exist');
  });

  it('should show the no rows overlay when the table is empty', () => {
    cy.get('[data-testid="TypeWithoutData"]').click();
    cy.get('[data-testid="TypeWithoutData"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');

    cy.getBySel('no-rows-overlay').contains(
      'This data model type has currently no data'
    );
  });

  it('should show the latest label on the correct version', () => {
    cy.visit('/platypus/data-models/blog/latest');
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.get('[aria-label="Additional actions for TypeWithoutData"]').click();
    cy.get('button').contains('Delete type').should('be.visible').click();
    cy.getBySel('modal-ok-button').should('contain', 'Delete Type').click();
    cy.getBySel('publish-schema-btn').click();
    cy.getBySel('modal-ok-button')
      .should('contain', 'Publish new version')
      .click();

    cy.visit('/platypus/data-models/blog/latest/data/data-management/preview');
    cy.getBySel('schema-version-select').click();
    cy.get('.cogs-menu button:last').click();

    cy.getBySel('schema-version-select').click();
    cy.get('.cogs-menu button:last').should('contain.text', 'Latest');
  });
});
