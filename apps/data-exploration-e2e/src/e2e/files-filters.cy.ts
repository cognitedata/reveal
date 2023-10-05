import {
  FILE_LIST_ALIAS,
  interceptFileList,
} from '../support/interceptions/interceptions';

describe('Files - Filters', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    cy.goToTab('Files');
    cy.tableContentShouldBeVisible('documents-search-results');
  });

  beforeEach(() => {
    interceptFileList();
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter files by file type', () => {
    const FILE_TYPE = 'Image';

    cy.clickSelectFilter('File types').searchAndClickSelectOption(FILE_TYPE);

    cy.wait(`@${FILE_LIST_ALIAS}`).payloadShouldContain({
      in: {
        property: ['type'],
        values: [FILE_TYPE],
      },
    });
  });

  it('should filter files by Author', () => {
    const AUTHOR = 'Roland Wagner';

    cy.clickSelectFilter('Authors').searchAndClickSelectOption(AUTHOR);

    cy.wait(`@${FILE_LIST_ALIAS}`).payloadShouldContain({
      in: {
        property: ['author'],
        values: [AUTHOR],
      },
    });
  });
});
