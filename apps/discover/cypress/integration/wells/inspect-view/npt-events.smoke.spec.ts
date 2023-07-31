import { DATA_SOURCE } from '../../../../src/modules/wellSearch/constantsSidebarFilters';
import {
  WellInspectViewModes,
  TAB_NAMES,
} from '../../../../src/pages/authorized/search/well/inspect/constants';
import { interceptCoreNetworkRequests } from '../../../support/commands/helpers';
import { WELLS_SEARCH_ALIAS } from '../../../support/interceptions';
import { NPT_EVENTS_SOURCE } from '../../../support/selectors/wells.selectors';

describe('Wells: NPT Events', () => {
  before(() => {
    const coreRequests = interceptCoreNetworkRequests();
    cy.addWaitForWdlResources('sources', 'GET', 'getSources');
    cy.addWaitForWdlResources('npt/list', 'POST', 'nptList');

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);

    cy.selectCategory('Wells');

    cy.wait('@getSources');
    cy.clickOnFilterCategory(DATA_SOURCE);
    cy.validateSelect(DATA_SOURCE, [NPT_EVENTS_SOURCE], NPT_EVENTS_SOURCE);

    cy.wait(`@${WELLS_SEARCH_ALIAS}`);
    cy.toggleSelectAllRows('well-result-table');
    cy.openInspectView(2);

    cy.goToWellsInspectTab(TAB_NAMES.NPT_EVENTS);
    cy.wait('@nptList');
  });

  it('should be able to inspect npt events graph', () => {
    cy.log('Graph should be the default selected view');
    cy.findByTestId('npt-events-graph').should('be.visible');

    cy.log('Check that we see the legend footer');
    cy.contains('NPT Codes').should('be.visible');

    cy.log('Open single wellbore view');
    cy.findAllByTestId('bar-label')
      .should('be.visible')
      .first()
      .should('be.visible')
      .click();

    cy.log('Previous button should be disabled');
    cy.findByLabelText('previous-wellbore')
      .should('be.visible')
      .should('be.disabled');

    cy.log('Navigate to next wellbore view');
    cy.findByLabelText('next-wellbore')
      .should('be.visible')
      .should('not.be.disabled')
      .click();
    cy.findAllByTestId('bar').should('be.visible');

    cy.goBackToInspectTab(TAB_NAMES.NPT_EVENTS);
  });

  it('should be able to inspect npt events table', () => {
    cy.switchToInspectViewMode(WellInspectViewModes.TABLE);

    cy.log('Check that we have filters');
    cy.findByTestId('search-box-input').should('be.visible');
    cy.contains('NPT Duration (hrs)').should('be.visible');
    cy.contains('NPT Code').should('be.visible');
    cy.contains('NPT Detail Code').should('be.visible');
  });

  it('should be able to switch back to graph view', () => {
    cy.switchToInspectViewMode(WellInspectViewModes.GRAPH);
    cy.findByTestId('npt-events-graph').should('be.visible');
  });
});
