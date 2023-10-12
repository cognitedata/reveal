import {
  ASSET_NAME,
  TIMESERIES_NAME,
  FILE_NAME,
  EVENT_ID,
  SEQUENCE_NAME,
  NO_RESULTS_TEXT,
  FUZZY_SEARCH_PHRASE,
} from '../support/constant';
import {
  ASSET_LIST_ALIAS,
  interceptAssetList,
  interceptTimeseriesList,
  TIMESERIES_LIST_ALIAS,
} from '../support/interceptions/interceptions';

describe('Search function - Exact match', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();
  });

  it('Disable fuzzy search & enable "Name" parameter', () => {
    cy.clickButton('Config');
    cy.fuzzySearchDisable();
    cy.includeSearchParameter('common-column-checkbox-Name');
    cy.clickButton('Save');
  });

  it('Should be able to search assets by name', () => {
    interceptAssetList();
    cy.goToTab('Assets');
    cy.wait(`@${ASSET_LIST_ALIAS}`);
    cy.performSearch(ASSET_NAME);

    cy.getTableById('asset-tree-table')
      .contains(ASSET_NAME)
      .should('be.visible');
    cy.findAllByText('Exact match: Name').should('be.visible');
    cy.clearSearchInput();
  });

  it('Should be able to search time series by name', () => {
    interceptTimeseriesList();
    cy.goToTab('Time series');
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);
    cy.performSearch(TIMESERIES_NAME);

    cy.getTableById('timeseries-search-results')
      .contains(TIMESERIES_NAME)
      .should('be.visible');
  });

  it('Should be able to search files by name', () => {
    cy.goToTab('Files');
    cy.performSearch(FILE_NAME);

    cy.getTableById('documents-search-results')
      .contains(FILE_NAME)
      .should('be.visible');
  });

  it('Should be able to search events by id', () => {
    cy.goToTab('Events');
    cy.performSearch(EVENT_ID);

    cy.getTableById('event-search-results')
      .selectColumn('ID')
      .contains(EVENT_ID)
      .should('be.visible');
    cy.findAllByText('Exact match: ID').should('be.visible');
  });

  it('Should be able to search sequence by name', () => {
    cy.goToTab('Sequence');
    cy.performSearch(SEQUENCE_NAME);

    cy.getTableById('sequence-search-results')
      .contains(SEQUENCE_NAME)
      .should('be.visible');
  });
});

describe('Search Parameters', () => {
  beforeEach(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();
  });

  it('exclude asset name parameter and check results', () => {
    cy.clickButton('Config');

    cy.log('uncheck asset name parameter');
    cy.excludeSearchParameter('modal-checkbox-asset-name');

    cy.log('save changes');
    cy.clickButton('Save');

    interceptAssetList();
    cy.goToTab('Assets');
    cy.wait(`@${ASSET_LIST_ALIAS}`);
    cy.performSearch(ASSET_NAME);

    cy.log('no result text should display');
    cy.findAllByText(NO_RESULTS_TEXT).should('be.visible');
  });

  it(`uncheck common parameter "Name" and check results`, () => {
    cy.clickButton('Config');

    cy.log('uncheck "Name" parameter from common field');
    cy.excludeSearchParameter('common-column-checkbox-Name');

    cy.log('save changes');
    cy.clickButton('Save');

    cy.log('perform asset search by name');
    cy.goToTab('Assets');
    cy.performSearch(ASSET_NAME);

    cy.log('no result text should display');
    cy.findAllByText(NO_RESULTS_TEXT).should('be.visible');

    cy.log('perform files search by name');
    cy.goToTab('Sequence');
    cy.performSearch(SEQUENCE_NAME);

    cy.log('no result text should display');
    cy.findAllByText(NO_RESULTS_TEXT).should('be.visible');
  });

  it('Fuzzy search should work', () => {
    cy.log('enable fuzzy search & relevent search parameters');
    cy.clickButton('Config');
    cy.includeSearchParameter('common-column-checkbox-Name');
    cy.fuzzySearchEnable();
    cy.clickButton('Save');

    cy.log('perform fuzzy search for asset tab');
    cy.goToTab('Assets');
    cy.performSearch(FUZZY_SEARCH_PHRASE);

    cy.log('fuzzy search result should appear');
    cy.getTableById('asset-tree-table')
      .contains('Fuzzy match: Name or Description')
      .should('be.visible');
  });
});
