/* eslint-disable testing-library/await-async-utils */
import {
  ASSET_NAME,
  TIMESERIES_NAME,
  FILE_NAME,
  EVENT_ID,
} from '../support/constant';
import {
  ASSET_LIST_ALIAS,
  interceptAssetList,
  interceptTimeseriesList,
  TIMESERIES_LIST_ALIAS,
} from '../support/interceptions';

/* eslint-disable testing-library/prefer-screen-queries */
/* eslint-disable testing-library/await-async-query */

describe('global-search', () => {
  before(() => {
    cy.newLogin();
    cy.navigateToExplora();
  });
  it('Should be able to search assets by name', () => {
    interceptAssetList();
    cy.goToTab('Assets');
    cy.wait(`@${ASSET_LIST_ALIAS}`);
    cy.performSearch(ASSET_NAME);

    cy.get('[id="asset-tree-table"]').contains(ASSET_NAME).should('be.visible');
    cy.findAllByText('Exact match: Name').should('be.visible');
    cy.clearSearchInput();
  });

  it('Should be able to search time series by name', () => {
    interceptTimeseriesList();
    cy.goToTab('Time series');
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);
    cy.performSearch(TIMESERIES_NAME);

    cy.get('[id="timeseries-search-results"]')
      .contains(TIMESERIES_NAME)
      .should('be.visible');
    cy.clearSearchInput();
  });

  it('Should be able to search files by name', () => {
    cy.goToTab('Files');
    cy.performSearch(FILE_NAME);

    cy.get('[id="documents-search-results"]')
      .contains(FILE_NAME)
      .should('be.visible');
    cy.clearSearchInput();
  });

  it('Should be able to search events by id', () => {
    cy.goToTab('Events');

    cy.log('select id field');
    cy.get('[aria-label="Column Selection"]').click();
    cy.get('[id="id"]').click();
    cy.performSearch(EVENT_ID);

    cy.get('[id="event-search-results"]')
      .contains(EVENT_ID)
      .should('be.visible');
    cy.findAllByText('Exact match: ID').should('be.visible');
    cy.clearSearchInput();
  });
});
