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
    cy.findAllByTestId('sequence-details-preview').should('be.visible');

    cy.log('should navigate to Details tab');
    cy.findAllByTestId('sequence-detail').goToTab('Details');
    cy.findAllByTestId('general-details-card').should('be.visible');
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

  it('should be able to close the detail view', () => {
    cy.log('close event detail view');
    cy.clickIconButton('Close');
  });

  it('should be able to clear input field', () => {
    cy.clickIconButton('Clear input field');
  });
});
