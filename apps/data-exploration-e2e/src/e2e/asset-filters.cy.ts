import {
  ASSET_AGGREGATE_ALIAS,
  ASSET_LIST_ALIAS,
  interceptAssetAggregate,
  interceptAssetList,
} from '../support/interceptions/interceptions';

describe('Asset filters', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    interceptAssetList();
    interceptAssetAggregate();

    cy.goToTab('Assets');
    cy.wait(`@${ASSET_LIST_ALIAS}`);
    cy.wait(`@${ASSET_AGGREGATE_ALIAS}`);

    cy.clickIconButton('List');
    cy.tableShouldBeVisible('asset-search-results');
  });

  beforeEach(() => {
    interceptAssetList();
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter assets by source', () => {
    const SOURCE = 'carina';

    cy.clickFilter('Sources').searchAndClickOption(SOURCE);

    cy.wait(`@${ASSET_LIST_ALIAS}`);

    cy.getTableById('asset-search-results').within((table) => {
      cy.wrap(table)
        .selectColumn('Source')
        .shouldAllRowsHaveValueInColumn('Source', SOURCE);
    });
  });

  it('should filter assets by label', () => {
    const LABEL = 'BEST_DAY_WELL_FLAG_OIL';

    cy.clickFilter('Labels').searchAndClickOption(LABEL);

    cy.wait(`@${ASSET_LIST_ALIAS}`);

    cy.getTableById('asset-search-results').within((table) => {
      cy.wrap(table)
        .selectColumn('Labels')
        .shouldAllRowsHaveValueInColumn('Labels', LABEL);
    });
  });
});
