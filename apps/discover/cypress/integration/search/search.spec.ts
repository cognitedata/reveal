import { STATIC_WELL_1 } from '../../support/constants';
import { cancelFrontendMetricsRequest } from '../../support/interceptions';

const FILENAME = '15_9_19_A_1980_01_01';

describe('search history', () => {
  beforeEach(() => {
    cancelFrontendMetricsRequest();

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });

  describe('Search History', () => {
    const testSearch = '15/9-19';
    let text = '';

    it('Perform search', () => {
      cy.performSearch(testSearch);
      cy.findByTestId('bread-crumb-info-button')
        .should('be.visible')
        .then((element) => {
          text = element[0].innerText;
        });
    });

    it('Should be view search history', () => {
      cy.findByTestId('main-search-input').click();
      cy.findByTitle(testSearch).should('be.visible').click();

      cy.findByTestId('bread-crumb-info-button')
        .contains(text)
        .should('be.visible');
    });
  });

  describe('search history', () => {
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

  describe('search syntax', () => {
    const andOperator = '15_9_19_A + 01_01';
    const orOperator = '15_9_19_A | 01_01';
    const excludeOperator = '15_9_19_A -01_01';
    const exactPhrase = `"${FILENAME}"`;

    it('should return search results correctly', () => {
      cy.log('Perform AND syntax search and check result');
      cy.performSearch(andOperator);
      cy.getDocumentResultTable().contains(FILENAME).should('be.visible');

      cy.log('Perform OR syntax search and check result');
      cy.performSearch(orOperator);
      cy.getDocumentResultTable().contains('15_9_19_A').should('be.visible');

      cy.findByTestId('doc-result-table')
        .contains('01_01')
        .should('be.visible');

      cy.log('Perform exclude syntax search and check result');
      cy.performSearch(excludeOperator);
      cy.getDocumentResultTable().contains(FILENAME).should('not.exist');

      cy.log('Perform exact phrase search and check result');
      cy.performSearch(exactPhrase);
      cy.getDocumentResultTable().contains(FILENAME).should('be.visible');

      cy.getDocumentResultTable()
        .findAllByTestId('table-row')
        .should('have.length', 1);
    });
  });
});
