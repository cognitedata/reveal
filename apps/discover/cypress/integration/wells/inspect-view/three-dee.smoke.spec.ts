import { LOADING_SUB_TEXT } from '../../../../src/components/EmptyState/constants';
import { DATA_SOURCE } from '../../../../src/modules/wellSearch/constantsSidebarFilters';
import {
  TAB_NAMES,
  WARNING_MODAL_EXPLANATION,
  WARNING_MODAL_QUESTION,
} from '../../../../src/pages/authorized/search/well/inspect/constants';
import { interceptCoreNetworkRequests } from '../../../support/commands/helpers';
import { WELL_SOURCE_WITH_ALL } from '../../../support/constants';

describe.skip('Three-dee component', () => {
  beforeEach(() => {
    const coreRequests = interceptCoreNetworkRequests();
    cy.addWaitForWdlResources('sources', 'GET', 'getSources');
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);
  });

  it('should render log filter, wells and wellbores correctly', () => {
    cy.selectCategory('Wells');
    cy.wait('@getSources');
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_SOURCE,
            subCategory: DATA_SOURCE,
            value: {
              name: 'ophiuchus',
              type: 'select',
            },
          },
          {
            category: 'Data Availability',
            subCategory: 'Data Availability',
            value: {
              name: 'NDS events',
              type: 'select',
            },
          },
        ],
      },
    });
    cy.selectFirstWellInResults();

    cy.openInspectView(1);

    cy.goToWellsInspectTab(TAB_NAMES.THREE_DEE);

    cy.log('checking the empty state message');
    cy.findByTestId('empty-state-container')
      .contains(LOADING_SUB_TEXT)
      .should('be.visible');

    cy.findByText('Log filter').should('be.visible');

    cy.log('expand log filter');
    cy.findAllByRole('treeitem')
      .first()
      .children()
      .first()
      .children()
      .first()
      .should('be.visible')
      .click();

    cy.findByText('NDS Risk Event').should('be.visible');

    // check number of wells and wellbores in list
    cy.findAllByRole('rowgroup')
      .last()
      .findAllByRole('treeitem')
      .should('have.length', 1)
      .first()
      .as('wellsTree')
      .children()
      .first()
      .children()
      .first()
      .click();

    cy.get('@wellsTree').findAllByRole('rowgroup').should('have.length', 10);

    cy.log('selecting all wellbores');
    cy.get('@wellsTree')
      .children()
      .first()
      .children()
      .eq(2)
      .children()
      .first()
      .as('selectAllWellbores')
      .should('not.have.class', 'checked')
      .click();

    cy.log('checking the checked state of checkboxes');
    cy.get('@selectAllWellbores').should('have.class', 'checked');
    cy.get('@wellsTree')
      .findAllByRole('rowgroup')
      .each((el) => {
        cy.wrap(el)
          .children()
          .first()
          .children()
          .first()
          .children()
          .eq(2)
          .children()
          .first()
          .should('have.class', 'checked');
      });
  });

  it('should pop up warning message and load multiple wells', () => {
    cy.selectCategory('Wells');
    cy.wait('@getSources');

    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_SOURCE,
            subCategory: DATA_SOURCE,
            value: {
              name: WELL_SOURCE_WITH_ALL,
              type: 'select',
            },
          },
        ],
      },
      select: 'ALL',
    });

    cy.openInspectView();

    cy.goToWellsInspectTab(TAB_NAMES.THREE_DEE);

    cy.log('checking the warning popup message and proceed');
    cy.findByText(WARNING_MODAL_EXPLANATION).should('be.visible');
    cy.findByText(WARNING_MODAL_QUESTION).should('be.visible');
    cy.findByRole('button', { name: 'Proceed' }).should('be.visible').click();

    cy.log('checking the number of rows that loaded');
    /**
     * NOTE: this long timeout here is because of the longer time 3D view could take to load
     * when many wellbores are selected.
     * That's why we show a warning also.
     */
    cy.findAllByRole('rowgroup', { timeout: 200000 }).should('be.visible');
  });
});
