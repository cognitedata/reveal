import {
  EVENT_AGGREGATE_ALIAS,
  EVENT_LIST_ALIAS,
  interceptEventsAggregate,
  interceptEventList,
} from '../support/interceptions/interceptions';

describe('Events filters', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    interceptEventList();
    interceptEventsAggregate();

    cy.goToTab('Events');
    cy.wait(`@${EVENT_LIST_ALIAS}`);
    cy.wait(`@${EVENT_AGGREGATE_ALIAS}`);

    cy.tableContentShouldBeVisible('event-search-results');
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter events by Type', () => {
    const TYPES = 'material';

    interceptEventList('eventFilterByType');

    cy.clickSelectFilter('Types').searchAndClickSelectOption(TYPES);

    cy.wait('@eventFilterByType').payloadShouldContain({
      in: {
        property: ['type'],
        values: [TYPES],
      },
    });
  });

  it('should filter events by SubType', () => {
    const SUB_TYPES = 'actual';

    interceptEventList('eventFilterBySubType');

    cy.clickSelectFilter('Subtypes').searchAndClickSelectOption(SUB_TYPES);

    cy.wait('@eventFilterBySubType').payloadShouldContain({
      in: {
        property: ['subtype'],
        values: [SUB_TYPES],
      },
    });
  });

  it('should filter events by source', () => {
    const SOURCE = 'sap';

    interceptEventList('eventFilterBySource');

    cy.clickSelectFilter('Sources').searchAndClickSelectOption(SOURCE);

    cy.wait('@eventFilterBySource').payloadShouldContain({
      in: {
        property: ['source'],
        values: [SOURCE],
      },
    });
  });

  it('should filter events by StartTime', () => {
    cy.clickSelectFilter('Start time').clickSelectOption('Before');

    cy.log('change date to 2023/01/01');
    cy.openDatePicker('Start time');

    interceptEventList('eventFilterByStartTime');

    cy.selectYear(2023);
    cy.selectMonth('January');
    cy.selectDate('January 1st');

    cy.getDatePickerValue('Start time').then((selectedDate) => {
      cy.wait('@eventFilterByStartTime').payloadShouldContain({
        range: {
          property: ['startTime'],
          lte: new Date(selectedDate).valueOf(),
        },
      });
    });
  });

  it('should filter events by End Time', () => {
    cy.clickSelectFilter('End time').clickSelectOption('Before');

    cy.log('change date to 2023/01/01');
    cy.openDatePicker('End time');

    interceptEventList('eventFilterByEndTime');

    cy.selectYear(2023);
    cy.selectMonth('January');
    cy.selectDate('January 1st');

    cy.getDatePickerValue('End time').then((selectedDate) => {
      cy.wait('@eventFilterByEndTime').payloadShouldContain({
        range: {
          property: ['endTime'],
          lte: new Date(selectedDate).valueOf(),
        },
      });
    });
  });
});
