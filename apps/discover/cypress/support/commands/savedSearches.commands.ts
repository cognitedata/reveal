import { SavedSearch } from '@cognite/discover-api-types';

import { NO_RESULTS_TEXT } from '../../../src/components/EmptyState/constants';
import { SHARED_USER_INPUT_PLACEHOLDER } from '../../../src/components/SearchUsers/constants';
import { SIDECAR } from '../../../src/constants/app';
import {
  SAVED_SEARCH_DELETED_MESSAGE,
  SHARE_SAVED_SEARCH,
} from '../../../src/pages/authorized/favorites/tabs/savedSearches/constants';
import { PROJECT } from '../../app.constants';

import { getTokenHeaders } from './helpers';

const getSavedSearchesEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/savedSearches`;

function getAllSavedSearches(
  isAdmin = false
): Cypress.Chainable<Cypress.Response<[]>> {
  return cy.request({
    method: 'GET',
    url: getSavedSearchesEndpoint(PROJECT),
    headers: getTokenHeaders(isAdmin),
  });
}

const deleteAllSavedSearches = (isAdmin = false) => {
  getAllSavedSearches(isAdmin).then((savedSearchResponse: any) => {
    savedSearchResponse.body.data.list.map((savedSearch: any) => {
      return cy.request({
        method: 'DELETE',
        url: `${getSavedSearchesEndpoint(PROJECT)}/${savedSearch.id}`,
        headers: getTokenHeaders(isAdmin),
      });
    });
  });
};

const createSavedSearch = (searchName, isAdmin = false) => {
  const body: SavedSearch = {
    query: '',
    filters: {},
  };
  return cy.request({
    method: 'PUT',
    url: `${getSavedSearchesEndpoint(PROJECT)}/${searchName}`,
    headers: getTokenHeaders(isAdmin),
    body,
  });
};
const goToSavedSearches = () => {
  cy.log('go to Favorites page');
  cy.findByTestId('top-bar').findByRole('tab', { name: 'Favorites' }).click();
  cy.findByRole('tab', { name: 'Saved Searches' }).click();
  cy.url().should('include', '/saved-searches');
};

const createNewSavedSearch = (name: string) => {
  cy.findAllByTestId('saved-search-input').type(name);
  cy.findAllByTestId('save-new-search-button').click();
};

const clickSavedSearchButton = () => {
  cy.log('Click saved searches button');
  cy.findByTestId('saved-searches-button').should('be.visible').click();
};

const checkEmptyTableState = () => {
  cy.log('Check empty saved search table');
  cy.findByText(NO_RESULTS_TEXT).should('be.visible');
};

const clickTableRemoveButton = () => {
  cy.log('Click Remove button on table row');
  cy.findByText('Remove').click({ force: true });
};

const clickTableShareButton = () => {
  cy.log('Click Share button on table row');
  cy.findByText('Share').click({ force: true });
};

const clickNthRowMoreOptionButton = (nth: number) => {
  cy.log(`Click 'More Option' button on ${nth} row`);
  cy.findByTestId('saved-searches-list')
    .findAllByTestId('table-row')
    .eq(nth)
    .invoke('attr', 'style', 'opacity: 1')
    .findByTestId('menu-button')
    .trigger('mouseenter', { force: true });
};

const clickCancelOnPopup = () => {
  cy.log('Click Cancel button on saved search delete pop-up');
  cy.findByTestId('cancel-delete-saved-search').should('be.visible').click();
};

const clickDeleteOnPopup = () => {
  cy.log('Click Delete button on saved search delete pop-up');
  cy.findByTestId('confirm-delete-saved-search').should('be.visible').click();
};

const checkDeletePopupMessage = () => {
  cy.log('Click delete pop-up message');
  cy.contains(SAVED_SEARCH_DELETED_MESSAGE).should('be.visible');
};

const navigateToSearchFromEmptyTableAndCheck = () => {
  cy.log('Navigate to main search from saved search empty table');
  cy.findByTestId('link-btn').should('be.visible').click();

  cy.log('Check navigated page');
  cy.findByTestId('map-container').should('be.visible');
};

const checkSearchNameOnTable = (savedSearchName: string) => {
  cy.log('Check saved search data on table');
  cy.findByTestId('saved-searches-list')
    .contains(savedSearchName)
    .should('be.visible');
};

const checkSavedSearchShareModal = (sharedNumber: number) => {
  cy.log('Check saved search share modal');
  cy.contains(SHARE_SAVED_SEARCH).should('be.visible');
  cy.findByTestId('share-with-user-btn').should('be.visible');
  cy.contains(`Shared with (${sharedNumber})`);
  cy.findAllByTestId('shared-with-username').should(
    'have.length',
    sharedNumber
  );
};

const typeOnShareModal = (input: string) => {
  cy.log('Type on saved search share modal');
  cy.findByText(SHARED_USER_INPUT_PLACEHOLDER)
    .should('be.visible')
    .click()
    .type(input);
};

const clickShareButtonOnModal = () => {
  cy.intercept({
    url: '**/savedSearches',
    method: 'GET',
  }).as('shareSavedSearch');
  cy.log('Click share button on share modal');
  cy.findByTestId('share-with-user-btn').should('be.visible').click();
  cy.wait('@shareSavedSearch', { requestTimeout: 10000 });
};

const clickNthRemoveShareButton = (nth: number) => {
  cy.log(`Remove ${nth} shared search`);
  cy.findAllByTestId('shared-user-remove-btn').eq(nth).click();
};

const clickCommentButtonAndCheck = () => {
  cy.log('Click comment button on table data');
  cy.get('[aria-label="Comment"]').click({ force: true });

  cy.log('Check comment section');
  cy.findByTestId('comments-root').should('be.visible');
};

const clickNthRowViewButton = (nth: number) => {
  cy.log(`Click 'View' button on ${nth} row`);
  cy.findByTestId('saved-searches-list')
    .findAllByTestId('table-row')
    .eq(nth)
    .invoke('attr', 'style', 'opacity: 1')
    .findByTestId('button-view-saved-search')
    .click({ force: true });
};

Cypress.Commands.add('deleteAllSavedSearches', deleteAllSavedSearches);
Cypress.Commands.add('createSavedSearch', createSavedSearch);
Cypress.Commands.add('createNewSavedSearch', createNewSavedSearch);
Cypress.Commands.add('goToSavedSearches', goToSavedSearches);
Cypress.Commands.add('clickSavedSearchButton', clickSavedSearchButton);

// Saved search table
Cypress.Commands.add('checkEmptyTableState', checkEmptyTableState);
Cypress.Commands.add(
  'clickNthRowMoreOptionButton',
  clickNthRowMoreOptionButton
);
Cypress.Commands.add(
  'navigateToSearchFromEmptyTableAndCheck',
  navigateToSearchFromEmptyTableAndCheck
);
Cypress.Commands.add('checkSearchNameOnTable', checkSearchNameOnTable);

// Delete pop-up
Cypress.Commands.add('clickTableRemoveButton', clickTableRemoveButton);
Cypress.Commands.add('clickCancelOnPopup', clickCancelOnPopup);
Cypress.Commands.add('clickDeleteOnPopup', clickDeleteOnPopup);
Cypress.Commands.add('checkDeletePopupMessage', checkDeletePopupMessage);

// Share modal
Cypress.Commands.add('clickTableShareButton', clickTableShareButton);
Cypress.Commands.add('checkSavedSearchShareModal', checkSavedSearchShareModal);
Cypress.Commands.add('typeOnShareModal', typeOnShareModal);
Cypress.Commands.add('clickShareButtonOnModal', clickShareButtonOnModal);
Cypress.Commands.add('clickNthRemoveShareButton', clickNthRemoveShareButton);

// Comment
Cypress.Commands.add('clickCommentButtonAndCheck', clickCommentButtonAndCheck);

Cypress.Commands.add('clickNthRowViewButton', clickNthRowViewButton);

export interface SavedSearchCommands {
  deleteAllSavedSearches(isAdmin?: boolean): void;
  createSavedSearch(
    searchName: string,
    isAdmin?: boolean
  ): Cypress.Chainable<Cypress.Response<string>>;
  createNewSavedSearch(name: string): void;
  goToSavedSearches(): void;
  clickSavedSearchButton(): void;
  checkEmptyTableState(): void;
  clickTableRemoveButton(): void;
  clickNthRowMoreOptionButton(nth: number): void;
  clickCancelOnPopup(): void;
  clickDeleteOnPopup(): void;
  checkDeletePopupMessage(): void;
  navigateToSearchFromEmptyTableAndCheck(): void;
  checkSearchNameOnTable(savedSearchName: string): void;
  clickTableShareButton(): void;
  checkSavedSearchShareModal(sharedNumber: number): void;
  typeOnShareModal(input: string): void;
  clickShareButtonOnModal(): void;
  clickNthRemoveShareButton(nth: number): void;
  clickCommentButtonAndCheck(): void;
  clickNthRowViewButton(nth: number): void;
}
