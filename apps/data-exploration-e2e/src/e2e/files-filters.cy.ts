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

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter files by file type', () => {
    const FILE_TYPE = 'Image';

    interceptFileList('filesFilterByFiletType');

    cy.clickFilter('File types').searchAndClickOption(FILE_TYPE);

    cy.wait('@filesFilterByFiletType').payloadShouldContain({
      in: {
        property: ['type'],
        values: [FILE_TYPE],
      },
    });
  });

  it('should filter files by Author', () => {
    const AUTHOR = 'Roland Wagner';

    interceptFileList('filesFilterByAuthor');

    cy.clickFilter('Authors').searchAndClickOption(AUTHOR);

    cy.wait('@filesFilterByAuthor').payloadShouldContain({
      in: {
        property: ['author'],
        values: [AUTHOR],
      },
    });
  });
});
