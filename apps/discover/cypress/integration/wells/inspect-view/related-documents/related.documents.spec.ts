import { CREATE_NEW_SET } from '../../../../../src/components/AddToFavoriteSetMenu/constants';
import { NO_RESULTS_TEXT } from '../../../../../src/components/EmptyState/constants';
import { DATA_SOURCE } from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../../src/pages/authorized/search/well/inspect/constants';
import { interceptCoreNetworkRequests } from '../../../../support/commands/helpers';
import { WELL_SOURCE_WITH_ALL } from '../../../../support/constants';

describe('Wells: Related documents', () => {
  before(() => {
    const coreRequests = interceptCoreNetworkRequests();
    cy.deleteAllFavorites();
    cy.addWaitForWdlResources('sources', 'GET', 'getSources');
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

  const createFavorite = (name: string) => {
    cy.findByLabelText('Name').type(name);
    cy.findByLabelText('Description').type('Some description');
    cy.findByRole('button', { name: 'Create' }).click();
  };

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

  it('should be able to filter related documents by Document Type', () => {
    cy.log('click on Document Type option from the right side panel');
    cy.findAllByTestId('histogram-btn').eq(0).click();

    cy.log('document category filter tag should be visible');
    cy.findAllByTestId('filter-tag').contains('Document Category:');

    cy.log('verify document count');
    cy.findAllByTestId('document-type-count')
      .invoke('text')
      .then(parseFloat)
      .then((docTypeCount) => {
        cy.findAllByTestId('table-row')
          .its('length')
          .should('eq', docTypeCount);
      });

    cy.log('clear filter');
    cy.findAllByTestId('filter-tag').click();
  });

  it('should be able to view & preview documents', () => {
    cy.findAllByTestId('table-row')
      .first()
      .children()
      .last()
      .children()
      .first()
      .invoke('attr', 'style', 'opacity: 1');

    cy.log('click on view button');
    cy.findAllByTestId('table-row')
      .first()
      .contains('View')
      .click({ force: true });

    cy.log('click on preview button');
    cy.findAllByTestId('table-row')
      .first()
      .contains('Preview')
      .click({ force: true });

    cy.log('close preview');
    cy.findAllByRole('img').eq(0).click();
  });

  it('Should be able to load more items in result table', () => {
    cy.findAllByTestId('table-row')
      .its('length')
      .then((rowCount) => {
        cy.log('click on `Load more` button');
        cy.findAllByText('Load more').scrollIntoView().click();

        cy.log('click again on `Load more` button');
        cy.findAllByText('Load more').scrollIntoView().click();

        cy.log('compare number of rows which visible on result table');
        cy.findAllByTestId('table-row').its('length').should('be.gt', rowCount);
      });
  });

  it('should be able to add related document into favorite folder', () => {
    cy.findAllByTestId('table-row')
      .first()
      .children()
      .last()
      .children()
      .first()
      .invoke('attr', 'style', 'opacity: 1')
      .findByTestId('menu-button')
      .trigger('mouseenter', { force: true });

    cy.findByText('Add to favorites').trigger('mouseenter', {
      force: true,
    });

    cy.findByRole('button', {
      name: CREATE_NEW_SET,
    }).click({ force: true });

    const favoriteName = `Favorite from Related DocumentResult hover, ${Date.now()}`;

    createFavorite(favoriteName);

    cy.goToFavoritesPage();

    cy.log('created favorite folder should visible');
    cy.findByTitle(favoriteName).should('be.visible').click();

    cy.log('navigate to documents tab');
    cy.findByTestId('favorite-details-content-navigation')
      .findAllByRole('tab')
      .eq(0)
      .click();

    cy.log('document table should contain one row');
    cy.findByTestId('favorite-documents-table')
      .findAllByTestId('table-row')
      .should('have.length', 1);
  });
});
