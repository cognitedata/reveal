import {
  SEQUENCE_DESCRIPTION,
  SEQUENCE_EXTERNAL_ID,
  SEQUENCE_ID,
  SEQUENCE_METADATA,
  SEQUENCE_NAME,
} from '../support/constant';
import {
  SEQUENCE_LIST_ALIAS,
  interceptSequenceList,
} from '../support/interceptions/interceptions';

describe('Search function - files', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    cy.goToTab('Sequence');
    cy.tableContentShouldBeVisible('sequence-search-results');

    cy.openSearchConfig();
    cy.enableSearchConfig('Sequences', 'Name');
    cy.enableSearchConfig('Sequences', 'Description');
    cy.enableSearchConfig('Sequences', 'External ID');
    cy.enableSearchConfig('Sequences', 'ID');
    cy.enableSearchConfig('Sequences', 'Metadata');
    cy.saveSearchConfig();
  });

  beforeEach(() => {
    interceptSequenceList();
  });
  afterEach(() => {
    cy.clearSearchInput();
  });

  it('Should search by: Name', () => {
    cy.performSearch(SEQUENCE_NAME);
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`);

    cy.getTableById('sequence-search-results')
      .contains(SEQUENCE_NAME)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('Name');
  });

  it('Should search by: Description', () => {
    cy.performSearch(SEQUENCE_DESCRIPTION);
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`);

    cy.getTableById('sequence-search-results')
      .selectColumn('Description')
      .contains(SEQUENCE_DESCRIPTION)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('Description');
  });

  it('Should search: External ID', () => {
    cy.performSearch(SEQUENCE_EXTERNAL_ID);
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`);

    cy.getTableById('sequence-search-results')
      .selectColumn('External ID')
      .contains(SEQUENCE_EXTERNAL_ID)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('External ID');
  });

  it('Should search by ID', () => {
    cy.performSearch(SEQUENCE_ID);
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`);

    cy.getTableById('sequence-search-results')
      .selectColumn(' ID')
      .contains(SEQUENCE_ID)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('ID');
  });

  it('Should search by: Metadata|source', () => {
    cy.performSearch(SEQUENCE_METADATA);

    cy.getTableById('sequence-search-results')
      .selectColumn('source')
      .contains(SEQUENCE_METADATA)
      .should('exist');

    cy.shouldExistExactMatchLabelBy('Metadata "source"');
  });
});
