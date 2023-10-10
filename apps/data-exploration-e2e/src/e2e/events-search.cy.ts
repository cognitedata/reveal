import {
  EVENT_ID,
  EVENT_DESCRIPTION,
  EVENT_EXTERNAL_ID,
  EVENT_METADATA,
  EVENT_TYPE,
} from '../support/constant';
import {
  EVENT_LIST_ALIAS,
  interceptEventList,
} from '../support/interceptions/interceptions';

describe('Search - Events', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    cy.goToTab('Events');
    cy.tableContentShouldBeVisible('event-search-results');

    cy.openSearchConfig();
    cy.enableSearchConfig('Events', 'Type');
    cy.enableSearchConfig('Events', 'Description');
    cy.enableSearchConfig('Events', 'External ID');
    cy.enableSearchConfig('Events', 'ID');
    cy.enableSearchConfig('Events', 'Metadata');
    cy.saveSearchConfig();
  });

  beforeEach(() => {
    interceptEventList();
  });

  afterEach(() => {
    cy.clearSearchInput();
  });

  it('should search by: Type', () => {
    cy.performSearch(EVENT_TYPE);
    cy.wait(`@${EVENT_LIST_ALIAS}`);

    cy.getTableById('event-search-results')
      .selectColumn('Type')
      .contains(EVENT_TYPE)
      .should('be.visible');

    cy.shouldExistExactMatchLabelBy('Type');
  });

  it('should search by: Description', () => {
    cy.performSearch(EVENT_DESCRIPTION);
    cy.wait(`@${EVENT_LIST_ALIAS}`);

    cy.getTableById('event-search-results')
      .selectColumn('Description')
      .contains(EVENT_DESCRIPTION)
      .should('be.visible');

    cy.shouldExistExactMatchLabelBy('Description');
  });

  it('should search by: External ID', () => {
    cy.performSearch(EVENT_EXTERNAL_ID);
    cy.wait(`@${EVENT_LIST_ALIAS}`);

    cy.getTableById('event-search-results')
      .selectColumn('External ID')
      .contains(EVENT_EXTERNAL_ID)
      .should('be.visible');

    cy.shouldExistExactMatchLabelBy('External ID');
  });

  it('should search by: ID', () => {
    cy.performSearch(EVENT_ID);
    cy.wait(`@${EVENT_LIST_ALIAS}`);

    cy.getTableById('event-search-results')
      .selectColumn('ID')
      .contains(EVENT_ID)
      .should('be.visible');

    cy.shouldExistExactMatchLabelBy('ID');
  });

  it('should search by: Metadata|isdeleted', () => {
    cy.performSearch(EVENT_METADATA);
    cy.wait(`@${EVENT_LIST_ALIAS}`);

    cy.getTableById('event-search-results')
      .selectColumn('isdeleted')
      .contains(EVENT_METADATA)
      .should('be.visible');

    cy.shouldExistExactMatchLabelBy('Metadata "isdeleted"');
  });
});
