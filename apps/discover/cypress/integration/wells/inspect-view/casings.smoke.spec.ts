import { DATA_SOURCE } from '../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../src/pages/authorized/search/well/inspect/constants';

describe('Wells: Casings', () => {
  beforeEach(() => {
    cy.addWaitForWdlResources('sources', 'GET', 'getSources');
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.selectCategory('Wells');
    cy.wait('@getSources');
  });

  it('allows us to inspect bad and good casings for wellbores', () => {
    // inspect bad casings
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_SOURCE,
            subCategory: DATA_SOURCE,
            value: {
              name: 'rigel',
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

    cy.findByTestId('cognite-logo').click();

    // inspect good casings
    cy.validateSelect(DATA_SOURCE, ['pyxis'], 'pyxis');
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
