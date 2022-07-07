import { DATA_SOURCE } from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../../src/pages/authorized/search/well/inspect/constants';
import { GraphTrackEnum } from '../../../../../src/pages/authorized/search/well/inspect/modules/wellLogs/constants';
import { interceptCoreNetworkRequests } from '../../../../support/commands/helpers';
import { WELL_SOURCE_WITH_ALL } from '../../../../support/constants';
import {
  GET_FAVORITES_ALIAS,
  interceptGetFavorites,
  interceptPutSavedSearches,
  PUT_SAVED_SEARCHES_ALIAS,
  WELLS_SEARCH_ALIAS,
} from '../../../../support/interceptions';

describe('Wells: Well Logs', () => {
  before(() => {
    interceptGetFavorites();
    interceptPutSavedSearches();
    cy.addWaitForWdlResources(
      'trajectories/list',
      'POST',
      'getTrajectoriesList'
    );

    cy.addWaitForWdlResources(
      'measurements/depth/data',
      'POST',
      'measurementsDepthData'
    );

    cy.addWaitForWdlResources(
      'measurements/depth/list',
      'POST',
      'measurementsDepthList'
    );

    cy.addWaitForWdlResources('nds/list', 'POST', 'ndsList');

    const coreRequests = interceptCoreNetworkRequests();
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);
    cy.selectCategory('Wells');

    cy.log('click on source filter section');
    cy.clickOnFilterCategory(DATA_SOURCE);

    cy.clickOnNthFilterWrapper(0);
    cy.validateCheck(DATA_SOURCE, [WELL_SOURCE_WITH_ALL], WELL_SOURCE_WITH_ALL);

    cy.wait('@getTrajectoriesList');
    cy.wait(`@${GET_FAVORITES_ALIAS}`);
    cy.wait(`@${PUT_SAVED_SEARCHES_ALIAS}`);
    cy.wait(`@${WELLS_SEARCH_ALIAS}`);
    cy.findByTestId('empty-state-container').should('not.exist');
    cy.toggleSelectAllRows('well-result-table');
    cy.openInspectView();
    cy.goToWellsInspectTab(TAB_NAMES.WELL_LOGS);
  });

  it('Should be able to navigate preview when all logs selected', () => {
    cy.log('Open well log preview');
    cy.clickButton('Preview');
    cy.wait('@measurementsDepthData');
    cy.wait('@measurementsDepthList');
    cy.wait('@ndsList');

    cy.log('verify chart column names');
    cy.findAllByText(`${GraphTrackEnum.GAMMA_RAY_AND_CALIPER}`).should(
      'be.visible'
    );
    cy.findAllByText('Resistivity').should('be.visible');

    cy.log('Close well log preview');
    cy.clickButton('OK');
  });

  it('Should be able to navigate preview when only one log selected', () => {
    cy.log('uncheck all the wells');
    cy.toggleSelectAllRows();

    cy.log('select first log');
    cy.toggleSelectNthRow(0);

    cy.log('Open well log preview');
    cy.clickButton('Preview');

    cy.log('Close well log preview');
    cy.clickButton('OK');
  });

  it('Should not be able to navigate preview when all logs unselected', () => {
    cy.log('unselect first log');
    cy.toggleSelectNthRow(0);

    cy.log('preview button should disabled');
    cy.isButtonDisabled('Preview');
  });
});
