import { DATA_SOURCE } from '../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../src/pages/authorized/search/well/inspect/constants';
import { interceptCoreNetworkRequests } from '../../../support/commands/helpers';
import { WELLS_SEARCH_ALIAS } from '../../../support/interceptions';
import { NPT_EVENTS_SOURCE } from '../../../support/selectors/wells.selectors';

describe('Wells: NPT Events', () => {
  beforeEach(() => {
    const coreRequests = interceptCoreNetworkRequests();
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);

    cy.selectCategory('Wells');
  });

  it('allow us to see NPT data in different views', () => {
    cy.clickOnFilterCategory(DATA_SOURCE);
    cy.validateSelect(DATA_SOURCE, [NPT_EVENTS_SOURCE], NPT_EVENTS_SOURCE);

    cy.wait(`@${WELLS_SEARCH_ALIAS}`);
    cy.toggleSelectAllRows('well-result-table');
    cy.openInspectView(2);

    cy.goToWellsInspectTab(TAB_NAMES.NPT_EVENTS);

    cy.log('Graph should be the default selected view');

    // NOTE: this long timeout here is an exception because of the long loading time for NPT Events should be removed in future
    cy.findByTestId('npt-events-graph', { timeout: 200000 }).should(
      'be.visible'
    );

    cy.log('Switch to table view');
    cy.findByTestId('multi-state-toggle').contains('Table').click();
    cy.log('Check that we have filters');
    cy.findByTestId('search-box-input').should('be.visible');
    cy.contains('NPT Duration (hrs)').should('be.visible');
    cy.contains('NPT Code').should('be.visible');
    cy.contains('NPT Detail Code').should('be.visible');

    cy.log('Switch back to graph view');
    cy.findByTestId('multi-state-toggle').contains('Graph').click();
    cy.log('Check that we see the legend footer');
    cy.contains('NPT Codes').should('be.visible');

    cy.log('Open single wellbore view');
    cy.findAllByTestId('bar-label').first().click();
    cy.findByLabelText('previous-wellbore')
      .should('be.visible')
      .should('be.disabled');

    cy.findByLabelText('next-wellbore')
      .should('be.visible')
      .should('not.be.disabled')
      .click();
  });
});
