import { SOURCE_FILTER } from '../../../support/selectors/wells.selectors';
import { TAB_NAMES } from '../../../../src/pages/authorized/search/well/inspect/constants';

describe('Wells: NPT Events', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.log('Perform empty search');
    cy.performSearch('');

    cy.goToTab('Wells');
  });

  it('allow us to see NPT data in different views', () => {
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: 'Source',
            value: {
              name: SOURCE_FILTER,
              type: 'checkbox',
            },
          },
        ],
      },
      select: 'ALL',
    });

    cy.openInspectView(100);

    cy.goToWellsTab(TAB_NAMES.NPT_EVENTS);

    cy.log('Graph should be the default selected view');

    // NOTE: this long timeout here is an exception because of the long loading time for NPT Events should be removed in future
    cy.findByTestId('npt-events-graph', { timeout: 200000 }).should(
      'be.visible'
    );

    cy.log('Switch to table view');
    cy.findByTestId('graph-view-switch').contains('Table').click();
    cy.log('Check that we have filters');
    cy.findByTestId('search-box-input').should('be.visible');
    cy.contains('NPT Duration (hrs)').should('be.visible');
    cy.contains('NPT Code').should('be.visible');
    cy.contains('NPT Detail Code').should('be.visible');

    cy.log('Switch back to graph view');
    cy.findByTestId('graph-view-switch').contains('Graph').click();
    cy.log('Check that we see the legend footer');
    cy.contains('NPT Codes').should('be.visible');

    cy.log('Open single wellbore view');
    cy.findAllByTestId('bar-label').contains('Discover WB 1').click();
    cy.findByLabelText('previous-wellbore')
      .should('be.visible')
      .should('be.disabled');

    cy.findByLabelText('next-wellbore')
      .should('be.visible')
      .should('not.be.disabled')
      .click();
  });
});
