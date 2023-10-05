import {
  TIMESERIES_LIST_ALIAS,
  interceptTimeseriesList,
} from '../support/interceptions/interceptions';

describe('Timeseries - Filters', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    cy.goToTab('Time series');
    cy.tableContentShouldBeVisible('timeseries-search-results');
  });

  beforeEach(() => {
    interceptTimeseriesList();
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter timeseries by unit', () => {
    const UNIT = 'm3';

    cy.clickSelectFilter('Units').searchAndClickSelectOption(UNIT);

    cy.wait(`@${TIMESERIES_LIST_ALIAS}`).payloadShouldContain({
      in: {
        property: ['unit'],
        values: [UNIT],
      },
    });
  });

  it('should filter timeseries by Is step', () => {
    cy.log('click on True button of Is step filter');
    cy.getFilter('Is step').clickBooleanOption('True');

    cy.wait(`@${TIMESERIES_LIST_ALIAS}`).payloadShouldContain({
      equals: {
        property: ['isStep'],
        value: true,
      },
    });
  });

  it('should filter timeseries by Is string', () => {
    cy.log('click on False button of Is string filter');
    cy.getFilter('Is string').clickBooleanOption('False');

    cy.wait(`@${TIMESERIES_LIST_ALIAS}`).payloadShouldContain({
      equals: {
        property: ['isString'],
        value: false,
      },
    });
  });
});
