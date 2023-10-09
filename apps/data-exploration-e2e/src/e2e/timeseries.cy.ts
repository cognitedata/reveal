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

    cy.getTableById('timeseries-search-results').clickSortColoumn('Name');
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`).shouldSortAscending('name');

    cy.getTableById('timeseries-search-results').clickSortColoumn('Name');
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`).shouldSortDescending('name');

    cy.log('sorting colomn: Description');
    cy.getTableById('timeseries-search-results').clickSortColoumn(
      'Description'
    );
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`).shouldSortAscending('description');

    cy.getTableById('timeseries-search-results').clickSortColoumn(
      'Description'
    );
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`).shouldSortDescending('description');

    // Reset sorting
    cy.getTableById('timeseries-search-results').clickSortColoumn(
      'Description'
    );
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
