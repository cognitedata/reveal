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

  it('should filter timeseries by metadata', () => {
    const METADATA_PROPERTY = 'product_type';
    const METADATA_VALUE = 'oil';

    cy.clickSelectFilter('Metadata')
      .searchOption(METADATA_PROPERTY)
      .hoverSelectOption(METADATA_PROPERTY)
      .getSelectMenu({ subMenu: true })
      .should('be.visible');

    cy.getSelectFilter('Metadata').searchAndClickSelectOption(METADATA_VALUE, {
      subMenu: true,
    });

    cy.getSelectFilter('Metadata').getSelectMenu().clickButton('Apply');

    cy.wait(`@${TIMESERIES_LIST_ALIAS}`).payloadShouldContain({
      equals: {
        property: ['metadata', METADATA_PROPERTY],
        value: METADATA_VALUE,
      },
    });
  });
});
