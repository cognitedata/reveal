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
    cy.getBySel('types-list-item').should('have.length', 3);
  });

  it('should display only types with storage', () => {
    cy.getBySel('types-list-item').should('have.length', 3);
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

  it('should show the no rows overlay when the table is empty', () => {
    cy.get('[data-testid="User"]').click();
    cy.get('[data-testid="User"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');

    cy.intercept(
      'POST',
      'api/v1/projects/mock/datamodelstorage/nodes/delete'
    ).as('deleteNodes');

    // Wait for row to be rendered
    cy.get('div[role="gridcell"][col-id="name"]')
      .should('be.visible')
      .should('contain', 'John Doe');

    cy.get('div[role="gridcell"][col-id="_isDraftSelected"]').each(($el) => {
      cy.wrap($el).should('be.visible').click();
    });

    const response = {
      data: {
        listUser: {
          items: [],
        },
        aggregateUser: {
          items: [
            {
              count: {
                externalId: 0,
              },
            },
          ],
        },
      },
    };

    cy.intercept(
      'POST',
      '/api/v1/projects/mock/schema/api/blog/1/graphql',
      response
    );
    cy.on('window:confirm', () => true);
    cy.getBySel('btn-pagetoolbar-delete').click();
    cy.getBySel('data-row-confirm-deletion-checkbox').click();
    cy.getBySel('modal-ok-button').click();

    cy.wait('@deleteNodes').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.getBySel('no-rows-overlay').contains(
      'This data model type has currently no data'
    );
  });
});
