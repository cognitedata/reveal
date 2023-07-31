import {
  DATA_AVAILABILITY,
  MEASUREMENTS,
} from '../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../src/pages/authorized/search/well/inspect/constants';
import { cancelFrontendMetricsRequest } from '../../../support/interceptions';

describe('Wells: Well Logs', () => {
  before(() => {
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

  it('Should select/unselect well logs, enable/disable preview button and open preview', () => {
    cy.log('Should select all logs by default');
    cy.checkIfAllRowsSelected();

    cy.log('Preview button should be enabled by default');
    cy.isButtonEnabled('Preview');

    cy.log('Unselect all rows');
    cy.toggleSelectAllRows();

    cy.log('Check preview button is disabled');
    cy.isButtonDisabled('Preview');

    cy.log('At least one log should be selected to enable the preview button');
    cy.toggleSelectNthRow(0);
    cy.checkIfNthRowIsSelected(0);
    cy.isButtonEnabled('Preview');

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
