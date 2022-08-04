import { DATA_AVAILABILITY } from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../../src/pages/authorized/search/well/inspect/constants';
import { cancelFrontendMetricsRequest } from '../../../../support/interceptions';

const DATA_AVAILABILITY_TRAJECTORIES = 'Trajectories';

describe('Wells: Trajectories', () => {
  before(() => {
    cancelFrontendMetricsRequest();

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.selectCategory('Wells');
    cy.clickOnFilterCategory(DATA_AVAILABILITY);

    cy.log('Checking source values');
    cy.validateSelect(
      DATA_AVAILABILITY,
      [DATA_AVAILABILITY_TRAJECTORIES],
      DATA_AVAILABILITY_TRAJECTORIES
    );

    cy.toggleSelectNthRow(0);

    cy.openInspectView();

    cy.goToWellsInspectTab(TAB_NAMES.TRAJECTORIES);
  });

  it('verify expand chart option', () => {
    cy.log('all five chart titles should visible');
    cy.findAllByText('NS vs EW').should('be.visible');
    cy.findAllByText('TVD vs NS').should('be.visible');
    cy.findAllByText('TVD vs EW').should('be.visible');
    cy.findAllByText('TVD vs ED').should('be.visible');
    cy.findAllByText('TVD 3D view').should('be.visible');

    cy.log('click on expand graph option');
    cy.get('[data-title="Expand full-sized view"]').eq(0).click();

    cy.log('other graph titles should not visible');
    cy.findAllByText('TVD vs NS').should('not.be.visible');
    cy.findAllByText('TVD vs EW').should('not.be.visible');
    cy.findAllByText('TVD vs ED').should('not.be.visible');
    cy.findAllByText('TVD 3D view').should('not.be.visible');
  });

  it('verify zoom in, zoom out, reset options', () => {
    cy.log('click on zoom out button');
    cy.get('[data-title="Zoom out"]').eq(5).click();

    cy.log('click on reset button');
    cy.get('[data-title="Reset axes"]').eq(5).click();

    cy.log('click on zoom in button');
    cy.get('[data-title="Zoom in"]').eq(5).click();

    cy.log('click again on reset button');
    cy.get('[data-title="Reset axes"]').eq(5).click();
  });

  it('verify pan, autoscale, zoom, download options', () => {
    cy.log('click on Pan option');
    cy.get('[data-title="Pan"]').eq(6).click();

    cy.get('[class="nsewdrag drag"]')
      .eq(5)
      .trigger('mousedown', { which: 1 })
      .trigger('mousemove', { clientX: 200, force: true })
      .trigger('mouseup', { force: true });

    cy.log('click on autoscale button');
    cy.get('[data-title="Autoscale"]').eq(5).click();

    cy.log('click on zoom button');
    cy.get('[data-title="Zoom"]').eq(6).click();

    cy.log('click on download button');
    cy.get('[data-title="Download plot as a png"]').eq(6).click();
  });

  it('verify collapsed full view option', () => {
    cy.log('collapse full view');
    cy.get('[data-title="Collapse full-sized view"]').click();

    cy.log('other graph titles should be visible');
    cy.findAllByText('TVD vs NS').should('be.visible');
    cy.findAllByText('TVD vs EW').should('be.visible');
    cy.findAllByText('TVD vs ED').should('be.visible');
    cy.findAllByText('TVD 3D view').should('be.visible');
  });

  it('verify changing measurement unit', () => {
    cy.changeMeasurementUnit('Meter');

    cy.log('verify axis labels');
    cy.findAllByText('West East (m)').should('be.visible');
    cy.findAllByText('South North (m)').should('be.visible');

    cy.changeMeasurementUnit('Feet');

    cy.log('verify axis labels');
    cy.findAllByText('West East (ft)').should('be.visible');
    cy.findAllByText('South North (ft)').should('be.visible');
  });
});
