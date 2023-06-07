import { getFDMVersion } from '../../utils';
import { getUrl } from '../../utils/url';

describe('Platypus Data Preview Page - Preview', () => {
  beforeEach(() => {
    window.sessionStorage.setItem('agGridVirtualizationModeDisabled', 'true');
    cy.request('http://localhost:4200/reset');
    cy.visit(getUrl('/blog/blog/latest/data-management/preview'));
    cy.ensurePageFinishedLoading();
  });

  it('should load page', () => {
    cy.getBySel('types-list-panel').should('be.visible');
    cy.getBySel('types-list-filter').should('be.visible');
    cy.getBySel('types-list-item').should('have.length', 4);
  });

  it('should display only types with storage', () => {
    cy.getBySel('types-list-item').should('have.length', 4);
    cy.get('[data-testid="Post"]').should('be.visible');
    if (getFDMVersion() === 'V3') {
      cy.get('[data-testid="UserType"]').should('be.visible');
    }
    if (getFDMVersion() === 'V2') {
      cy.get('[data-testid="User"]').should('be.visible');
    }
    cy.get('[data-testid="Comment"]').should('be.visible');
    cy.get('[data-testid="TypeWithoutData"]').should('be.visible');
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

  // Needs mock-server support for V3
  it.skip('should preview the data for selected type', () => {
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
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="user"]'
    ).should('have.text', '123');

    // click to open side panel with list of primitives
    cy.contains(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="tags"]',
      'Lorem'
    ).dblclick();
    ['tags for Post', 'Lorem', 'Ipsum'].forEach((text) => {
      cy.getBySel('data-preview-side-panel').contains(text);
    });

    // close panel
    cy.getBySel('data-preview-side-panel')
      .get('[aria-label="side-panel-close-button"]')
      .click();
    cy.get('data-preview-side-panel').should('not.exist');

    // double click comments cell to show side panel
    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="comments"]'
    )
      .contains('987')
      .dblclick();
    ['comments for Post', '987', '995', '996', '997'].forEach((text) => {
      cy.getBySel('data-preview-side-panel').contains(text);
    });

    // double click non-list cell to close side panel
    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="title"]'
    ).dblclick();
    cy.get('data-preview-side-panel').should('not.exist');
  });

  it('should sort the data for selected type', () => {
    // managed by ag-grid
    const agGridSortableClass = 'ag-header-cell-sortable';

    cy.get('[data-testid="Post"]').click();
    cy.get('[data-testid="Post"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');

    // wait for rows to render
    cy.get('.ag-center-cols-container .ag-row').should('have.length', 3);

    // externalId and custom types and lists should not be sortable
    cy.get('.ag-header .ag-header-cell[col-id="externalId"]').should(
      'not.have.class',
      agGridSortableClass
    );
    cy.get('.ag-header .ag-header-cell[col-id="user"]').should(
      'not.have.class',
      agGridSortableClass
    );
    cy.get('.ag-header .ag-header-cell[col-id="tags"]').should(
      'not.have.class',
      agGridSortableClass
    );

    // Primitives should be sortable
    cy.get('.ag-header .ag-header-cell[col-id="title"]').should(
      'have.class',
      agGridSortableClass
    );

    // clicking on the header should sort the results
    // clicking once should sort asc
    cy.get('.ag-header .ag-header-cell[col-id="title"]').click();

    cy.get(
      '.ag-header .ag-header-cell[col-id="title"] [data-ref="eSortAsc"]'
    ).should('not.have.class', 'ag-hidden');

    // clicking again should sort desc
    cy.get('.ag-header .ag-header-cell[col-id="title"]').click();
    cy.get(
      '.ag-header .ag-header-cell[col-id="title"] [data-ref="eSortDesc"]'
    ).should('not.have.class', 'ag-hidden');

    // check the data
    // check strings
    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="title"]'
    ).should('have.text', 'Sic Dolor amet');
  });

  it('should filter the data for selected type', () => {
    cy.get('[data-testid="Post"]').click();
    cy.get('[data-testid="Post"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');

    // wait for rows to render
    cy.get('.ag-center-cols-container .ag-row').should('have.length', 3);

    // on hover, the menu button should be visible
    cy.get(
      '.ag-header .ag-header-cell[col-id="title"] .ag-header-cell-menu-button'
    ).should('exist');

    // when opened, the filter panel should be displayed
    cy.get(
      '.ag-header .ag-header-cell[col-id="title"] .ag-header-cell-menu-button'
    ).click({ force: true });
    cy.get('.ag-popup .ag-filter .ag-input-field input.ag-text-field-input')
      .first()
      .should('be.visible');

    // type the filter query and check the results, should filter after 500ms
    cy.get('.ag-popup .ag-filter .ag-input-field input.ag-text-field-input')
      .first()
      .type('Sic Dolor amet');

    // check the data
    // check strings
    // wait for rows to render
    cy.get('.ag-center-cols-container .ag-row').should('have.length', 1);
    cy.get(
      '.ag-body-viewport .ag-row[row-index="0"] .ag-cell[col-id="title"]'
    ).should('have.text', 'Sic Dolor amet');

    // clicking again should show filter form again and you should be able to reset the form
    cy.get(
      '.ag-header .ag-header-cell[col-id="title"] .ag-header-cell-menu-button'
    ).click({ force: true });

    // type the filter query and check the results, should filter after 500ms
    cy.get('.ag-popup .ag-filter button[ref="resetFilterButton"]').click();

    cy.get('.ag-center-cols-container .ag-row').should('have.length', 3);
  });

  // Needs mock-server support for V3
  it.skip('should search through primitive type list in the side panel', () => {
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

  //This passes, but should fail
  it('should show the no rows overlay when the table is empty', () => {
    cy.get('[data-testid="TypeWithoutData"]').click();
    cy.get('[data-testid="TypeWithoutData"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');

    cy.getBySel('no-rows-overlay').contains(
      'This data model type has currently no data'
    );
  });

  it('should show the latest label on the correct version', () => {
    cy.visit(getUrl('/blog/blog/latest'));
    cy.ensurePageFinishedLoading();

    cy.enableEditMode();

    if (getFDMVersion() === 'V2') {
      cy.openCodeEditorTab();
    }
    cy.appendTextToCodeEditor('type Author { name: String! }');

    cy.publishSchema('2');

    cy.visit(getUrl('/blog/blog/latest/data-management/preview'));
    cy.ensurePageFinishedLoading();
    cy.getBySel('schema-version-select').click();
    cy.get('.cogs-menu button:first')
      .should('contain', 'v. 2')
      .and('contain', 'Latest');
  });

  // Needs mock-server support for V3
  it.skip('double click to see direct relationships', () => {
    cy.get('[data-testid="Post"]').click();
    cy.get('[data-testid="Post"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');

    // first make sure table is rendered fully (all 3 rows)
    cy.get('div[role="gridcell"][col-id="user"]')
      .should('contain', '123')
      .should('contain', '456');

    cy.get('div[role="gridcell"][col-id="user"]').first().dblclick();

    cy.getBySel('data-preview-side-panel')
      .should('contain', '123')
      .should('contain', 'John Doe');
  });
});
