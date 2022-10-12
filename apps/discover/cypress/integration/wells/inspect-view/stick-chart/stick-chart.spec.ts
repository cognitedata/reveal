import { DepthMeasurementUnit } from '../../../../../src/constants/units';
import { DATA_AVAILABILITY } from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../../src/pages/authorized/search/well/inspect/constants';
import { EventsColumnView } from '../../../../../src/pages/authorized/search/well/inspect/modules/common/Events/types';
import { interceptCoreNetworkRequests } from '../../../../support/commands/helpers';
import { WELLS_SEARCH_ALIAS } from '../../../../support/interceptions';

const DATA_AVAILABILITY_CASINGS = 'Casings';
const NO_COLUMNS_SELECTED_TEXT = 'No columns selected';
const NO_OPTIONS_SELECTED_TEXT = 'No options selected';
const FIT_LOT_CHART_TITLE = 'Depth vs Pressure';
const SEE_GRAPH_BUTTON_TEXT = 'See graph';
const DEFAULT_TRAJECTORY_CHART_TITLE = 'TVD vs ED';
const DETAIL_PAGE_BUTTON_TEXT = 'Detail page';

const CASING_ASSEMBLY_DIAMETER_UNIT = 'in';

describe('Wells: stick chart', () => {
  before(() => {
    const coreRequests = interceptCoreNetworkRequests();
    cy.addWaitForWdlResources('casings/list', 'POST', 'casingsList');
    cy.addWaitForWdlResources('nds/list', 'POST', 'ndsList');
    cy.addWaitForWdlResources('npt/list', 'POST', 'nptList');

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);
    cy.selectCategory('Wells');
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_AVAILABILITY,
            subCategory: DATA_AVAILABILITY,
            value: {
              name: DATA_AVAILABILITY_CASINGS,
              type: 'select',
            },
          },
        ],
      },
    });

    cy.validateSelect(
      DATA_AVAILABILITY,
      ['NDS events', 'NPT events', 'Trajectories'],
      ['NDS events', 'NPT events', 'Trajectories']
    );

    cy.wait(`@${WELLS_SEARCH_ALIAS}`);

    cy.selectFirstWellInResults();

    cy.openInspectView(1);

    cy.log('navigate to stick chart tab');
    cy.goToWellsInspectTab(TAB_NAMES.STICK_CHART);

    cy.wait('@casingsList');
    cy.wait('@nptList');
    cy.wait('@ndsList');
  });

  it('Should be able to navigate to Casings details page', () => {
    cy.findAllByTestId('casings-column').first().contains('Casings').click();

    cy.log('navigate to Casings detail page');
    cy.findByRole('button', { name: DETAIL_PAGE_BUTTON_TEXT }).click({
      force: true,
    });

    cy.log('detail table should contain at least 1 casing assembly');
    cy.findByTestId('wellbore-casings-detail-view-table')
      .findAllByTestId('table-row')
      .its('length')
      .should('be.gte', 1);

    cy.log(`diameter should be displayed in: ${CASING_ASSEMBLY_DIAMETER_UNIT}`);
    cy.verifyColumnHeader(`OD (${CASING_ASSEMBLY_DIAMETER_UNIT})`);
    cy.verifyColumnHeader(`ID (${CASING_ASSEMBLY_DIAMETER_UNIT})`);

    cy.log('go back to stick chart page');
    cy.findAllByTestId('go-back-button').click({ force: true });
  });

  it('Should be able to navigate to NDS events page', () => {
    cy.findAllByTestId('ndsEvents-column')
      .first()
      .contains('NDS Events')
      .click();

    cy.log('navigate to NDS events detail page');
    cy.findByRole('button', { name: DETAIL_PAGE_BUTTON_TEXT }).click({
      force: true,
    });

    cy.log('treemap wrapper should display');
    cy.findByTestId('treemap-wrapper').should('be.visible');

    cy.log('go back to stick chart page');
    cy.findAllByTestId('go-back-button').click({ force: true });

    cy.log('stick chart tab should visible');
    cy.findAllByRole('tab')
      .contains(TAB_NAMES.STICK_CHART)
      .should('have.attr', 'aria-selected', 'true');
  });

  it('Should be able to navigate to NPT events page', () => {
    cy.findAllByTestId('nptEvents-column')
      .first()
      .contains('NPT Events')
      .click();

    cy.log('navigate to NPT events detail page');
    cy.findByRole('button', { name: DETAIL_PAGE_BUTTON_TEXT }).click({
      force: true,
    });

    cy.log('NPT days & NPT events charts titles should visible ');
    cy.findAllByText('NPT days').should('be.visible');
    cy.findAllByText('NPT events').should('be.visible');

    cy.log('go back to stick chart page');
    cy.findAllByTestId('go-back-button').click({ force: true });

    cy.log('stick chart tab should visible');
    cy.findAllByRole('tab')
      .contains(TAB_NAMES.STICK_CHART)
      .should('have.attr', 'aria-selected', 'true');
  });

  it(`Should be able to change ${DepthMeasurementUnit.MD} to ${DepthMeasurementUnit.TVD}`, () => {
    cy.log(`by default ${DepthMeasurementUnit.MD} should be selected`);
    cy.findAllByTestId('depth-column')
      .first()
      .findByTestId('column-header')
      .should('contain', DepthMeasurementUnit.MD);

    cy.findAllByTestId('chevron-down-icon').first().click();

    cy.log(`select ${DepthMeasurementUnit.TVD}`);
    cy.contains(DepthMeasurementUnit.TVD).click();

    cy.log('depth column header should changed to TVD');
    cy.findAllByTestId('depth-column')
      .first()
      .findByTestId('column-header')
      .should('contain', DepthMeasurementUnit.TVD);

    cy.log('see graph buttons should be visible');
    cy.findAllByText(SEE_GRAPH_BUTTON_TEXT).should('be.visible');
  });

  it('Should be able to expand & collapse measurements chart', () => {
    cy.findAllByTestId('measurements-column').first().as('measurementsColumn');

    cy.log('expand FIT LOT graph');
    cy.get('@measurementsColumn').findByTestId('Expand').click();

    cy.log('FIT LOT graph should visible');
    cy.findAllByText(FIT_LOT_CHART_TITLE).should('be.visible');

    cy.log('collapse FIT LOT graph');
    cy.get('@measurementsColumn').findByTestId('Collapse').click();
    cy.findAllByText(FIT_LOT_CHART_TITLE).should('not.exist');
  });

  it('Should be able to expand & collapse trajectory chart', () => {
    cy.findAllByTestId('trajectory-column').first().as('trajectoryColumn');

    cy.log('expand trajectory graph');
    cy.get('@trajectoryColumn').findByTestId('Expand').click();

    cy.log('trajectory graph should visible');
    cy.findAllByText(DEFAULT_TRAJECTORY_CHART_TITLE).should('be.visible');

    cy.log('collapse trajectory graph');
    cy.get('@trajectoryColumn').findByTestId('Collapse').click();
    cy.findAllByText(DEFAULT_TRAJECTORY_CHART_TITLE).should('not.exist');
  });

  it('Should be able to change npt events column view', () => {
    cy.log(
      `default selected npt events view should be ${EventsColumnView.Cluster} view`
    );
    cy.findAllByTestId('nptEvents-column')
      .first()
      .findAllByTestId('npt-event-count-badge')
      .should('be.visible');

    cy.log('select scatter view');
    cy.findAllByTestId('nptEvents-column')
      .findAllByTestId('chevron-down-icon')
      .first()
      .should('be.visible')
      .click();

    cy.contains(EventsColumnView.Scatter).click();

    cy.log('npt count badge should be disappeared');
    cy.findAllByTestId('nptEvents-column')
      .first()
      .findAllByTestId('npt-event-count-badge')
      .should('not.exist');
  });

  it('Should be able to change nds events column view', () => {
    cy.log(
      `default selected nds events view should be ${EventsColumnView.Cluster} view`
    );
    cy.findAllByTestId('ndsEvents-column')
      .first()
      .findAllByTestId('nds-event-count-badge')
      .should('be.visible');

    cy.log('select scatter view');
    cy.findAllByTestId('ndsEvents-column')
      .findAllByTestId('chevron-down-icon')
      .first()
      .should('be.visible')
      .click();

    cy.contains(EventsColumnView.Scatter).click();

    cy.log('npt count badge should be disappeared');
    cy.findAllByTestId('ndsEvents-column')
      .first()
      .findAllByTestId('nds-event-count-badge')
      .should('not.exist');
  });

  it('verify filter by npt events', () => {
    cy.log(`click on NPT events filter icon`);
    cy.findByTestId('npt-filter')
      .findByTestId('drpdown-icon')
      .should('be.visible')
      .click();

    cy.log('uncheck all options from the dropdown');
    cy.get('[id="All"]').click();

    cy.log('no option selected message should display on npt events column');
    cy.findAllByTestId('nptEvents-column')
      .findByText(NO_OPTIONS_SELECTED_TEXT)
      .should('be.visible');

    cy.log('select first option from the dropdown');
    cy.findAllByTestId('option').first().should('be.visible').click();

    cy.log('no option selected message should disappeared');
    cy.findAllByTestId('nptEvents-column')
      .findByText(NO_OPTIONS_SELECTED_TEXT)
      .should('not.exist');
  });

  it('verify filter by nds events', () => {
    cy.log(`click on nds events filter icon`);
    cy.findByTestId('nds-filter')
      .findByTestId('drpdown-icon')
      .should('be.visible')
      .click();

    cy.log('uncheck all options from the dropdown');
    cy.get('[id="All"]').eq(1).click();

    cy.log('no option selected message should display on nds events column');
    cy.findAllByTestId('ndsEvents-column')
      .findByText(NO_OPTIONS_SELECTED_TEXT)
      .should('be.visible');

    cy.log('select options from the dropdown');
    cy.findAllByTestId('option').first().siblings().click({ multiple: true });

    cy.log('no option selected message should disappeared');
    cy.findAllByTestId('ndsEvents-column')
      .findByText(NO_OPTIONS_SELECTED_TEXT)
      .should('not.exist');
  });

  it('Should be able to hide columns', () => {
    cy.log('unchecked formation column');
    cy.get('[name="Formation"]').click();

    cy.log('formation column should hide');
    cy.findAllByTestId('formation-column').should('not.be.visible');

    cy.log('unchecked casings column');
    cy.get('[name="Casings"]').click();

    cy.log('casings column should hide');
    cy.findAllByTestId('casings-column').should('not.be.visible');

    cy.log('unchecked NPT column');
    cy.get('[name="NPT"]').click();

    cy.log('NPT column should hide');
    cy.findAllByTestId('nptEvents-column').should('not.be.visible');

    cy.log('unchecked NDS column');
    cy.get('[name="NDS"]').click();

    cy.log('NDS column should hide');
    cy.findAllByTestId('ndsEvents-column').should('not.be.visible');

    cy.log('unchecked trajectory column');
    cy.get('[name="Trajectory"]').click();

    cy.log('trajectory column should hide');
    cy.findAllByTestId('trajectory-column').should('not.be.visible');

    cy.log('unchecked FIT & LOT column');
    cy.get('[name="FIT and LOT"]').click();

    cy.log('empty state should visible');
    cy.findAllByTestId('empty-state-container').should('be.visible');
    cy.findAllByText(NO_COLUMNS_SELECTED_TEXT).should('be.visible');
  });
});
