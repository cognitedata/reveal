import { TIMESERIES_NAME } from '../support/constant';
import {
  TIMESERIES_LIST_ALIAS,
  interceptTimeseriesList,
} from '../support/interceptions/interceptions';

describe('Timeseries', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();
  });

  beforeEach(() => {
    interceptTimeseriesList();
  });

  it('should navigate to timeseries tab', () => {
    cy.goToTab('Time series');
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);
    cy.tableContentShouldBeVisible('timeseries-search-results');
  });

  it('should sort timeseries results', () => {
    cy.log('sorting colomn: Name');
    interceptTimeseriesList('sortAscendingByName');
    cy.getTableById('timeseries-search-results').clickSortColoumn('Name');
    cy.wait(`@sortAscendingByName`).shouldSortAscending('name');

    interceptTimeseriesList('sortDescendingByName');
    cy.getTableById('timeseries-search-results').clickSortColoumn('Name');
    cy.wait(`@sortDescendingByName`).shouldSortDescending('name');

    cy.log('sorting colomn: Description');
    interceptTimeseriesList('sortAscendingByDescription');
    cy.getTableById('timeseries-search-results').clickSortColoumn(
      'Description'
    );
    cy.wait(`@sortAscendingByDescription`).shouldSortAscending('description');

    interceptTimeseriesList('sortDescendingByDescription');
    cy.getTableById('timeseries-search-results').clickSortColoumn(
      'Description'
    );
    cy.wait(`@sortDescendingByDescription`).shouldSortDescending('description');
  });

  it('Should be able to search time series by name and navigate to detail view', () => {
    cy.performSearch(TIMESERIES_NAME);

    cy.getTableById('timeseries-search-results')
      .contains(TIMESERIES_NAME)
      .should('be.visible')
      .click();
  });

  it('should display timeseries details', () => {
    cy.findByTestId('timeseries-details').within(() => {
      cy.findByTestId('timeseries-chart').should('be.visible');
      cy.findByTestId('general-details-card').should('be.visible');
      cy.findByTestId('metadata-card').scrollIntoView().should('be.visible');
    });
  });
});
