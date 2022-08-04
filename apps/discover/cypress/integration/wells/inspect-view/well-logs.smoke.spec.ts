import {
  DATA_AVAILABILITY,
  MEASUREMENTS,
} from '../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../src/pages/authorized/search/well/inspect/constants';
import { cancelFrontendMetricsRequest } from '../../../support/interceptions';

describe('Wells: Well Logs', () => {
  beforeEach(() => {
    cancelFrontendMetricsRequest();

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.selectCategory('Wells');
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_AVAILABILITY,
            subCategory: MEASUREMENTS,
            value: {
              name: 'gamma ray',
              type: 'select',
            },
          },
        ],
      },
    });

    cy.selectFirstWellInResults();

    cy.openInspectView();
    cy.goToWellsInspectTab(TAB_NAMES.WELL_LOGS);
  });

  it('Should select and de-select well logs in the result table', () => {
    cy.log('Should select all logs by default');
    cy.checkIfAllRowsSelected();

    cy.log('De-select and select all logs');
    cy.toggleSelectAllRows();
    cy.checkIfAllRowsSelected(false);
    cy.toggleSelectAllRows();
    cy.checkIfAllRowsSelected();

    cy.log('De-select and select single log');
    cy.toggleSelectNthRow(0);
    cy.checkIfNthRowIsSelected(0, false);
    cy.toggleSelectNthRow(0);
    cy.checkIfNthRowIsSelected(0);
  });

  it('Should enable and disable preview button', () => {
    cy.log('Preview button should be enabled by default');
    cy.isButtonEnabled('Preview');

    cy.log('At least one log should be selected to enable the preview button');
    // De-select and select all rows.
    cy.toggleSelectAllRows();
    cy.isButtonDisabled('Preview');
    cy.toggleSelectAllRows();
    cy.isButtonEnabled('Preview');

    cy.toggleSelectAllRows();

    // Select and de-select only one row.
    cy.toggleSelectNthRow(0);
    cy.isButtonEnabled('Preview');
    cy.toggleSelectNthRow(0);
    cy.isButtonDisabled('Preview');
  });

  it('Should open and close well log preview', () => {
    cy.log('Open well log preview');
    cy.clickButton('Preview');

    cy.isButtonVisible('sequence-select-expand-button', 'data-testid');
    cy.isButtonVisible('domain-filter-expand-button', 'data-testid');
    cy.findByTestId('log-viewer-wrapper').should('be.visible');

    cy.log('Close well log preview');
    cy.clickButton('OK');

    cy.isButtonNotVisible('sequence-select-expand-button', 'data-testid');
    cy.isButtonNotVisible('domain-filter-expand-button', 'data-testid');
    cy.findByTestId('log-viewer-wrapper').should('not.be.visible');
  });
});
