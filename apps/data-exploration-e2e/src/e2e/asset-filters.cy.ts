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
    cy.tableContentShouldBeVisible('asset-search-results');
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter assets by source', () => {
    const SOURCE = 'carina';

    interceptAssetList('assetsFilterBySource');

    cy.clickSelectFilter('Sources').searchAndClickSelectOption(SOURCE);

    cy.wait('@assetFilterBySource').payloadShouldContain({
      in: {
        property: ['source'],
        values: [SOURCE],
      },
    });
  });

  it('should filter assets by label', () => {
    const LABEL = 'BEST_DAY_WELL_FLAG_OIL';

    interceptAssetList('assetsFilterByLabel');

    cy.clickSelectFilter('Labels').searchAndClickSelectOption(LABEL);

    cy.wait('@assetFilterByLabel').payloadShouldContain({
      containsAny: {
        property: ['labels'],
        values: [LABEL],
      },
    });
  });
});
