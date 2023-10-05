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

    cy.tableContentShouldBeVisible('timeseries-search-results');
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter timeseries by unit', () => {
    const UNIT = 'm3';

    interceptTimeseriesList('timeseriesFilterByUnit');

    cy.clickSelectFilter('Units').searchAndClickSelectOption(UNIT);

    cy.wait('@timeseriesFilterByUnit').payloadShouldContain({
      in: {
        property: ['unit'],
        values: [UNIT],
      },
    });
  });

  it('should filter timeseries by Is step', () => {
    interceptTimeseriesList('timeseriesFilterByIsStep');

    cy.log('click on True button of Is step filter');
    cy.getFilter('Is step').clickBooleanOption('True');

    cy.wait(`@timeseriesFilterByIsStep`).payloadShouldContain({
      equals: {
        property: ['isStep'],
        value: 'true',
      },
    });
  });

  it('should filter timeseries by Is string', () => {
    interceptTimeseriesList('timeseriesFilterByIsString');

    cy.log('click on False button of Is string filter');
    cy.getFilter('Is string').clickBooleanOption('False');

    cy.wait(`@timeseriesFilterByIsString`).payloadShouldContain({
      equals: {
        property: ['isString'],
        value: 'false',
      },
    });
  });
});
