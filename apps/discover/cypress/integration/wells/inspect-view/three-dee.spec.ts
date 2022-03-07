import { LOADING_SUB_TEXT } from '../../../../src/components/emptyState/constants';
import {
  TAB_NAMES,
  WARNING_MODAL_EXPLANATION,
  WARNING_MODAL_QUESTION,
} from '../../../../src/pages/authorized/search/well/inspect/constants';

describe('Three-dee component', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });

  const testWell = 'AUR05478256';
  const searchPhrase = 'CAN3'; // should have more than 10 wellbores

  it('should render log filter correctly', () => {
    cy.performWellsSearch({
      search: {
        query: testWell,
      },
      select: 'ALL',
    });

    cy.openInspectView(1);

    cy.goToWellsTab(TAB_NAMES.THREE_DEE);

    cy.log('checking the empty state message');
    cy.findByTestId('empty-state-container')
      .contains(LOADING_SUB_TEXT)
      .should('be.visible');

    cy.findByText('Log filter').should('be.visible');
    cy.findByText(`Well ${testWell}`).should('be.visible');

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
  });

  it('should render selected well and wellbores correctly', () => {
    cy.performWellsSearch({
      search: {
        query: testWell,
      },
      select: 'ALL',
    });

    cy.openInspectView();

    cy.goToWellsTab(TAB_NAMES.THREE_DEE);

    cy.log('expand log filter');
    cy.findAllByRole('treeitem')
      .eq(1)
      .children()
      .first()
      .children()
      .first()
      .should('be.visible')
      .click();

    cy.log('checking number of wellbores');
    cy.findAllByRole('treeitem')
      .eq(1)
      .findAllByRole('rowgroup')
      .should('have.length', 5);
  });

  it('should check actions with checkboxes', () => {
    cy.performWellsSearch({
      search: {
        query: testWell,
      },
      select: 'ALL',
    });

    cy.openInspectView();

    cy.goToWellsTab(TAB_NAMES.THREE_DEE);

    cy.log('expand log filter');
    cy.findAllByRole('treeitem')
      .eq(1)
      .children()
      .first()
      .children()
      .first()
      .should('be.visible')
      .click();

    cy.log('selecting all wellbores');
    cy.findAllByRole('treeitem')
      .eq(1)
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
    cy.findAllByRole('treeitem')
      .last()
      .children()
      .first()
      .children()
      .eq(2)
      .children()
      .first()
      .should('have.class', 'checked');
  });

  it('should pop up warning message and load multiple wells', () => {
    cy.performWellsSearch({
      search: {
        query: searchPhrase,
      },
      select: 'ALL',
    });

    cy.openInspectView(5);

    cy.goToWellsTab(TAB_NAMES.THREE_DEE);

    cy.log('checking the warning popup message and proceed');
    cy.findByText(WARNING_MODAL_EXPLANATION).should('be.visible');
    cy.findByText(WARNING_MODAL_QUESTION).should('be.visible');
    cy.findByRole('button', { name: 'Proceed' }).should('be.visible').click();

    cy.log('checking the number of rows that loaded');
    cy.findAllByRole('rowgroup').should('have.length', 7);
  });
});
