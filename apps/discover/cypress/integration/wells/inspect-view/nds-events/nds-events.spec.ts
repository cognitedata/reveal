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
import { STATIC_WELLBORE_1 } from '../../../../support/constants';
import { WELLS_SEARCH_ALIAS } from '../../../../support/interceptions';

const DATA_AVAILABILITY_NDS = 'NDS events';
const SUB_TYPE_OPTION = 'Bit-Bit balling';
const RISK_TYPE = 'Bit';
const SUB_TYPE = 'Bit balling';
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

    cy.log('navigate to table view');
    cy.contains('Table').click();
    cy.findByTestId('nds-wells-table').should('be.visible');

    cy.log('navigate to treemap view');
    cy.contains('Treemap').click();

    cy.log('click on risk type filter');
    cy.contains(RISK_TYPE_FILTER_TITLE)
      .should('be.visible')
      .click({ force: true });

    cy.log('click on `All` option from the dropdown menu');
    cy.get(`input[id=${SELECTED_ALL_DISPLAY_VALUE}]`)
      .should('be.checked')
      .click({ force: true });

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

  it('should be able to navigate detailed view', () => {
    cy.wait('@listNds');
    cy.wait('@trajectoriesInterpolate');

    cy.log('click on table button');
    cy.contains('Table').click();

    cy.findByTitle(`${STATIC_WELLBORE_1}`).invoke(
      'attr',
      'style',
      'opacity: 1'
    );

    cy.log('click on view button');
    cy.contains('View').click({ force: true });

    cy.log('Risk type should be visible');
    cy.findAllByTestId('treemap-tile-title').should(
      'have.text',
      `${RISK_TYPE}`
    );

    cy.log('click on subtype button');
    cy.findAllByTestId('view-mode-Subtype').click();

    cy.findByText(`${SUB_TYPE}`).should('be.visible');

    cy.log('click on table button');
    cy.findAllByTestId('view-mode-Table').eq(1).click();

    cy.log('detailed view table should visible');
    cy.findAllByTestId(`nds-detailed-view-table`).should('be.visible');

    cy.log('navigate to next wellbore');
    cy.clickButton('next-wellbore', 'aria-label');

    cy.log('navigate to previous wellbore');
    cy.clickButton('previous-wellbore', 'aria-label');

    cy.log('click on go back button');
    cy.get('[aria-label="Go back"]').eq(1).click();

    cy.log('wells table should visible');
    cy.findByTestId('nds-wells-table').should('be.visible');
  });

  it('should be able to view wellbores which are categorized under `other` treemap tile', () => {
    cy.wait('@listNds');
    cy.wait('@trajectoriesInterpolate');

    cy.log('click on `other` treemap tile');
    cy.findAllByTestId('treemap-tile').last().click({ force: true });

    cy.log('wellbore table should visible');
    cy.findByTestId('nds-wellbore-table').should('be.visible');

    cy.log('scroll table and hoover on the row');
    cy.findByTestId('nds-wellbore-table').scrollTo('bottom');

    cy.findByTitle(`${STATIC_WELLBORE_1}`).invoke(
      'attr',
      'style',
      'opacity: 1'
    );

    cy.log('click on view button');
    cy.contains('View').click({ force: true });

    cy.log('treemap view should visible');
    cy.findAllByTestId(`treemap-tile`).should('be.visible');
  });
});
