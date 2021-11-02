import { EXPAND_MAP_TEXT, NO_RESULTS_TEXT } from '../../support/constants';

const duplicateFileName = 'duplicate document.json';
export const filename = 'Test PDF file';

describe('Documents', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
  });

  it('Show expanded metadata on row click', () => {
    cy.log('Search for duplicate document');
    cy.doSearch(duplicateFileName);
    cy.findAllByTestId('table-cell')
      .contains(`${duplicateFileName} (2)`)
      .first()
      .click();

    cy.log('Check document row is expanded and metadata is visible');
    cy.findByTestId('document-metadata')
      .should('exist')
      .within(() => {
        cy.log(
          'Check that Original path is correct and that it has 2 entries for duplicated document'
        );
        cy.contains('/path 1/path_2/path3/').should('exist');
        cy.contains('/path 1/path_2/path3/path4/').should('exist');
      });
  });

  it('Should search documents by input or filters', () => {
    // setup interception to wait on HTTP request
    cy.intercept({
      path: '/discover-e2e-bluefield/document/categories',
      method: 'GET',
    }).as('getCategories');

    cy.log('Check that no search phrase or filter is applied on load');
    cy.findByTestId('main-search-input')
      .find('div.cogs-select__placeholder')
      .should('have.text', 'Search');

    cy.log('Open Documents filters');
    cy.findByTestId('side-bar').within(() => {
      cy.contains('Documents').click();
    });

    cy.wait('@getCategories');

    cy.log('Open all categories and check that all checkboxes are unchecked');
    cy.contains('File Type').click();
    cy.contains('Document Category').click();
    cy.contains('Source').click();
    cy.findByTestId('side-bar')
      .get('input[type=checkbox]')
      .each((element) => {
        cy.wrap(element).should('not.be.checked');
      });

    cy.log(`Perform input search for: ${filename}`);
    cy.doSearch(filename);
    cy.log(`Search results should be shown in the table`);
    cy.findAllByTestId('table-row').should('have.length.greaterThan', 0);

    cy.log('Apply File Type filter: PDF');
    cy.findAllByTestId('filter-checkbox-label')
      .contains('PDF')
      .should('be.visible')
      .click();

    cy.log('Close/Open File Type category and check that filter stays applied');
    cy.contains('File Type').click();
    cy.contains('File Type').click();
    cy.get('input[type=checkbox][id*="PDF"]').should('be.checked');

    cy.log('Remove input filter value by filter tag');
    cy.findAllByTestId('filter-tag')
      .contains(filename)
      .findByTestId('close')
      .click();

    cy.log('Check result after input removal');
    cy.findAllByTestId('table-row').should('have.length', 4);

    cy.log('Remove File Type filter by filter tag');
    cy.findAllByTestId('filter-tag')
      .contains('PDF')
      .findByTestId('close')
      .click();

    cy.log('Check result after file type removal');
    cy.findAllByTestId('table-row').should('have.length', 9);

    cy.log('Apply input filter again');
    cy.doSearch(filename);
    cy.findAllByTestId('table-row').should('have.length.greaterThan', 0);

    cy.log('Apply other filters');
    cy.findAllByTestId('filter-checkbox-label')
      .contains('PDF')
      .should('be.visible')
      .click();

    cy.findAllByTestId('filter-checkbox-label')
      .contains('unclassified')
      .should('be.visible')
      .click();

    cy.findAllByTestId('filter-checkbox-label')
      .contains('test-drive')
      .should('be.visible')
      .click();

    cy.log('Apply Date Range filter');
    cy.contains('Date Range').click();
    cy.get('.cogs-tab-input').first().click();
    cy.get('button').contains('Apply').click();
    cy.get('.cogs-tab-input').last().click();
    cy.get('button').contains('Apply').click();

    cy.log('Check that we have the date range filter tag and remove it');
    cy.findAllByTestId('filter-tag')
      .contains('Created:')
      .should('exist')
      .findByTestId('close')
      .click();

    cy.log('Result should be empty');
    cy.contains(NO_RESULTS_TEXT);

    cy.log('Switching to Favorites page should leave filter active');
    cy.findByTestId('top-bar').contains('Favorites').click();

    cy.wait(1000);

    cy.log('Go back to Search page');
    cy.findByTestId('top-bar').contains('Search').click();
    cy.get('input[type=checkbox][id*="PDF"]').should('be.checked');
    cy.get('input[type=checkbox][id*="unclassified"]').should('be.checked');
    cy.get('input[type=checkbox][id*="test-drive"]').should('be.checked');

    cy.log(
      'Check that document filter tags are available and we can remove them'
    );
    cy.findByTestId('side-bar').findByLabelText('Go back').click();
    cy.findAllByTestId('filter-tag').contains('PDF');
    cy.findAllByTestId('filter-tag').contains('unclassified');
    cy.findAllByTestId('filter-tag').contains('test-drive');
    cy.findAllByTestId('filter-tag')
      .contains('PDF')
      .findByTestId('close')
      .click();

    cy.log('Remove all filter by pressing "Clear all" filter tag');
    cy.clearAllFilters();
    cy.log('Check that no filter tags exist');
    cy.findByTestId('document-filter-container')
      .findAllByTestId('filter-tag')
      .should('not.exist');
    cy.findAllByTestId('table-row').should('have.length', 9);

    cy.log('Clicking on app logo should close results table');
    cy.findByTestId('cognite-logo').should('be.visible').click();
    cy.contains(EXPAND_MAP_TEXT).should('not.exist');
  });

  it('Click Preview document hover button', () => {
    cy.doSearch(filename);
    cy.findAllByTestId('table-row')
      .first()
      .children()
      .last()
      .children()
      .first()
      .invoke('attr', 'style', 'opacity: 1');

    cy.findAllByTestId('table-row')
      .first()
      .contains('Preview')
      .click({ force: true });

    cy.get('div[class*="cogs-modal-header"]')
      .should('be.visible')
      .should('have.text', 'Document Preview')
      .type('{ESC}');
  });
});
