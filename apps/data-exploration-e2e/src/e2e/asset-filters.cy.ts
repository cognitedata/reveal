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
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter assets by source', () => {
    const SOURCE = 'carina';

    cy.tableSholudBeVisible('asset-search-results').selectColumn('Source');

    cy.log('click on source filter');
    cy.findAllByTestId('multi-select-filter-Sources').click();

    cy.log('search and select source');
    cy.findAllByTestId('multi-select-filter-Sources-search-input').type(SOURCE);
    cy.get('input[type="checkbox"]').check();

    /**
     * We should wait until the table re-renders after the filter is applied.
     */
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);

    cy.getTableById('asset-search-results').within((table) => {
      cy.wrap(table)
        .getColomnValues('source')
        .then((sources) => {
          sources.forEach((source) => {
            expect(source).to.be.eq(SOURCE);
          });
        });
    });
  });

  it('should filter assets by label', () => {
    const LABEL = 'OIL (BEST_DAY_WELL_FLAG_OIL)';

    cy.tableSholudBeVisible('asset-search-results').selectColumn('Labels');

    cy.log('click on labels filter');
    cy.findAllByTestId('multi-select-filter-Labels').click();

    cy.log('search and select source');
    cy.findAllByTestId('multi-select-filter-Labels-search-input').type(LABEL);
    cy.get('input[type="checkbox"]').check();

    /**
     * We should wait until the table re-renders after the filter is applied.
     */
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);

    cy.getTableById('asset-search-results')
      .findAllByTestId('labels')
      .then((rowLabels) => {
        cy.wrap(rowLabels).contains(LABEL);
      });
  });
});
