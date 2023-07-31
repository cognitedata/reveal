import {
  DATA_AVAILABILITY,
  DATA_SOURCE,
} from '../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../src/pages/authorized/search/well/inspect/constants';
import { interceptCoreNetworkRequests } from '../../../support/commands/helpers';
import { WELLS_SEARCH_ALIAS } from '../../../support/interceptions';

const BAD_CASINGS_SOURCE = 'rigel';

describe('Wells: Stick Chart', () => {
  before(() => {
    const coreRequests = interceptCoreNetworkRequests();

    cy.addWaitForWdlResources('casings/list', 'POST', 'casingsList');
    cy.addWaitForWdlResources('nds/list', 'POST', 'ndsList');
    cy.addWaitForWdlResources('npt/list', 'POST', 'nptList');

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);
    cy.selectCategory('Wells');

    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_AVAILABILITY,
            subCategory: DATA_AVAILABILITY,
            value: {
              name: 'Casings',
              type: 'select',
            },
          },
        ],
      },
    });

    cy.validateSelect(
      DATA_AVAILABILITY,
      ['NDS events', 'NPT events', 'Trajectories'],
      ['NDS events', 'NPT events', 'Trajectories']
    );

    cy.wait(`@${WELLS_SEARCH_ALIAS}`);
    cy.selectFirstWellInResults();
    cy.openInspectView(1);
    cy.goToWellsInspectTab(TAB_NAMES.STICK_CHART);

    cy.wait('@casingsList');
    cy.wait('@nptList');
    cy.wait('@ndsList');
  });

  it('Should be able to inspect casings', () => {
    cy.log('casing depth indicators should be visible');
    cy.findAllByTestId('depth-indicator').should('be.visible');
  });
});

describe('Wells: Stick Chart: Bad casings', () => {
  before(() => {
    const coreRequests = interceptCoreNetworkRequests();

    cy.addWaitForWdlResources('sources', 'GET', 'getSources');
    cy.addWaitForWdlResources('casings/list', 'POST', 'casingsList');

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);
    cy.wait('@getSources');
    cy.selectCategory('Wells');

    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_SOURCE,
            subCategory: DATA_SOURCE,
            value: {
              name: BAD_CASINGS_SOURCE,
              type: 'select',
            },
          },
        ],
      },
    });

    cy.wait(`@${WELLS_SEARCH_ALIAS}`);
    cy.selectFirstWellInResults();
    cy.openInspectView(1);
    cy.goToWellsInspectTab(TAB_NAMES.STICK_CHART);

    cy.wait('@casingsList');
  });

  it('Should be able to inspect casings', () => {
    cy.log('casing depth indicators should be visible');
    cy.findAllByTestId('depth-indicator').should('be.visible');
  });
});
