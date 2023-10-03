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

    cy.clickFilter('Types').searchAndClickOption(TYPES);

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

    cy.clickFilter('Subtypes').searchAndClickOption(SUB_TYPES);

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

    cy.clickFilter('Sources').searchAndClickOption(SOURCE);

    cy.wait('@eventFilterBySource').payloadShouldContain({
      in: {
        property: ['source'],
        values: [SOURCE],
      },
    });
  });
});
