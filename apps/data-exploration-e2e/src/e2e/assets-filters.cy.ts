import {
  ASSET_LIST_ALIAS,
  interceptAssetList,
} from '../support/interceptions/interceptions';

describe('Assets - Filters', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    cy.goToTab('Assets');
    cy.clickIconButton('List');
    cy.tableContentShouldBeVisible('asset-search-results');
  });

  beforeEach(() => {
    interceptAssetList();
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter assets by label', () => {
    const LABEL = 'BEST_DAY_WELL_FLAG_OIL';

    cy.clickSelectFilter('Labels').searchAndClickSelectOption(LABEL);

    cy.wait(`@${ASSET_LIST_ALIAS}`).payloadShouldContain({
      containsAny: {
        property: ['labels'],
        values: [LABEL],
      },
    });
  });

  it('should filter assets by source', () => {
    const SOURCE = 'carina';

    cy.clickSelectFilter('Sources').searchAndClickSelectOption(SOURCE);

    cy.wait(`@${ASSET_LIST_ALIAS}`).payloadShouldContain({
      in: {
        property: ['source'],
        values: [SOURCE],
      },
    });
  });
});
