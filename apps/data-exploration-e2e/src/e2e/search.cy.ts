/* eslint-disable testing-library/await-async-utils */
import { ASSET_NAME, TIMESERIES_NAME } from '../support/constant';
import {
  ASSET_LIST_ALIAS,
  interceptAssetList,
  interceptTimeseriesList,
  TIMESERIES_LIST_ALIAS,
} from '../support/interceptions';

/* eslint-disable testing-library/prefer-screen-queries */
/* eslint-disable testing-library/await-async-query */

describe('global-search', () => {
  beforeEach(() => {
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
  });

  it('Should be able to search time series by name', () => {
    interceptTimeseriesList();
    cy.goToTab('Time series');
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);
    cy.performSearch(TIMESERIES_NAME);

    cy.get('[id="asset-tree-table"]')
      .contains(TIMESERIES_NAME)
      .should('be.visible');
    cy.findAllByText('Exact match: Name').should('be.visible');
  });
});
