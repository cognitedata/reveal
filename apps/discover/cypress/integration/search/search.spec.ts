import { STATIC_WELL_1 } from '../../support/constants';

const FILENAME = '15_9_19_A_1980_01_01';

describe('search history', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });

  it('Should be able to search wells from search history', () => {
    cy.performSearch(STATIC_WELL_1);
    cy.goToTab('Wells');

    cy.log('clear search string');
    cy.findAllByTestId('filter-tag').click();

    cy.log('verify search history');
    cy.findByTestId('main-search-input')
      .click()
      .eq(0)
      .invoke('text')
      .then((searchHistory) => {
        expect(searchHistory).to.contain(STATIC_WELL_1);
      });

    cy.log('when click on search history item correct result should display');
    cy.findAllByTitle(STATIC_WELL_1).eq(0).click();

    cy.findAllByTestId('table-cell')
      .eq(2)
      .invoke('text')
      .then((wellName) => {
        expect(wellName).to.eq(STATIC_WELL_1);
      });
  });

  it('Should be able to search documents from search history', () => {
    cy.performSearch(FILENAME);
    cy.goToTab('Documents');

    cy.log('clear search string');
    cy.findAllByTestId('filter-tag').click();

    cy.log('verify search history');
    cy.findByTestId('main-search-input')
      .click()
      .eq(0)
      .invoke('text')
      .then((searchHistory) => {
        expect(searchHistory).to.contain(FILENAME);
      });

    cy.log('when click on search history item correct result should display');
    cy.findAllByTitle(FILENAME).eq(0).click();

    cy.findAllByTestId('table-cell')
      .eq(2)
      .invoke('text')
      .then((docname) => {
        expect(docname).to.contain(FILENAME);
      });
  });
});
