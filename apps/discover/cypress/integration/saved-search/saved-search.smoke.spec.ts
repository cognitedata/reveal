import { USER_PREFIX } from '../../app.constants';
import {
  DOCUMENTS_SEARCH_ALIAS,
  GET_SAVED_SEARCHES_ALIAS,
  interceptDocumentsSearch,
  cancelFrontendMetricsRequest,
  interceptGetFavorites,
  interceptGetSavedSearches,
  interceptRemoveShareSavedSearches,
  interceptShareSavedSearches,
  interceptUsersSearch,
  interceptWellsSearch,
  REMOVE_SHARE_SAVED_SEARCHES_ALIAS,
  SHARE_SAVED_SEARCHES_ALIAS,
  USERS_SEARCH_ALIAS,
  WELLS_SEARCH_ALIAS,
} from '../../support/interceptions';

describe('saved search', () => {
  const savedSearchName = `Saved search ${Date.now()}`;

  beforeEach(() => {
    cy.deleteAllSavedSearches();

    cancelFrontendMetricsRequest();

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });

  it('should show empty result when no saved searches and redirect to the main page', () => {
    cy.goToSavedSearches();
    cy.checkEmptyTableState();
    cy.navigateToSearchFromEmptyTableAndCheck();
  });

  it('should create & remove saved search', () => {
    cy.performSearch('Test');
    cy.clickSavedSearchButton();
    cy.createNewSavedSearch(savedSearchName);
    cy.goToSavedSearches();

    cy.checkSearchNameOnTable(savedSearchName);
    cy.clickNthRowMoreOptionButton(0);
    cy.clickTableRemoveButton();
    cy.checkDeletePopupMessage();

    cy.clickCancelOnPopup();
    cy.clickNthRowMoreOptionButton(0);
    cy.clickTableRemoveButton();
    cy.clickDeleteOnPopup();
    cy.checkEmptyTableState();
  });

  it('should share saved search', () => {
    interceptGetFavorites();
    interceptDocumentsSearch();
    interceptWellsSearch();
    interceptGetSavedSearches();
    interceptUsersSearch();
    interceptShareSavedSearches();
    interceptRemoveShareSavedSearches();

    cy.performSearch('Test');
    cy.wait(`@${DOCUMENTS_SEARCH_ALIAS}`);
    cy.wait(`@${WELLS_SEARCH_ALIAS}`);

    cy.clickSavedSearchButton();
    cy.createNewSavedSearch(savedSearchName);
    cy.goToSavedSearches();
    cy.wait(`@${GET_SAVED_SEARCHES_ALIAS}`);

    cy.clickNthRowMoreOptionButton(0);
    cy.clickTableShareButton();
    cy.wait(`@${USERS_SEARCH_ALIAS}`);
    cy.checkSavedSearchShareModal(1);
    cy.typeOnShareModal(Cypress.env('REACT_APP_E2E_USER'));
    cy.wait(`@${USERS_SEARCH_ALIAS}`);
    cy.findByTestId('shared-user-autocomplete')
      .findByText(`Admin User ${USER_PREFIX.toUpperCase()}`)
      .click();

    cy.findByTestId('shared-user-input')
      .findByText(`Admin User ${USER_PREFIX.toUpperCase()}`)
      .should('be.visible');

    cy.findByTestId('share-with-user-btn').should('be.visible').click();
    cy.wait(`@${SHARE_SAVED_SEARCHES_ALIAS}`);
    cy.wait(`@${GET_SAVED_SEARCHES_ALIAS}`);

    cy.checkSavedSearchShareModal(2);
    cy.clickNthRemoveShareButton(0);
    cy.wait(`@${REMOVE_SHARE_SAVED_SEARCHES_ALIAS}`);
    cy.checkSavedSearchShareModal(1);
  });

  it('should comment section work properly', () => {
    cy.performSearch('Test');
    cy.clickSavedSearchButton();
    cy.createNewSavedSearch(savedSearchName);
    cy.goToSavedSearches();

    cy.clickNthRowMoreOptionButton(0);
    cy.clickCommentButtonAndCheck();
  });

  it('should give correct search result with saved search', () => {
    cy.performSearch('Document');
    cy.findByTestId('bread-crumb-info-button').then(
      (element: JQuery<HTMLElement>) => {
        const documentCount = element[0].innerText;
        cy.clickSavedSearchButton();
        cy.createNewSavedSearch(savedSearchName);
        cy.goToSavedSearches();

        cy.clickNthRowViewButton(0);

        cy.log('Document count should be same as before');
        cy.findByTestId('bread-crumb-info-button')
          .contains(documentCount)
          .should('be.visible');
      }
    );
  });
});
