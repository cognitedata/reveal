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

describe('Wells: stick chart', () => {
  before(() => {
    const coreRequests = interceptCoreNetworkRequests();
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

    cy.wait('@nptList');
    cy.wait('@ndsList');
  });

  it('Should be able to navigate NDS events page', () => {
    cy.contains('Details').first().click();

    cy.log('click on NDS events');
    cy.findByRole('button', { name: 'NDS events' }).click({ force: true });

    cy.log('treemap wrapper should display');
    cy.findByTestId('treemap-wrapper').should('be.visible');

    cy.log('go back to stick chart page');
    cy.findAllByTestId('go-back-button').click({ force: true });

    cy.log('stick chart tab should visible');
    cy.findAllByRole('tab')
      .contains(TAB_NAMES.STICK_CHART)
      .should('have.attr', 'aria-selected', 'true');
  });

  it('Should be able to navigate NPT events page', () => {
    cy.contains('Details').first().click();

    cy.log('click on NDS events');
    cy.findByRole('button', { name: 'NPT events' }).click({ force: true });

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

  it(`Should be able to change ${DepthMeasurementUnit.MD} to${DepthMeasurementUnit.TVD}`, () => {
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

  it('Should be able to expand & collapse charts', () => {
    cy.log('expand trajectory graph');
    cy.get('[aria-label="Expand"]').first().click();

    cy.log('trajectory graph should visible');
    cy.findAllByText(DEFAULT_TRAJECTORY_CHART_TITLE).should('be.visible');

    cy.log('collapse trajectory graph');
    cy.get('[aria-label="Collapse"]').first().click();
    cy.findAllByText(DEFAULT_TRAJECTORY_CHART_TITLE).should('not.exist');

    cy.log('expand FIT LOT graph');
    cy.get('[aria-label="Expand"]').eq(1).click();

    cy.log('FIT LOT graph should visible');
    cy.findAllByText(FIT_LOT_CHART_TITLE).should('be.visible');

    cy.log('collapse FIT LOT graph');
    cy.get('[aria-label="Collapse"]').first().click();
    cy.findAllByText(FIT_LOT_CHART_TITLE).should('not.exist');
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
    cy.findAllByTestId('drpdown-icon').first().should('be.visible').click();

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
    cy.findAllByTestId('drpdown-icon').eq(1).should('be.visible').click();

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
