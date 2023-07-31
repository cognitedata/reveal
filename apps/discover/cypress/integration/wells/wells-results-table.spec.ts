import { UserPreferredUnit } from '../../../src/constants/units';
import {
  OPERATOR,
  DATA_SOURCE,
} from '../../../src/modules/wellSearch/constantsSidebarFilters';
import {
  WATER_DEPTH,
  KB_ELEVATION,
} from '../../../src/pages/authorized/search/well/content/constants';
import { interceptCoreNetworkRequests } from '../../support/commands/helpers';
import { STATIC_WELL_1 } from '../../support/constants';
import {
  interceptPutSavedSearches,
  PUT_SAVED_SEARCHES_ALIAS,
  WELLS_SEARCH_ALIAS,
} from '../../support/interceptions';
import { SOURCE_FILTER } from '../../support/selectors/wells.selectors';

describe('Wells: result_table', () => {
  beforeEach(() => {
    cy.deleteAllFavorites();
    cy.deleteAllSavedSearches();
    cy.addWaitForWdlResources('sources', 'GET', 'getSources');
    const coreRequests = interceptCoreNetworkRequests();
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);
  });

  it('Should be able to add search result into a saved search', () => {
    interceptPutSavedSearches();
    const savedSearchName = `Test saved search`;
    cy.expandResultTable();
    cy.goToTab('Wells');
    cy.selectFirstWellInResults();

    cy.log(`click on saved searches button`);
    cy.get('[aria-label="saved search"]').click({ force: true });

    cy.log(`Create new window should appear `);
    cy.findByText('Create new').should('be.visible');

    cy.log(`Should be able to create a saved search`);
    cy.createNewSavedSearch(savedSearchName);
    cy.wait(`@${PUT_SAVED_SEARCHES_ALIAS}`);
    cy.findByText('Saved search added').should('be.visible');

    cy.log(`navigate to saved search tab`);
    cy.goToSavedSearches();

    cy.log(`Created saved search should display on the table`);
    cy.findByTitle(savedSearchName).should('be.visible');

    cy.log('hoover on created saved search name');
    cy.findAllByTestId('table-row').invoke('show');

    cy.log('click view button');
    cy.findByTestId('button-view-saved-search').click({ force: true });

    cy.log('navigate to wells tab');
    cy.goToTab('Wells');

    cy.findByText('Loading saved search.').should('be.visible');
    cy.checkIfNthRowIsSelected(0);
  });

  it('Should be able to add searched result in to a existing favorite folder', () => {
    const favoriteName = `Test favorite ${Date.now()}`;
    cy.createFavorite({ name: favoriteName });

    cy.expandResultTable();
    cy.goToTab('Wells');
    cy.selectFirstWellInResults();

    cy.findAllByTestId('table-row')
      .first()
      .children()
      .last()
      .children()
      .first()
      .invoke('attr', 'style', 'opacity: 1');

    cy.findAllByTestId('menu-button')
      .eq(0)
      .trigger('mouseenter', { force: true });

    cy.findByText('Add to favorites').click({ force: true });

    cy.get('button').contains(favoriteName).click({ force: true });

    cy.goToFavoritesPage();

    cy.findByTitle(favoriteName).should('be.visible').click();
    cy.findByTestId('favorite-details-content-navigation')
      .findAllByRole('tab')
      .eq(1)
      .click();

    cy.findByTestId('favorite-wells-table')
      .findAllByTestId('table-row')
      .should('have.length', 1);
  });

  it('Measurement unit changes should apply to "water depth" & "KB elevation" column', () => {
    cy.expandResultTable();
    cy.goToTab('Wells');

    cy.log('click on settings button');
    cy.get('[aria-label="Settings"]').as('settingsBtn');
    cy.get('@settingsBtn').click();

    cy.log('settings window should display');
    cy.findByText('Settings').should('be.visible');

    cy.log('verify select option - Meter');
    cy.getButton('Meter').click({ force: true }).should('be.focused');

    cy.log('close the settings window');
    cy.findAllByRole('img').eq(0).click();

    cy.log(`verify ${WATER_DEPTH} column header`);
    cy.findByTestId('table-header-row')
      .findByText(`${WATER_DEPTH} (${UserPreferredUnit.METER})`)
      .should('be.visible');

    cy.log(`Enable the ${KB_ELEVATION} column from column settings`);
    cy.findByTestId('organize-columns').click();
    cy.findByTitle(`${KB_ELEVATION} (${UserPreferredUnit.METER})`).click({
      force: true,
    });
    cy.findByTestId('organize-columns').click();

    cy.log(`verify ${KB_ELEVATION} column header`);
    cy.findByTestId('table-header-row')
      .findByText(`${KB_ELEVATION} (${UserPreferredUnit.METER})`)
      .should('be.visible');

    cy.log(
      'water depth value should change according to selected measurement unit'
    );
    cy.findAllByTestId('table-cell')
      .eq(5)
      .invoke('text')
      .then(parseFloat)
      .then((valInMeter) => {
        cy.get('@settingsBtn').click();
        cy.getButton('Feet').click({ force: true });

        cy.findAllByTestId('table-cell')
          .eq(5)
          .invoke('text')
          .then(parseFloat)
          .then((valInFeet) => {
            expect(valInFeet).greaterThan(valInMeter);
          });
      });
  });

  it('Should be able to load more items in result table', () => {
    cy.expandResultTable();
    cy.goToTab('Wells');

    cy.findAllByTestId('table-row')
      .its('length')
      .then((rowCount) => {
        cy.log('click on `Load more` button');
        cy.findAllByText('Load more').click();

        cy.log('compare number of rows which visible on result table');
        cy.findAllByTestId('table-row').its('length').should('be.gt', rowCount);
      });
    cy.log('scroll down result table');
    cy.findAllByTestId('well-result-table').scrollTo('bottom', {
      ensureScrollable: false,
    });
    cy.findByText('Use filters to refine your search').should('be.visible');
  });

  it('Should be able to clear all the filters by clicking `clear all` button', () => {
    cy.addWaitForWdlResources(
      'trajectories/list',
      'POST',
      'getTrajectoriesList'
    );

    cy.expandResultTable();
    cy.goToTab('Wells');
    cy.wait('@getTrajectoriesList');
    cy.wait('@getSources');

    cy.log('click on source filter section');
    cy.clickOnFilterCategory(DATA_SOURCE);

    cy.log('Checking source values');
    cy.validateSelect(DATA_SOURCE, [SOURCE_FILTER], SOURCE_FILTER);

    cy.log('Minimize source section');
    cy.clickOnFilterCategory(DATA_SOURCE);

    cy.log('Open OPERATOR');
    cy.clickOnFilterCategory(OPERATOR);

    cy.validateSelect(OPERATOR, ['Pretty Polly ASA'], 'Pretty Polly ASA');
    cy.clickOnFilterCategory(OPERATOR);

    cy.log(`Clicking on clear all filters`);
    cy.findAllByTestId('clear-all-filter-button').should('be.visible').click();
    cy.findAllByTestId('filter-tag').should('not.exist');
  });

  it('Should be able to navigate overview page by clicking `view` buttons for both wells and wellbores', () => {
    cy.performSearch(STATIC_WELL_1);
    cy.wait(`@${WELLS_SEARCH_ALIAS}`);
    cy.goToTab('Wells');

    cy.log('hover on well row');
    cy.hoverOnNthWell(1);

    cy.log('click view button');
    cy.clickNthWellViewButton(0);

    cy.log('result table should contain 4 rows');
    cy.findAllByTestId('table-row').its('length').should('eq', 4);

    cy.log('go back to well result table');
    cy.findAllByTestId('well-inspect-back-btn').click();

    cy.log('expand well row');
    cy.findAllByTestId('table-cell')
      .contains(`${STATIC_WELL_1}`)
      .first()
      .click();

    cy.log('hover on wellbore row and click on `view` button');
    cy.hoverOnNthWellbore(0, 'result');
    cy.clickNthWellboreViewButton(0);

    cy.log('result table should contain 1 row');
    cy.findByTestId('overview-result-table')
      .findAllByTestId('table-row')
      .its('length')
      .should('eq', 1);
  });
});
