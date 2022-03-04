import {
  DATA_AVAILABILITY,
  MEASUREMENTS,
} from '../../../../src/modules/wellSearch/constantsSidebarFilters';

describe('Wells: Geomechanics & Ppfg', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.log('Perform empty search');
    cy.performSearch('');
    cy.goToTab('Wells');
  });

  it('Allow user to see geomechanics and ppfg curves in well centric mode', () => {
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_AVAILABILITY,
            subCategory: MEASUREMENTS,
            value: {
              name: 'geomechanics',
              type: 'select',
            },
          },
        ],
      },
    });

    cy.selectFirstWellInResults();

    cy.openInspectView();
    cy.goToWellsTab('Geomechanics & PPFG');

    /**
     * Check if all wellbores in filter section is rendered in well centric view
     */
    cy.findAllByTestId('wellbore-selection-block').each(($element) => {
      cy.findAllByTestId('wellbore-descriptor').contains($element.text());
    });
  });

  it('Allow user to see geomechanics and ppfg curves in curve centric mode', () => {
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_AVAILABILITY,
            subCategory: MEASUREMENTS,
            value: {
              name: 'geomechanics',
              type: 'select',
            },
          },
        ],
      },
    });

    cy.selectFirstWellInResults();

    cy.openInspectView();
    cy.goToWellsTab('Geomechanics & PPFG');

    cy.findByRole('button', { name: 'Curves' }).click();

    cy.findAllByTestId('curve-centric-card-header').contains('Geomechanics');
  });
});
