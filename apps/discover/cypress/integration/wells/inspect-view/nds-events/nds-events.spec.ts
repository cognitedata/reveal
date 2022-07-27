import { NO_RESULTS_TEXT } from '../../../../../src/components/EmptyState/constants';
import { DATA_AVAILABILITY } from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../../src/pages/authorized/search/well/inspect/constants';
import {
  RISK_TYPE_FILTER_TITLE,
  SELECTED_ALL_DISPLAY_VALUE,
  SEVERITY_FILTER_TITLE,
  PROBABILITY_FILTER_TITLE,
} from '../../../../../src/pages/authorized/search/well/inspect/modules/ndsEvents/components/Filters/constants';
import { interceptCoreNetworkRequests } from '../../../../support/commands/helpers';
import { WELLS_SEARCH_ALIAS } from '../../../../support/interceptions';
import { STATIC_WELLBORE_1 } from '../../../../support/constants';

const DATA_AVAILABILITY_NDS = 'NDS events';
const SUB_TYPE_OPTION = 'Bit-Bit balling';
const SEVERITY_OPTION = 3;
const PROBABILITY_OPTION = 7;

describe('Wells: nds-events', () => {
  beforeEach(() => {
    cy.addWaitForWdlResources('nds/list', 'POST', 'listNds');
    cy.addWaitForWdlResources(
      'trajectories/interpolate',
      'POST',
      'trajectoriesInterpolate'
    );
    const coreRequests = interceptCoreNetworkRequests();

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);

    cy.selectCategory('Wells');
    cy.clickOnFilterCategory(DATA_AVAILABILITY);

    cy.log('Checking source values');
    cy.validateSelect(
      DATA_AVAILABILITY,
      [DATA_AVAILABILITY_NDS],
      DATA_AVAILABILITY_NDS
    );
    cy.wait(`@${WELLS_SEARCH_ALIAS}`);
    cy.toggleSelectAllRows('well-result-table');
    cy.openInspectView();
    cy.goToWellsInspectTab(TAB_NAMES.NDS_EVENTS);
    cy.wait('@listNds');
  });

  it('verify risk type, severity, probability filters', () => {
    cy.wait('@listNds');
    cy.wait('@trajectoriesInterpolate');

    cy.log('click on risk type filter');
    cy.contains(RISK_TYPE_FILTER_TITLE).click();

    cy.log('click on `All` option from the dropdown menu');
    cy.get(`input[id=${SELECTED_ALL_DISPLAY_VALUE}]`).click({ force: true });

    cy.log('no result text should display');
    cy.findAllByText(NO_RESULTS_TEXT).should('be.visible');

    cy.log(`select ${SUB_TYPE_OPTION} from dropdown menu`);
    cy.get(`input[id="${SUB_TYPE_OPTION}"]`).click({ force: true });

    cy.log('click on severity filter');
    cy.contains(SEVERITY_FILTER_TITLE).click();

    cy.log('click on `All` option from the dropdown menu');
    cy.get(`input[id='checkbox-option']`)
      .as('checkboxOption')
      .eq(0)
      .click({ force: true });

    cy.log('no result text should display');
    cy.findAllByText(NO_RESULTS_TEXT).should('be.visible');

    cy.log(`select ${SEVERITY_OPTION} from the dropdown menu`);
    cy.get(`@checkboxOption`).eq(SEVERITY_OPTION).click({ force: true });

    cy.log('click on probability filter');
    cy.contains(PROBABILITY_FILTER_TITLE).click();

    cy.log('click on `All` option from the dropdown menu');
    cy.get(`input[id='checkbox-option']`)
      .as('checkboxOption')
      .eq(0)
      .click({ force: true });

    cy.log('no result text should display');
    cy.findAllByText(NO_RESULTS_TEXT).should('be.visible');

    cy.log(`select ${PROBABILITY_OPTION} option from the dropdown menu`);
    cy.get(`@checkboxOption`).eq(PROBABILITY_OPTION).click({ force: true });

    cy.log('treemap tiles should visible');
    cy.findAllByTestId('treemap-tile')
      .its('length')
      .should('be.greaterThan', 0);

    cy.log('verify treemap tile title');
    cy.findAllByText(`${STATIC_WELLBORE_1}`).should('be.visible');
  });
});
