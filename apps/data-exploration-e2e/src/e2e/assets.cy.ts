import { ASSET_NAME } from '../support/constant';
import {
  ASSET_LIST_ALIAS,
  interceptAssetList,
} from '../support/interceptions/interceptions';

describe('Assets', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();
  });

  beforeEach(() => {
    interceptAssetList();
  });

  it('should click the assets tab and go to list view ', () => {
    cy.goToTab('Assets');
    cy.wait(`@${ASSET_LIST_ALIAS}`);
    cy.clickIconButton('List');
    cy.tableContentShouldBeVisible('asset-search-results');
  });

  it('should sort asset results', () => {
    cy.log('sorting colomn: Name');

    cy.getTableById('asset-search-results').clickSortColoumn('Name');
    cy.wait(`@${ASSET_LIST_ALIAS}`).shouldSortAscending('name');

    cy.getTableById('asset-search-results').clickSortColoumn('Name');
    cy.wait(`@${ASSET_LIST_ALIAS}`).shouldSortDescending('name');

    cy.log('should select Description from the colomn selection');
    cy.tableShouldBeVisible('asset-search-results').selectColumn(`Description`);

    cy.log('sorting colomn: Description');
    cy.getTableById('asset-search-results').clickSortColoumn('Description');
    cy.wait(`@${ASSET_LIST_ALIAS}`).shouldSortAscending('description');

    cy.getTableById('asset-search-results').clickSortColoumn('Description');
    cy.wait(`@${ASSET_LIST_ALIAS}`).shouldSortDescending('description');

    // Reset sorting
    cy.getTableById('asset-search-results').clickSortColoumn('Description');
  });

  it('should navigate to the detail view', () => {
    cy.clickIconButton('Asset hierarchy');
    cy.performSearch(ASSET_NAME);

    cy.getTableById('asset-tree-table')
      .contains(ASSET_NAME)
      .should('be.visible')
      .click();
  });

  it('should navigate between the detail view tabs', () => {
    cy.log('should contain All resources tab details');
    cy.findByTestId('asset-detail').goToTab('All resources');
    cy.findByTestId('asset-summary').should('be.visible');
    cy.findByTestId('timeseries-summary').should('be.visible');
    cy.findByTestId('document-summary').should('be.visible');
    cy.findByTestId('event-summary').should('be.visible');
    cy.findByTestId('sequence-summary').scrollIntoView().should('be.visible');

    // Scrolling back to top
    cy.findAllByTestId('asset-detail').scrollIntoView();

    cy.log('should navigate to Hierarchy tab');
    cy.findByTestId('asset-detail').goToTab('Hierarchy');
    cy.tableShouldBeVisible('asset-details-tree-table');

    cy.log('should navigate to Assets tab');
    cy.findByTestId('asset-detail').goToTab('Assets');
    cy.tableShouldBeVisible('asset-linked-search-results');

    cy.log('should navigate to Time series tab');
    cy.findByTestId('asset-detail').goToTab('Time series');
    cy.tableShouldBeVisible('timeseries-linked-search-results');

    cy.log('should navigate to Files tab');
    cy.findByTestId('asset-detail').goToTab('Files');
    cy.findAllByTestId('file-grouping-table').should('be.visible');

    cy.log('should navigate to Events tab');
    cy.findByTestId('asset-detail').goToTab('Events');
    cy.tableShouldBeVisible('event-linked-search-results');

    cy.log('should navigate to Sequence tab');
    cy.findByTestId('asset-detail').goToTab('Sequence');
    cy.tableShouldBeVisible('sequence-linked-search-results');
  });

  it('Should close the detail view and clear search input', () => {
    cy.log('close asset detail view');
    cy.findByTestId('asset-detail').clickIconButton('Close');
    cy.findByTestId('asset-detail').should('not.exist');

    cy.clearSearchInput();
  });
});
