import { NO_RESULTS_TEXT } from '../../../../../src/components/EmptyState/constants';
import { DATA_SOURCE } from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../../src/pages/authorized/search/well/inspect/constants';
import { interceptCoreNetworkRequests } from '../../../../support/commands/helpers';
import { WELL_SOURCE_WITH_ALL } from '../../../../support/constants';

describe('Wells: Related documents', () => {
  before(() => {
    const coreRequests = interceptCoreNetworkRequests();
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.wait(coreRequests);
    cy.selectCategory('Wells');
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_SOURCE,
            subCategory: DATA_SOURCE,
            value: {
              name: WELL_SOURCE_WITH_ALL,
              type: 'select',
            },
          },
        ],
      },
    });

    cy.toggleSelectAllRows();

    cy.openInspectView();

    cy.goToWellsInspectTab(TAB_NAMES.RELATED_DOCUMENTS);
  });

  it('should be able to search related documents by name', () => {
    cy.log('filter results by name');
    cy.findAllByTestId('related-document-table')
      .findAllByTestId('table-cell')
      .eq(2)
      .invoke('text')
      .then((relatedDocName) => {
        cy.log(`Found: ${relatedDocName}`);
        cy.findByTestId('input-search')
          .click()
          .type('{selectall}')
          .type(`${relatedDocName}{enter}`);
      });

    cy.log('result table should contain only one row');
    cy.findByTestId('related-document-table')
      .findAllByTestId('table-row')
      .its('length')
      .should('eq', 1);

    cy.log('click on clear all button');
    cy.clickButton('clear-all-filter-button', 'data-testid');

    cy.log('table should be reset');
    cy.findByTestId('related-document-table')
      .findAllByTestId('table-row')
      .its('length')
      .should('be.greaterThan', 1);

    cy.log('clear search string');
    cy.clickButton('Clear input field', 'aria-label');

    cy.log('search by invalid string');
    cy.findByTestId('input-search')
      .click()
      .type('{selectall}')
      .type(`invalid-string{enter}`);

    cy.log('empty state should visible');
    cy.findByText(NO_RESULTS_TEXT).should('be.visible');

    cy.log('clear search string');
    cy.clickButton('Clear input field', 'aria-label');
  });

  it('should be able to filter related documents by file type', () => {
    cy.log('click on File Type filter');
    cy.findAllByText('File Type').click();

    cy.log('by default all the options should be unchecked');
    cy.get('[id="checkbox-option"]')
      .as('checkbox-option')
      .should('not.be.checked');

    cy.log('select first option from the list');
    cy.get('@checkbox-option').eq(1).click({ force: true });

    cy.log('Selected fillter should be applied');
    cy.get('@checkbox-option')
      .eq(1)
      .parent()
      .invoke('text')
      .then((selectedFileType) => {
        cy.findAllByTestId('table-cell')
          .eq(4)
          .invoke('text')
          .then((valInCell) => {
            expect(valInCell).eql(selectedFileType);
          });
      });

    cy.log('remove filter by clicking on filter tag');
    cy.clickButton('filter-tag', 'data-testid');
  });
});
