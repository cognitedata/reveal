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
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter timeseries by unit', () => {
    const UNIT = 'M3';

    cy.tableSholudBeVisible('timeseries-search-results').selectColumn(`Unit`);

    cy.log('click on unit filter');
    cy.findAllByTestId('multi-select-filter-Units').click();

    cy.log('search and select unit');
    cy.findAllByTestId('multi-select-filter-Units-search-input').type(UNIT);
    cy.get('input[type="checkbox"]').check();

    /**
     * We should wait until the table re-renders after the filter is applied.
     */
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.getTableById('timeseries-search-results').within((table) => {
      cy.wrap(table)
        .getColomnValues('unit')
        .then((units) => {
          units.forEach((unit) => {
            expect(unit).to.be.eq(UNIT);
          });
        });
    });
  });

  it('should filter timeseries by Is step', () => {
    const IS_STEP = 'True';

    cy.tableSholudBeVisible('timeseries-search-results').selectColumn(
      `Is step`
    );

    cy.log('click on True button of Is step filter');
    cy.findAllByTestId('boolean-input-Is step').contains(IS_STEP).click();

    /**
     * We should wait until the table re-renders after the filter is applied.
     */
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);

    cy.getTableById('timeseries-search-results').within((table) => {
      cy.wrap(table)
        .getColomnValues('isStep')
        .then((values) => {
          values.forEach((value) => {
            expect(value).to.be.eq(IS_STEP);
          });
        });
    });
  });

  it('should filter timeseries by Is string', () => {
    const IS_STRING = 'False';

    cy.tableSholudBeVisible('timeseries-search-results').selectColumn(
      `Is string`
    );

    cy.log('click on False button of Is string filter');
    cy.findAllByTestId('boolean-input-Is string').contains(IS_STRING).click();

    /**
     * We should wait until the table re-renders after the filter is applied.
     */
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);

    cy.getTableById('timeseries-search-results').within((table) => {
      cy.wrap(table)
        .getColomnValues('isString')
        .then((values) => {
          values.forEach((value) => {
            expect(value).to.be.eq(IS_STRING);
          });
        });
    });
  });
});
