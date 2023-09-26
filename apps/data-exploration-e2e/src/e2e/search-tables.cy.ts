import {
  interceptTimeseriesList,
  interceptAssetList,
  interceptFileList,
  interceptSequenceList,
  interceptEventList,
  ASSET_LIST_ALIAS,
  TIMESERIES_LIST_ALIAS,
  FILE_LIST_ALIAS,
  SEQUENCE_LIST_ALIAS,
  EVENT_LIST_ALIAS,
} from '../support/interceptions/interceptions';

describe('Search result tables', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();
  });

  beforeEach(() => {
    interceptTimeseriesList();
    interceptAssetList();
    interceptFileList();
    interceptSequenceList();
    interceptEventList();
  });

  it('Should be able navigate to AllResources tab', () => {
    cy.goToTab('All resources');
    cy.wait(`@${ASSET_LIST_ALIAS}`);
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);
    cy.wait(`@${FILE_LIST_ALIAS}`);
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`);
    cy.wait(`@${EVENT_LIST_ALIAS}`);

    cy.log('should contain All resources tab details');
    cy.findAllByTestId('asset-summary').should('be.visible');
    cy.findAllByTestId('timeseries-summary').should('be.visible');
    cy.findAllByTestId('event-summary').should('be.visible');
    cy.findAllByTestId('sequence-summary')
      .scrollIntoView()
      .should('be.visible');
  });

  it('Should be able navigate to Assets tab', () => {
    cy.goToTab('Assets');
    cy.wait(`@${ASSET_LIST_ALIAS}`);

    cy.log('should contain asset search results - tree view');
    cy.tableShouldBeVisible('asset-tree-table').shouldLoadMore(
      ASSET_LIST_ALIAS
    );

    cy.log('should contain asset search results - list view');
    cy.clickIconButton('List');
    cy.tableShouldBeVisible('asset-search-results').shouldLoadMore(
      ASSET_LIST_ALIAS
    );
  });

  it('Should be able navigate to Timeseries tab', () => {
    cy.goToTab('Time series');
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);

    cy.log('should contain timeseries search results');
    cy.tableShouldBeVisible('timeseries-search-results').shouldLoadMore(
      TIMESERIES_LIST_ALIAS
    );
  });

  it('Should be able navigate to Files tab', () => {
    cy.goToTab('Files');
    cy.wait(`@${FILE_LIST_ALIAS}`);

    cy.log('should contain files search results');
    cy.tableShouldBeVisible('documents-search-results').shouldLoadMore(
      FILE_LIST_ALIAS
    );
  });

  it('Should be able navigate to Events tab', () => {
    cy.goToTab('Events');
    cy.wait(`@${EVENT_LIST_ALIAS}`);

    cy.log('should contain events search results');
    cy.tableShouldBeVisible('event-search-results').shouldLoadMore(
      EVENT_LIST_ALIAS
    );
  });

  it('Should be able navigate to Sequence tab', () => {
    cy.goToTab('Sequence');
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`);

    cy.log('should contain sequence search results');
    cy.tableShouldBeVisible('sequence-search-results').shouldLoadMore(
      SEQUENCE_LIST_ALIAS
    );
  });
});
