import { interceptFavorites, FAVORITES } from '../../support/interceptions';

describe('saved search', () => {
  const savedSearchName = `Saved search ${Date.now()}`;

  beforeEach(() => {
    cy.deleteAllSavedSearches();
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
    interceptFavorites();
    cy.performSearch('Test');
    cy.clickSavedSearchButton();
    cy.createNewSavedSearch(savedSearchName);
    cy.goToSavedSearches();

    cy.clickNthRowMoreOptionButton(0);
    cy.clickTableShareButton();
    cy.checkSavedSearchShareModal(1);
    cy.typeOnShareModal('{downArrow}{enter}');
    cy.clickShareButtonOnModal();
    cy.wait(`@${FAVORITES}`);
    cy.checkSavedSearchShareModal(2);
    cy.clickNthRemoveShareButton(0);
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
