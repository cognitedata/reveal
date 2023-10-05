import { FILE_NAME } from '../support/constant';
import {
  FILE_LIST_ALIAS,
  interceptFileList,
} from '../support/interceptions/interceptions';

describe('Files', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();
  });

  beforeEach(() => {
    interceptFileList();
  });

  it('should go to files tab', () => {
    cy.goToTab('Files');
    cy.wait(`@${FILE_LIST_ALIAS}`);
    cy.tableContentShouldBeVisible('documents-search-results');
  });

  it('should sort files results', () => {
    cy.log('sorting colomn: Name');

    cy.getTableById('documents-search-results').clickSortColoumn('Name');
    cy.wait(`@${FILE_LIST_ALIAS}`).shouldSortAscending('sourceFile.name');

    cy.getTableById('documents-search-results').clickSortColoumn('Name');
    cy.wait(`@${FILE_LIST_ALIAS}`).shouldSortDescending('sourceFile.name');

    cy.log('sorting colomn: File types');
    cy.getTableById('documents-search-results').clickSortColoumn('File type');
    cy.wait(`@${FILE_LIST_ALIAS}`).shouldSortAscending('type');

    cy.getTableById('documents-search-results').clickSortColoumn('File type');
    cy.wait(`@${FILE_LIST_ALIAS}`).shouldSortDescending('type');

    // Reset sorting
    cy.getTableById('documents-search-results').clickSortColoumn('File type');
  });

  it('should select External ID from the colomn selection', () => {
    cy.tableShouldBeVisible('documents-search-results').selectColumn(
      `External ID`
    );
  });

  it('should navigate to the detail view', () => {
    cy.performSearch(FILE_NAME);

    cy.getTableById('documents-search-results')
      .contains(FILE_NAME)
      .should('be.visible')
      .click();
  });

  it('should display file preview', () => {
    cy.findByTestId('file-preview').should('be.visible');
  });

  it('should display file details', () => {
    cy.findByTestId('file-detail').goToTab('Details');

    cy.findByTestId('general-details-card').should('be.visible');
    cy.findByTestId('metadata-card').should('be.visible');
  });

  it('should close file detail view and clear search input', () => {
    cy.log('close file detail view');
    cy.clickIconButton('Close');

    cy.clearSearchInput();
  });
});
