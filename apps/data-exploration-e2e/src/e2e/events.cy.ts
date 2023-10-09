import { EVENT_ID } from '../support/constant';
import {
  EVENT_LIST_ALIAS,
  interceptEventList,
} from '../support/interceptions/interceptions';

describe('Events', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();
  });

  beforeEach(() => {
    interceptEventList();
  });

  it('should go to events tab', () => {
    cy.goToTab('Events');
    cy.wait(`@${EVENT_LIST_ALIAS}`);
    cy.tableContentShouldBeVisible('event-search-results');
  });

  it('should sort files results', () => {
    cy.log('sorting colomn: Type');

    cy.getTableById('event-search-results').clickSortColoumn('Type');
    cy.wait(`@${EVENT_LIST_ALIAS}`).shouldSortAscending('type');

    cy.getTableById('event-search-results').clickSortColoumn('Type');
    cy.wait(`@${EVENT_LIST_ALIAS}`).shouldSortDescending('type');

    cy.log('sorting colomn: Description');
    cy.getTableById('event-search-results').clickSortColoumn('Description');
    cy.wait(`@${EVENT_LIST_ALIAS}`).shouldSortAscending('description');

    cy.getTableById('event-search-results').clickSortColoumn('Description');
    cy.wait(`@${EVENT_LIST_ALIAS}`).shouldSortDescending('description');

    // Reset sorting
    cy.getTableById('event-search-results').clickSortColoumn('Description');
  });

  it('should be able to search by id', () => {
    cy.performSearch(EVENT_ID);

    cy.getTableById('event-search-results')
      .selectColumn('ID')
      .contains(EVENT_ID)
      .should('be.visible');
    cy.findAllByText('Exact match: ID').should('be.visible').click();
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

  it('Should close the detail view and clear search input', () => {
    cy.log('close event detail view');
    cy.findByTestId('event-detail').clickIconButton('Close');
    cy.findByTestId('event-detail').should('not.exist');

    cy.clearSearchInput();
  });
});
