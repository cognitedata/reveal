import { DATA_SOURCE } from '../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../src/pages/authorized/search/well/inspect/constants';
import { interceptCoreNetworkRequests } from '../../../support/commands/helpers';

const GOOD_CASINGS = 'pyxis';
const BAD_CASINGS = 'rigel';

describe('Wells: Casings', () => {
  beforeEach(() => {
    const coreRequests = interceptCoreNetworkRequests();
    cy.addWaitForWdlResources('sources', 'GET', 'getSources');
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.selectCategory('Wells');
    cy.wait('@getSources');
    cy.wait(coreRequests);
  });

  it('allows us to inspect bad casings for wellbores', () => {
    // inspect bad casings
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_SOURCE,
            subCategory: DATA_SOURCE,
            value: {
              name: BAD_CASINGS,
              type: 'select',
            },
          },
        ],
      },
    });

    cy.selectFirstWellInResults();
    cy.openInspectView();
    cy.goToWellsInspectTab(TAB_NAMES.CASINGS);

    cy.log('Inspect casings results');
    cy.get('[data-testid="depth-indicator"]').should('exist');
  });

  it('allows us to inspect good casings for wellbores', () => {
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_SOURCE,
            subCategory: DATA_SOURCE,
            value: {
              name: GOOD_CASINGS,
              type: 'select',
            },
          },
        ],
      },
    });

    // inspect good casings
    cy.validateSelect(DATA_SOURCE, [GOOD_CASINGS], GOOD_CASINGS);
    cy.goToTab('Wells');

    cy.findByTestId('well-result-table')
      .findAllByTestId('table-row')
      .first()
      .children()
      .first()
      .click();

    cy.openInspectView();
    cy.goToWellsInspectTab(TAB_NAMES.CASINGS);

    cy.log('Inspect casings results');
    cy.get('[data-testid="depth-indicator"]').should('exist');
  });
});
