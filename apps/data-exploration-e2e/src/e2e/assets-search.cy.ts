import {
  ASSET_DESCRIPTION,
  ASSET_EXTERNAL_ID,
  ASSET_ID,
  ASSET_METADATA,
  ASSET_NAME,
} from '../support/constant';
import {
  ASSET_LIST_ALIAS,
  interceptAssetList,
} from '../support/interceptions/interceptions';

describe('Assets - Search', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    cy.goToTab('Assets');
    cy.tableContentShouldBeVisible('asset-tree-table');

    cy.openSearchConfig();
    cy.enableSearchConfig('Assets', 'Name');
    cy.enableSearchConfig('Assets', 'Description');
    cy.enableSearchConfig('Assets', 'External ID');
    cy.enableSearchConfig('Assets', 'ID');
    cy.enableSearchConfig('Assets', 'Metadata');
    cy.saveSearchConfig();
  });

  beforeEach(() => {
    interceptAssetList();
  });

  afterEach(() => {
    cy.clearSearchInput();
  });

  it('should search by: Name', () => {
    cy.performSearch(ASSET_NAME);
    cy.wait(`@${ASSET_LIST_ALIAS}`);

    cy.getTableById('asset-tree-table').contains(ASSET_NAME).should('exist');

    cy.shouldExistExactMatchLabelBy('Name');
  });

  it('should search by: Description', () => {
    cy.performSearch(ASSET_DESCRIPTION);
    cy.wait(`@${ASSET_LIST_ALIAS}`);

    cy.getTableById('asset-tree-table')
      .selectColumn('Description')
      .contains(ASSET_DESCRIPTION)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('Description');
  });

  it('should search by: External ID', () => {
    cy.performSearch(ASSET_EXTERNAL_ID);
    cy.wait(`@${ASSET_LIST_ALIAS}`);

    cy.getTableById('asset-tree-table')
      .selectColumn('External ID')
      .contains(ASSET_EXTERNAL_ID)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('External ID');
  });

  it('should search by: ID', () => {
    cy.performSearch(ASSET_ID);
    cy.wait(`@${ASSET_LIST_ALIAS}`);

    cy.shouldExistExactMatchLabelBy('ID');
  });

  it('should search by: Metadata|description', () => {
    cy.performSearch(ASSET_METADATA);
    cy.wait(`@${ASSET_LIST_ALIAS}`);

    cy.getTableById('asset-tree-table')
      .selectColumn('description')
      .contains(ASSET_METADATA)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('Metadata "Description"');
  });
});
