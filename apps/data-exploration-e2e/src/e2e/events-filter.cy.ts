import {
  EVENT_LIST_ALIAS,
  interceptEventList,
} from '../support/interceptions/interceptions';

describe('Events - Filters', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    cy.goToTab('Events');
    cy.tableContentShouldBeVisible('event-search-results');
  });

  beforeEach(() => {
    interceptEventList();
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter events by type', () => {
    const TYPES = 'material';

    cy.clickSelectFilter('Types').searchAndClickSelectOption(TYPES);

    cy.wait(`@${EVENT_LIST_ALIAS}`).payloadShouldContain({
      in: {
        property: ['type'],
        values: [TYPES],
      },
    });
  });

  it('should filter events by subtype', () => {
    const SUB_TYPES = 'actual';

    cy.clickSelectFilter('Subtypes').searchAndClickSelectOption(SUB_TYPES);

    cy.wait(`@${EVENT_LIST_ALIAS}`).payloadShouldContain({
      in: {
        property: ['subtype'],
        values: [SUB_TYPES],
      },
    });
  });

  it('should filter events by source', () => {
    const SOURCE = 'sap';

    cy.clickSelectFilter('Sources').searchAndClickSelectOption(SOURCE);

    cy.wait(`@${EVENT_LIST_ALIAS}`).payloadShouldContain({
      in: {
        property: ['source'],
        values: [SOURCE],
      },
    });
  });

  it('should filter events by start time', () => {
    cy.clickSelectFilter('Start time').clickSelectOption('Before');

    cy.openDatePicker('Start time');
    cy.wait(`@${EVENT_LIST_ALIAS}`);

    cy.log('change date to 2023/01/01');
    cy.selectYear(2023);
    cy.selectMonth('January');
    cy.selectDate('January 1st');

    cy.getDatePickerValue('Start time').then((selectedDate) => {
      cy.wait(`@${EVENT_LIST_ALIAS}`).payloadShouldContain({
        range: {
          property: ['startTime'],
          lte: new Date(selectedDate).valueOf(),
        },
      });
    });
  });

  it('should filter events by end time', () => {
    cy.clickSelectFilter('End time').clickSelectOption('Before');

    cy.openDatePicker('End time');
    cy.wait(`@${EVENT_LIST_ALIAS}`);

    cy.log('change date to 2023/01/01');
    cy.selectYear(2023);
    cy.selectMonth('January');
    cy.selectDate('January 1st');

    cy.getDatePickerValue('End time').then((selectedDate) => {
      cy.wait(`@${EVENT_LIST_ALIAS}`).payloadShouldContain({
        range: {
          property: ['endTime'],
          lte: new Date(selectedDate).valueOf(),
        },
      });
    });
  });

  it('should filter events by metadata', () => {
    const METADATA_PROPERTY = 'order';
    const METADATA_VALUE = '10740089';

    cy.clickSelectFilter('Metadata')
      .searchOption(METADATA_PROPERTY)
      .hoverSelectOption(METADATA_PROPERTY)
      .getSelectMenu({ subMenu: true })
      .should('be.visible');

    cy.getSelectFilter('Metadata').searchAndClickSelectOption(METADATA_VALUE, {
      subMenu: true,
    });

    cy.getSelectFilter('Metadata').getSelectMenu().clickButton('Apply');

    cy.wait(`@${EVENT_LIST_ALIAS}`).payloadShouldContain({
      equals: {
        property: ['metadata', METADATA_PROPERTY],
        value: METADATA_VALUE,
      },
    });
  });
});
