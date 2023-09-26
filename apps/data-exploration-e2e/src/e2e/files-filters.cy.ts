import {
  FILE_AGGREGATE_ALIAS,
  FILE_LIST_ALIAS,
  interceptFileAggregate,
  interceptFileList,
} from '../support/interceptions/interceptions';

describe('Files filters', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    interceptFileList();
    interceptFileAggregate();

    cy.goToTab('Files');
    cy.wait(`@${FILE_LIST_ALIAS}`);
    cy.wait(`@${FILE_AGGREGATE_ALIAS}`);

    cy.tableShouldBeVisible('documents-search-results');
  });

  beforeEach(() => {
    interceptFileList();
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter files by file type', () => {
    const FILE_TYPE = 'Image';

    cy.clickFilter('File types').searchAndClickOption(FILE_TYPE);

    cy.wait(`@${FILE_LIST_ALIAS}`);

    cy.getTableById('documents-search-results').within((table) => {
      cy.wrap(table)
        .selectColumn('File type')
        .shouldAllRowsHaveValueInColumn('File type', FILE_TYPE);
    });
  });

  it('should filter files by Author', () => {
    const AUTHOR = 'Roland Wagner';

    cy.clickFilter('Authors').searchAndClickOption(AUTHOR);

    cy.wait(`@${FILE_LIST_ALIAS}`);

    cy.getTableById('documents-search-results').within((table) => {
      cy.wrap(table)
        .selectColumn('Author')
        .shouldAllRowsHaveValueInColumn('Author', AUTHOR);
    });
  });
});
