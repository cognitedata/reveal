import {
  ASSET_LIST_ALIAS,
  interceptAssetList,
} from '../support/interceptions/interceptions';

describe('Assets - Filters', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    cy.goToTab('Assets');
    cy.tableContentShouldBeVisible('asset-tree-table');
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

  it('should filter assets by metadata', () => {
    const METADATA_PROPERTY = 'description';
    const METADATA_VALUE = 'inst';

    cy.clickSelectFilter('Metadata')
      .searchOption(METADATA_PROPERTY)
      .hoverSelectOption(METADATA_PROPERTY)
      .getSelectMenu({ subMenu: true })
      .should('be.visible');

    cy.getSelectFilter('Metadata').searchAndClickSelectOption(METADATA_VALUE, {
      subMenu: true,
    });

    cy.getSelectFilter('Metadata').getSelectMenu().clickButton('Apply');

    cy.wait(`@${ASSET_LIST_ALIAS}`).payloadShouldContain({
      equals: {
        property: ['metadata', METADATA_PROPERTY],
        value: METADATA_VALUE,
      },
    });
  });
});
