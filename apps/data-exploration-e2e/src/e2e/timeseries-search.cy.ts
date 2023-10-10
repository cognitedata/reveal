import {
  TIMESERIES_NAME,
  TIMESERIES_DESCRIPTION,
  TIMESERIES_EXTERNAL_ID,
  TIMESERIES_ID,
  TIMESERIES_METADATA,
} from '../support/constant';
import {
  TIMESERIES_LIST_ALIAS,
  interceptTimeseriesList,
} from '../support/interceptions/interceptions';

describe('Timeseries - Search', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    cy.goToTab('Time series');
    cy.tableContentShouldBeVisible('timeseries-search-results');

    cy.openSearchConfig();
    cy.enableSearchConfig('Time series', 'Name');
    cy.enableSearchConfig('Time series', 'Description');
    cy.enableSearchConfig('Time series', 'External ID');
    cy.enableSearchConfig('Time series', 'ID');
    cy.enableSearchConfig('Time series', 'Metadata');
    cy.saveSearchConfig();
  });

  beforeEach(() => {
    interceptTimeseriesList();
  });

  afterEach(() => {
    cy.clearSearchInput();
  });

  it('should search by: Name', () => {
    cy.performSearch(TIMESERIES_NAME);
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);

    cy.getTableById('timeseries-search-results')
      .contains(TIMESERIES_NAME)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('Name');
  });

  it('Should search by: Description', () => {
    cy.performSearch(TIMESERIES_DESCRIPTION);
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);

    cy.getTableById('timeseries-search-results')
      .selectColumn('Description')
      .contains(TIMESERIES_DESCRIPTION)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('Description');
  });

  it('Should search by: External ID', () => {
    cy.performSearch(TIMESERIES_EXTERNAL_ID);
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);

    cy.getTableById('timeseries-search-results')
      .selectColumn('External ID')
      .contains(TIMESERIES_EXTERNAL_ID)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('External ID');
  });

  it('Should search by: ID', () => {
    cy.performSearch(TIMESERIES_ID);
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);

    cy.getTableById('timeseries-search-results')
      .selectColumn('ID')
      .contains(TIMESERIES_ID)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('ID');
  });

  it('should search by: Metadata|ValueType', () => {
    cy.performSearch(TIMESERIES_METADATA);
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);

    cy.getTableById('timeseries-search-results')
      .selectColumn('ValueType')
      .contains(TIMESERIES_METADATA)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('Metadata "ValueType"');
  });
});
