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

  it('should sort event results', () => {
    cy.goToTab('Events');
    cy.wait(`@${EVENT_LIST_ALIAS}`);

    cy.log('sorting colomn: Type');
    cy.getTableById('event-search-results').clickSortColoumn('Type');
    cy.wait(`@${EVENT_LIST_ALIAS}`);
    cy.getTableById('event-search-results')
      .getColomnValues('type')
      .shouldBeSortedAscending();

    cy.getTableById('event-search-results').clickSortColoumn('Type');
    cy.wait(`@${EVENT_LIST_ALIAS}`);
    cy.getTableById('event-search-results')
      .getColomnValues('type')
      .shouldBeSortedDescending();

    cy.log('sorting colomn: Description');
    cy.getTableById('event-search-results').clickSortColoumn('Description');
    cy.wait(`@${EVENT_LIST_ALIAS}`);
    cy.getTableById('event-search-results')
      .getColomnValues('description')
      .shouldBeSortedAscending();

    cy.getTableById('event-search-results').clickSortColoumn('Description');
    cy.wait(`@${EVENT_LIST_ALIAS}`);
    cy.getTableById('event-search-results')
      .getColomnValues('description')
      .shouldBeSortedDescending();
  });

  it('should be able to search by id', () => {
    cy.columnSelection(`id`);
    cy.performSearch(EVENT_ID);

    cy.getTableById('event-search-results')
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

  it('should be able to close the detail view', () => {
    cy.log('close event detail view');
    cy.clickIconButton('Close');
  });

  it('should be able to clear input field', () => {
    cy.clickIconButton('Clear input field');
  });
});
