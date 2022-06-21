import { STATIC_LOCATION_WELL } from '../../support/constants';

describe('Wells: Search table', () => {
  before(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });

  describe('Column Settings', () => {
    it('should show and hide columns based on the column settings and persist changes to localStorage', () => {
      const column = 'Field name';
      cy.performSearch('');
      cy.goToTab('Wells');

      cy.log(`Check that the ${column} column is not visible initially`);
      cy.findByTestId('table-header-row')
        .findByText(column)
        .should('not.exist');

      cy.log(`Enable the ${column} column from column settings`);
      cy.findByTestId('organize-columns').click();
      cy.findByTitle(column).click({ force: true });

      cy.log(`Check that the ${column} column is visible`);
      cy.findByTestId('table-header-row')
        .findByText(column)
        .should('exist')
        .should('be.visible');

      cy.log('Check the column is persisted and visible after reload');
      cy.reload();
      cy.performSearch('');
      cy.goToTab('Wells');
      cy.findByTestId('table-header-row')
        .findByText(column)
        .should('exist')
        .should('be.visible');
    });
  });

  describe('Selection', () => {
    it('Should select a well and remove selected selection on bulk action close', () => {
      cy.performWellsSearch({
        search: {
          query: 'Dsicover well 1',
        },
        select: { wells: ['Discover well 1'] },
      });

      cy.checkWellsBulkSelectionCount(1, 1);
      cy.clearWellsSelection();
    });

    it('Should do multiple search queries, and then deselect all wells (and wellbores)', () => {
      cy.performWellsSearch({
        search: { query: 'F-1' },
        select: { wells: ['F-1'] },
      });

      cy.findByTestId('table-bulk-actions').should('be.visible');
      cy.checkWellsBulkSelectionCount(1, 4);

      cy.performWellsSearch({
        search: {
          query: 'Dsicover well 1',
        },
        select: { wells: ['Discover well 1'] },
      });
      cy.checkWellsBulkSelectionCount(2, 5);
      cy.clearWellsSelection();
    });
  });

  describe('Map card', () => {
    it('should display the well card on the map accordingly', () => {
      cy.performWellsSearch({
        search: { query: STATIC_LOCATION_WELL },
        select: { wells: [`Well ${STATIC_LOCATION_WELL}`] },
      });

      cy.log(
        'Double clicking the well in the table should center it on the map'
      );
      cy.findByTestId('well-result-table')
        .findAllByTitle(STATIC_LOCATION_WELL)
        .first()
        .should('be.visible')
        .dblclick(); // because we close the table, the center position is not calculated correctly on the x axis

      // We need this long wait because the flyTo is inconsistent when we close the table to early :/
      cy.wait(6000);
      cy.findByText('Click to expand the map').should('be.visible').click();

      cy.log('Open well card by clicking on the well pin in the map');
      cy.findAllByRole('region').first().as('map').click(754, 512);

      cy.log('Check well card is opened on the map');
      cy.findByTestId(`well-card-${STATIC_LOCATION_WELL}`).should('be.visible');
      cy.findByTestId('title')
        .contains(STATIC_LOCATION_WELL)
        .should('be.visible');

      cy.log('Close well card');
      cy.findByTestId('preview-card-close-button').click();
    });
  });
});
