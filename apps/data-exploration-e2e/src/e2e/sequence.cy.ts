import { SEQUENCE_NAME } from '../support/constant';
import {
  SEQUENCE_LIST_ALIAS,
  interceptSequenceList,
} from '../support/interceptions/interceptions';

describe('Sequence', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();
  });

  beforeEach(() => {
    interceptSequenceList();
  });

  it('should go to sequence tab', () => {
    cy.goToTab('Sequence');
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`);
    cy.tableContentShouldBeVisible('sequence-search-results');
  });

  it('should sort sequence results', () => {
    cy.log('sorting colomn: Name');

    cy.getTableById('sequence-search-results').clickSortColoumn('Name');
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`).shouldSortAscending('name');

    cy.getTableById('sequence-search-results').clickSortColoumn('Name');
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`).shouldSortDescending('name');

    cy.log('sorting colomn: External ID');
    cy.getTableById('sequence-search-results').clickSortColoumn('External ID');
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`).shouldSortAscending('externalId');

    cy.getTableById('sequence-search-results').clickSortColoumn('External ID');
    cy.wait(`@${SEQUENCE_LIST_ALIAS}`).shouldSortDescending('externalId');

    // Reset sorting
    cy.getTableById('sequence-search-results').clickSortColoumn('External ID');
  });

  it('should select ID from the colomn selection', () => {
    cy.tableShouldBeVisible('sequence-search-results').selectColumn(`ID`);
  });

  it('should navigate to the detail view', () => {
    cy.performSearch(SEQUENCE_NAME);

    cy.getTableById('sequence-search-results')
      .contains(SEQUENCE_NAME)
      .should('be.visible')
      .click();
  });

  it('should navigate between the detail view tabs', () => {
    cy.log('should contain All resources tab details');
    cy.findByTestId('sequence-details-preview').should('be.visible');

    cy.log('should navigate to Details tab');
    cy.findByTestId('sequence-detail').goToTab('Details');
    cy.findByTestId('general-details-card').should('be.visible');
  });

  it('should be able to download as json', () => {
    cy.log('click Download button');
    cy.clickIconButton('Download');

    cy.log('click Download data as JSON button');
    cy.getButton('Download data as JSON').click();
  });

  it('should be able to maximize and minimize detail view', () => {
    cy.log('open in full screen');
    cy.clickIconButton('Toggle fullscreen-expand');

    cy.log('minimize fullscreen');
    cy.clickIconButton('Toggle fullscreen-collapse');
  });

  it('should close file detail view and clear search input', () => {
    cy.log('close file detail view');
    cy.findByTestId('sequence-detail').clickIconButton('Close');
    cy.findByTestId('sequence-detail').should('not.exist');

    cy.clearSearchInput();
  });

  it('should be able to load more', () => {
    cy.getTableById('sequence-search-results').shouldLoadMore(
      SEQUENCE_LIST_ALIAS
    );
  });
});
