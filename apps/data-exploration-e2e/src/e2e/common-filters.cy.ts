import {
  DATA_SET_NAME,
  ASSET_NAME,
  EXTERNAL_ID,
  INTERNAL_ID,
  DATA_SET_ID,
  ASSET_ID,
} from '../support/constant';
import {
  ASSET_LIST_ALIAS,
  EVENT_LIST_ALIAS,
  FILE_LIST_ALIAS,
  SEQUENCE_LIST_ALIAS,
  TIMESERIES_LIST_ALIAS,
  interceptAssetList,
  interceptEventList,
  interceptDocumentsSearch,
  interceptSequenceList,
  interceptTimeseriesList,
} from '../support/interceptions/interceptions';

describe('Common filters', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    cy.tableContentShouldBeVisible('asset-summary-table');
    cy.tableContentShouldBeVisible('timeseries-summary-table');
    cy.tableContentShouldBeVisible('document-summary-table');
    cy.tableContentShouldBeVisible('events-summary-table');

    cy.getTableById('sequence-summary-table').scrollIntoView();
    cy.tableContentShouldBeVisible('sequence-summary-table');
    // Scroll back to top
    cy.getTableById('asset-summary-table').scrollIntoView();
  });

  beforeEach(() => {
    interceptAssetList();
    interceptTimeseriesList();
    interceptDocumentsSearch();
    interceptEventList();
    interceptSequenceList();
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter by data set', () => {
    cy.clickSelectFilter('Data sets').searchAndClickSelectOption(DATA_SET_NAME);

    const filter = {
      in: {
        property: ['dataSetId'],
        values: [Number(DATA_SET_ID)],
      },
    };

    cy.wait(`@${ASSET_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${FILE_LIST_ALIAS}`).payloadShouldContain({
      in: {
        property: ['sourceFile', 'datasetId'],
        values: [Number(DATA_SET_ID)],
      },
    });
    cy.wait(`@${EVENT_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`).payloadShouldContain(filter);
  });

  it('should filter by asset', () => {
    cy.clickSelectFilter('Assets').searchAndClickSelectOption(ASSET_NAME);

    const filter = {
      assetSubtreeIds: [{ id: Number(ASSET_ID) }],
    };

    cy.wait(`@${ASSET_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${FILE_LIST_ALIAS}`).payloadShouldContain({
      inAssetSubtree: {
        property: ['sourceFile', 'assetIds'],
        values: [Number(ASSET_ID)],
      },
    });
    cy.wait(`@${EVENT_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`).payloadShouldContain(filter);
  });

  it('should filter by created time', () => {
    cy.clickSelectFilter('Created time').clickSelectOption('Before');

    cy.openDatePicker('Created time');
    cy.wait(`@${ASSET_LIST_ALIAS}`);
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);
    cy.wait(`@${FILE_LIST_ALIAS}`);
    cy.wait(`@${EVENT_LIST_ALIAS}`);
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`);

    cy.log('change date to 2023/01/01');
    cy.selectYear(2023);
    cy.selectMonth('January');
    cy.selectDate('January 1st');

    cy.getDatePickerValue().then((selectedDate) => {
      const filter = {
        range: {
          property: ['createdTime'],
          lte: new Date(selectedDate).valueOf(),
        },
      };

      cy.wait(`@${ASSET_LIST_ALIAS}`).payloadShouldContain(filter);
      cy.wait(`@${TIMESERIES_LIST_ALIAS}`).payloadShouldContain(filter);
      cy.wait(`@${FILE_LIST_ALIAS}`).payloadShouldContain(filter);
      cy.wait(`@${EVENT_LIST_ALIAS}`).payloadShouldContain(filter);
      cy.wait(`@${SEQUENCE_LIST_ALIAS}`).payloadShouldContain(filter);
    });
  });

  it('should filter by updated time', () => {
    cy.clickSelectFilter('Updated time').clickSelectOption('Before');

    cy.openDatePicker('Updated time');
    cy.wait(`@${ASSET_LIST_ALIAS}`);
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);
    cy.wait(`@${FILE_LIST_ALIAS}`);
    cy.wait(`@${EVENT_LIST_ALIAS}`);
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`);

    cy.log('change date to 2023/01/01');
    cy.selectYear(2023);
    cy.selectMonth('January');
    cy.selectDate('January 1st');

    cy.getDatePickerValue().then((selectedDate) => {
      const filter = {
        range: {
          property: ['lastUpdatedTime'],
          lte: new Date(selectedDate).valueOf(),
        },
      };

      cy.wait(`@${ASSET_LIST_ALIAS}`).payloadShouldContain(filter);
      cy.wait(`@${TIMESERIES_LIST_ALIAS}`).payloadShouldContain(filter);
      cy.wait(`@${FILE_LIST_ALIAS}`).payloadShouldContain({
        range: {
          property: ['modifiedTime'],
          lte: new Date(selectedDate).valueOf(),
        },
      });
      cy.wait(`@${EVENT_LIST_ALIAS}`).payloadShouldContain(filter);
      cy.wait(`@${SEQUENCE_LIST_ALIAS}`).payloadShouldContain(filter);
    });
  });

  it('should filter by external id', () => {
    cy.getFilter('External ID').typeString(EXTERNAL_ID);

    const filter = {
      prefix: {
        property: ['externalId'],
        value: EXTERNAL_ID,
      },
    };

    cy.wait(`@${ASSET_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${FILE_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${EVENT_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`).payloadShouldContain(filter);
  });

  it('should filter by internal id', () => {
    cy.getFilter('Internal ID').typeString(INTERNAL_ID);

    const filter = {
      equals: {
        property: ['id'],
        value: Number(INTERNAL_ID),
      },
    };

    cy.wait(`@${ASSET_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${FILE_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${EVENT_LIST_ALIAS}`).payloadShouldContain(filter);
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`).payloadShouldContain(filter);
  });
});
