import {
  FILE_NAME,
  FILE_CONTENT,
  FILE_EXTERNAL_ID,
  FILE_ID,
  FILE_METADATA,
} from '../support/constant';
import {
  FILE_LIST_ALIAS,
  interceptFileList,
} from '../support/interceptions/interceptions';

describe('Search - files', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    cy.goToTab('Files');
    cy.tableContentShouldBeVisible('documents-search-results');

    cy.openSearchConfig();
    cy.enableSearchConfig('Files', 'Name');
    cy.enableSearchConfig('Files', 'Content');
    cy.enableSearchConfig('Files', 'External ID');
    cy.enableSearchConfig('Files', 'ID');
    cy.enableSearchConfig('Files', 'Metadata');
    cy.saveSearchConfig();
  });

  beforeEach(() => {
    interceptFileList();
  });

  afterEach(() => {
    cy.clearSearchInput();
  });

  it('should search by: Name', () => {
    cy.performSearch(FILE_NAME);
    cy.wait(`@${FILE_LIST_ALIAS}`);

    cy.getTableById('documents-search-results')
      .contains(FILE_NAME)
      .should('be.visible');

    cy.shouldExistExactMatchLabelBy('Name');
  });

  it('should search by: Content', () => {
    cy.performSearch(FILE_CONTENT);
    cy.wait(`@${FILE_LIST_ALIAS}`);

    cy.getTableById('documents-search-results')
      .selectColumn('Content')
      .contains(FILE_CONTENT)
      .should('be.visible');

    cy.shouldExistExactMatchLabelBy('Content');
  });

  it('should search by: External ID', () => {
    cy.performSearch(FILE_EXTERNAL_ID);
    cy.wait(`@${FILE_LIST_ALIAS}`);

    cy.getTableById('documents-search-results')
      .selectColumn('External ID')
      .contains(FILE_CONTENT)
      .should('be.visible');

    cy.shouldExistExactMatchLabelBy('External ID');
  });

  it('should search by: ID', () => {
    cy.performSearch(FILE_ID);
    cy.wait(`@${FILE_LIST_ALIAS}`);

    cy.getTableById('documents-search-results')
      .selectColumn('ID')
      .contains(FILE_CONTENT)
      .should('be.visible');

    cy.shouldExistExactMatchLabelBy('ID');
  });

  it('should search by: Metadata|description', () => {
    cy.performSearch(FILE_METADATA);
    cy.wait(`@${FILE_LIST_ALIAS}`);

    cy.getTableById('documents-search-results')
      .selectColumn('description')
      .contains(FILE_CONTENT)
      .should('be.visible');

    cy.shouldExistExactMatchLabelBy('Metadata "description"');
  });
});
