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

  it('should filter files by author', () => {
    const AUTHOR = 'Roland Wagner';

    cy.clickSelectFilter('Authors').searchAndClickSelectOption(AUTHOR);

    cy.wait(`@${FILE_LIST_ALIAS}`).payloadShouldContain({
      in: {
        property: ['author'],
        values: [AUTHOR],
      },
    });
  });

  it('should filter files by source', () => {
    const SOURCE = 'cognite data fusion';

    cy.clickSelectFilter('Sources').searchAndClickSelectOption(SOURCE);

    cy.wait(`@${FILE_LIST_ALIAS}`).payloadShouldContain({
      in: {
        property: ['sourceFile', 'source'],
        values: [SOURCE],
      },
    });
  });

  it('should filter files by label', () => {
    const LABEL = 'DISCOVER_PRESSURE_BOOK';

    cy.clickSelectFilter('Labels').searchAndClickSelectOption(LABEL);

    cy.wait(`@${FILE_LIST_ALIAS}`).payloadShouldContain({
      containsAny: {
        property: ['labels'],
        values: [{ externalId: LABEL }],
      },
    });
  });

  it('should filter files by metadata', () => {
    const METADATA_PROPERTY = 'type';
    const METADATA_VALUE = 'pid';

    cy.clickSelectFilter('Metadata')
      .searchOption(METADATA_PROPERTY)
      .hoverSelectOption(METADATA_PROPERTY)
      .getSelectMenu({ subMenu: true })
      .should('be.visible');

    cy.getSelectFilter('Metadata').searchAndClickSelectOption(METADATA_VALUE, {
      subMenu: true,
    });

    cy.getSelectFilter('Metadata').getSelectMenu().clickButton('Apply');

    cy.wait(`@${FILE_LIST_ALIAS}`).payloadShouldContain({
      equals: {
        property: ['sourceFile', 'metadata', METADATA_PROPERTY],
        value: METADATA_VALUE,
      },
    });
  });
});
