import {
  DATA_AVAILABILITY,
  MEASUREMENTS,
} from '../../../../src/modules/wellSearch/constantsSidebarFilters';
import { cancelFrontendMetricsRequest } from '../../../support/interceptions';

describe('Wells: Geomechanics & Ppfg', () => {
  before(() => {
    cancelFrontendMetricsRequest();

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.log('Perform empty search');
    cy.selectCategory('Wells');

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
    cy.goToWellsInspectTab('Geomechanics & PPFG');
  });

  it('Allow user to see geomechanics and ppfg curves in well centric mode', () => {
    /**
     * Check if all wellbores in filter section is rendered in well centric view
     */
    cy.findAllByTestId('wellbore-selection-block').each(($element) => {
      cy.findAllByTestId('wellbore-descriptor').contains($element.text());
    });
  });

  it('Allow user to see geomechanics and ppfg curves in curve centric mode', () => {
    cy.findByRole('button', { name: 'Curves' }).click();

    cy.findAllByTestId('curve-centric-card-header').contains('Geomechanics');
  });
});
