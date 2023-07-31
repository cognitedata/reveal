import { DATA_SOURCE } from '../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../src/pages/authorized/search/well/inspect/constants';
import { interceptCoreNetworkRequests } from '../../../support/commands/helpers';
import { WELLS_SEARCH_ALIAS } from '../../../support/interceptions';

describe('Wells: DigitalRocks', () => {
  before(() => {
    const coreRequests = interceptCoreNetworkRequests();
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);
  });

  it('allows us to inspect digital rocks, samples and grain partitions', () => {
    cy.selectCategory('Wells');
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_SOURCE,
            subCategory: DATA_SOURCE,
            value: {
              name: 'carina',
              type: 'select',
            },
          },
        ],
      },
    });

    cy.wait(`@${WELLS_SEARCH_ALIAS}`);
    cy.log('Inspect first well in table');
    cy.findByTestId('well-result-table')
      .findAllByTestId('table-row')
      .first()
      .children()
      .first()
      .click();

    cy.openInspectView();
    cy.goToWellsInspectTab(TAB_NAMES.DIGITAL_ROCKS);

    cy.log('Inspect digital rocks results');
    cy.findByTestId('digital-rocks-result-table')
      .findAllByTestId('table-row')
      .should('have.length', 2)
      .each((row) => row.children().first().click());

    cy.log('Inspect digital rocks samples results');
    cy.findAllByTestId('digital-rock-samples-result-table')
      .should('have.length', 2)
      .as('digitalRockSamplesTables');

    cy.get('@digitalRockSamplesTables')
      .first()
      .findAllByTestId('table-row')
      .should('have.length', 2);
    cy.get('@digitalRockSamplesTables')
      .last()
      .findAllByTestId('table-row')
      .should('have.length', 2);

    cy.log('Open grain analysis for first rocks sample');
    cy.get('@digitalRockSamplesTables')
      .first()
      .findAllByTestId('table-row')
      .first()
      .children()
      .last()
      .children()
      .first()
      .invoke('attr', 'style', 'opacity: 1')
      .findByRole('button', { name: 'Open grain analysis' })
      .click({ force: true });

    cy.findByTestId('grain-partition-chart').should('be.visible');
  });
});
