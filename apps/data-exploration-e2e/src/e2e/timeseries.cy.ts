import { TIMESERIES_ID, TIMESERIES_NAME } from '../support/constant';
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

      // Scroll back to top
      cy.findByTestId('timeseries-chart').scrollIntoView();
    });
  });

  it('should open in industrial canvas', () => {
    cy.clickIconButton('Open in Industrial Canvas');

    cy.url().should('include', 'industrial-canvas');
    cy.url().should('include', `timeSeries-${TIMESERIES_ID}`);

    cy.goBack();
    cy.findByTestId('timeseries-details')
      .findByTestId('timeseries-chart')
      .should('be.visible');
  });

  it('should open in charts', () => {
    cy.getButton('Open in Charts')
      .then((button) => {
        cy.wrap(button)
          .closest('a')
          .then((link) => {
            expect(link).to.have.attr('target', '_blank');

            // Update target to open in the same tab
            link.attr('target', '_self');
          });
      })
      .click();

    cy.url().should('include', 'charts');
    cy.url().should('include', `timeserieIds=${TIMESERIES_ID}`);

    cy.goBack();
    cy.findByTestId('timeseries-details')
      .findByTestId('timeseries-chart')
      .should('be.visible');
  });

  it('Should close the detail view and clear search input', () => {
    cy.log('close timeseries detail view');
    cy.findByTestId('timeseries-detail').clickIconButton('Close');
    cy.findByTestId('timeseries-detail').should('not.exist');

    cy.clearSearchInput();
  });
});
