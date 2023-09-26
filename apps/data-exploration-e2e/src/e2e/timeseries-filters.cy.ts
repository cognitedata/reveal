import {
  TIMESERIES_AGGREGATE_ALIAS,
  TIMESERIES_LIST_ALIAS,
  interceptTimeseriesAggregate,
  interceptTimeseriesList,
} from '../support/interceptions/interceptions';

describe('Timeseries filters', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    interceptTimeseriesList();
    interceptTimeseriesAggregate();

    cy.goToTab('Time series');
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);
    cy.wait(`@${TIMESERIES_AGGREGATE_ALIAS}`);

    cy.tableShouldBeVisible('timeseries-search-results');
  });

  beforeEach(() => {
    interceptTimeseriesList();
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter timeseries by unit', () => {
    const UNIT = 'M3';

    cy.clickFilter('Units').searchAndClickOption(UNIT);

    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);

    cy.getTableById('timeseries-search-results').within((table) => {
      cy.wrap(table)
        .selectColumn('Unit')
        .shouldAllRowsHaveValueInColumn('Unit', UNIT);
    });
  });

  it('should filter timeseries by Is step', () => {
    const IS_STEP = 'True';

    cy.log('click on True button of Is step filter');
    cy.getFilter('Is step').contains(IS_STEP).click();

    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);

    cy.getTableById('timeseries-search-results').within((table) => {
      cy.wrap(table)
        .selectColumn('Is step')
        .shouldAllRowsHaveValueInColumn('Is step', IS_STEP);
    });
  });

  it('should filter timeseries by Is string', () => {
    const IS_STRING = 'False';

    cy.log('click on False button of Is string filter');
    cy.getFilter('Is string').contains(IS_STRING).click();

    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);

    cy.getTableById('timeseries-search-results').within((table) => {
      cy.wrap(table)
        .selectColumn('Is string')
        .shouldAllRowsHaveValueInColumn('Is string', IS_STRING);
    });
  });
});
