import {
  SEQUENCE_LIST_ALIAS,
  interceptSequenceList,
} from '../support/interceptions/interceptions';

describe('Sequence - Filters', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();

    cy.goToTab('Sequence');
    cy.tableContentShouldBeVisible('sequence-search-results');
  });

  beforeEach(() => {
    interceptSequenceList();
  });

  afterEach(() => {
    cy.resetSearchFilters();
  });

  it('should filter sequence by metadata', () => {
    const METADATA_PROPERTY = 'source';
    const METADATA_VALUE = 'andromeda';

    cy.clickSelectFilter('Metadata')
      .searchOption(METADATA_PROPERTY)
      .hoverSelectOption(METADATA_PROPERTY)
      .getSelectMenu({ subMenu: true })
      .should('be.visible');

    cy.getSelectFilter('Metadata').searchAndClickSelectOption(METADATA_VALUE, {
      subMenu: true,
    });

    cy.getSelectFilter('Metadata').getSelectMenu().clickButton('Apply');

    cy.wait(`@${SEQUENCE_LIST_ALIAS}`).payloadShouldContain({
      equals: {
        property: ['metadata', METADATA_PROPERTY],
        value: METADATA_VALUE,
      },
    });
  });
});
