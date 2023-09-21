import {
  FILE_LIST_ALIAS,
  interceptFileList,
} from '../support/interceptions/interceptions';

describe('Files filters', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    interceptFileList();

    cy.goToTab('Files');
    cy.wait(`@${FILE_LIST_ALIAS}`);
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter files by file type', () => {
    const FILE_TYPE = 'Image';

    cy.tableSholudBeVisible('documents-search-results').selectColumn(
      'File type'
    );

    cy.log('click on file type filter');
    cy.findAllByTestId('multi-select-filter-File types').click();

    cy.log('search and select file type');
    cy.findAllByTestId('multi-select-filter-File types-search-input').type(
      FILE_TYPE
    );
    cy.get('input[type="checkbox"]').check();

    /**
     * We should wait until the table re-renders after the filter is applied.
     */
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);

    cy.getTableById('documents-search-results')
      .findAllByTestId('type')
      .then((rowFiletypes) => {
        cy.wrap(rowFiletypes).contains(FILE_TYPE);
      });
  });

  it('should filter files by Author', () => {
    const AUTHOR = 'Roland Wagner';

    cy.tableSholudBeVisible('documents-search-results').selectColumn('Author');

    cy.log('click on Author filter');
    cy.findAllByTestId('multi-select-filter-Authors').click();

    cy.log('search and select file type');
    cy.findAllByTestId('multi-select-filter-Authors-search-input').type(AUTHOR);
    cy.get('input[type="checkbox"]').check();

    /**
     * We should wait until the table re-renders after the filter is applied.
     */
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);

    cy.getTableById('documents-search-results')
      .findAllByTestId('author')
      .then((rowAuthors) => {
        cy.wrap(rowAuthors).contains(AUTHOR);
      });
  });
});
