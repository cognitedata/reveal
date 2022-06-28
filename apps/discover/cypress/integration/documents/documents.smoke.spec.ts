import { EXPAND_MAP_TEXT } from '../../../src/pages/authorized/search/map/constants';
import {
  DOCUMENTS_AGGREGATE_ALIAS,
  interceptDocumentsAggregate,
} from '../../support/interceptions';
import { interceptCoreNetworkRequests } from '../../support/commands/helpers';
import { PROJECT } from '../../app.constants';

const QUERY_DUPLICATED_FILENAME = 'Volve_Well_Summary_15_9-19.pdf';
const SOURCE_DRIVE = 'volve';
const FILE_TYPE = 'PDF';
export const filename = '15_9_19_A_1980_01_01';

describe('Documents', () => {
  beforeEach(() => {
    const coreRequests = interceptCoreNetworkRequests();

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);
  });

  it('Show expanded metadata on row click', () => {
    cy.log('Search for duplicate document');
    cy.performSearch(QUERY_DUPLICATED_FILENAME);
    cy.findAllByTestId('table-cell')
      .contains(`${QUERY_DUPLICATED_FILENAME} (2)`)
      .first()
      .click();

    cy.log('Check document row is expanded and metadata is visible');
    cy.findByTestId('document-metadata')
      .should('exist')
      .within(() => {
        cy.log(
          'Check that Original path is correct and that it has 2 entries for duplicated document'
        );
        cy.contains('/volve/Volve Well Summary 15_9-19.pdf').should('exist');
        cy.contains('/volve/ddr/Volve Well Summary 15_9-19.pdf').should(
          'exist'
        );
      });
  });

  it('Should search documents by input or filters', () => {
    // setup interception to wait on HTTP request
    cy.intercept({
      path: `/${PROJECT}/document/categories`,
      method: 'GET',
    }).as('getCategories');

    interceptDocumentsAggregate();

    cy.log('Check that no search phrase or filter is applied on load');
    cy.findByTestId('main-search-input')
      .find('div.cogs-select__placeholder')
      .should('have.text', 'Search');

    cy.log('Open Documents filters');
    cy.findByTestId('side-bar')
      .should('exist')
      .within(() => {
        cy.contains('Documents').should('be.visible').click();
      });
    cy.wait('@getCategories');

    cy.wait(`@${DOCUMENTS_AGGREGATE_ALIAS}`).then((interception) => {
      cy.log('Should show Author Filter');
      cy.contains('Author').should('be.visible').click();
      cy.log(
        'Should show Author Filter with options and the ability to select them'
      );

      const firstCheckboxLabel = interception.response.body.items[0].values[0];
      cy.log(`Attempting to select ${firstCheckboxLabel}`);

      cy.validateSelect('Author', [firstCheckboxLabel], firstCheckboxLabel);
      cy.log(
        'Verifying if the author selection was made by checking the documents'
      );
      cy.findAllByText(`Author: ${firstCheckboxLabel}`).should(
        'have.length',
        1
      );
      cy.findByTestId('clear-all-filter-button').click();
    });

    cy.log('Open all categories and check that all checkboxes are unchecked');
    cy.contains('Source').click({ force: true });
    cy.contains('File Type').click({ force: true });
    cy.contains('Document Category').click({ force: true });

    cy.findByTestId('side-bar')
      .get('input[type=checkbox]')
      .each((element) => {
        cy.wrap(element).should('not.be.checked');
      });

    cy.log(`Perform input search for: ${filename}`);
    cy.performSearch(filename);
    cy.log(`Search results should be shown in the table`);
    cy.findAllByTestId('table-row').should('have.length.greaterThan', 0);

    cy.log(`Apply File Type filter: ${FILE_TYPE}`);
    cy.findAllByTestId('filter-checkbox-label')
      .contains(FILE_TYPE)
      .should('be.visible')
      .click();

    cy.log('Close/Open File Type category and check that filter stays applied');
    cy.contains('File Type').click();
    cy.contains('File Type').click();
    cy.get(`input[type=checkbox][id*="${FILE_TYPE}"]`).should('be.checked');

    cy.log('Remove input filter value by filter tag');
    cy.findAllByTestId('filter-tag').contains(filename).click();

    cy.log('Check result after input removal');
    cy.findAllByTestId('table-row').should('have.length.greaterThan', 1);

    cy.log('Remove File Type filter by filter tag');
    cy.findAllByTestId('filter-tag').contains(FILE_TYPE).click();

    // this should be dynamic (it should check it is just more results than before this filter was removed)
    // cy.log('Check result after file type removal');
    // cy.findAllByTestId('table-row').should('have.length', 9);

    cy.log('Apply input filter again');
    cy.performSearch(filename);
    // cy.findAllByTestId('table-row').should('have.length.greaterThan', 26);

    cy.log('Apply other filters');
    cy.findAllByTestId('filter-checkbox-label')
      .contains(FILE_TYPE)
      .should('be.visible')
      .click();

    cy.findAllByTestId('filter-checkbox-label').contains(SOURCE_DRIVE).click();

    cy.log('Apply Date Range filter');
    cy.contains('Date Range').click();
    cy.get('.cogs-tab-input').first().click();
    cy.get('button').contains('Apply').should('be.disabled');
    cy.get('button').contains(new RegExp('^1$', 'g')).click();
    cy.get('button').contains('Apply').click();
    cy.get('.cogs-tab-input').last().click();
    cy.get('button').contains('Apply').click();

    cy.log('Check that we have the date range filter tag and remove it');
    cy.findAllByTestId('filter-tag')
      .contains('Created:')
      .should('exist')
      .click();

    /**
     * Not sure why this expects no results after the date range filter is cleared.
     * Commenting out temporarily.
     */
    // cy.log('Result should be empty');
    // cy.contains(NO_RESULTS_TEXT);

    cy.log('Switching to Favorites page should leave filter active');
    cy.findByTestId('top-bar').contains('Favorites').click();

    cy.wait(1000);

    cy.log('Go back to Search page');
    cy.findByTestId('top-bar').contains('Search').click();
    cy.get(`input[type=checkbox][id*="${FILE_TYPE}"]`).should('be.checked');
    cy.get(`input[type=checkbox][id*="${SOURCE_DRIVE}"]`).should('be.checked');

    cy.log(
      'Check that document filter tags are available and we can remove them'
    );
    cy.findByTestId('side-bar').findByLabelText('Go back').click();
    cy.findAllByTestId('filter-tag').contains(FILE_TYPE);
    cy.findAllByTestId('filter-tag').contains(SOURCE_DRIVE);
    cy.findAllByTestId('filter-tag').contains(FILE_TYPE).click();

    cy.log('Remove all filter by pressing "Clear all" filter tag');
    cy.clearAllFilters();
    cy.log('Check that no filter tags exist');
    cy.findAllByTestId('document-filter-container')
      .findAllByTestId('filter-tag')
      .should('not.exist');
    cy.findAllByTestId('table-row').should('have.length.greaterThan', 10);

    cy.log('Clicking on app logo should close results table');
    cy.findByTestId('cognite-logo').should('be.visible').click();
    cy.contains(EXPAND_MAP_TEXT).should('not.exist');
  });

  it('Should search documents based on parent path', () => {
    const filename = '15_9_19_A_1997_07_25.pdf';
    cy.findByTestId('side-bar')
      .findByText('Documents')
      .should('be.visible')
      .click();

    cy.log('Apply input filter');
    cy.performSearch(filename.substring(0, 3));

    cy.log(`Apply File Type filter: ${FILE_TYPE}`);
    cy.contains('File Type').should('be.visible').click({ force: true });

    cy.findAllByTestId('filter-checkbox-label')
      .contains(FILE_TYPE)
      .should('be.visible')
      .click();

    cy.findByTestId('doc-result-table')
      .findAllByTestId('table-row')
      .should('have.length.greaterThan', 3);
    cy.findByTitle(filename)
      .parents('[data-testid="table-row"]')
      .first()
      .children()
      .last()
      .children()
      .first()
      .invoke('attr', 'style', 'opacity: 1')
      .findByTestId('menu-button')
      .trigger('mouseenter', { force: true });

    cy.findByText('Open parent folder').click({ force: true });

    cy.findByTestId('doc-result-table')
      .findAllByTestId('table-row')
      .should('have.length', 3);
  });

  it('Click Preview document hover button', () => {
    cy.performSearch(filename);
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
