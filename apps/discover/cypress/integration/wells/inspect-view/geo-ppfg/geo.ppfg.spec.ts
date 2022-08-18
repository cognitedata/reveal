import { PressureUnit } from '../../../../../src/constants/units';
import {
  DATA_AVAILABILITY,
  MEASUREMENTS,
} from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { COMPARE_TEXT } from '../../../../../src/pages/authorized/search/well/inspect/modules/measurements/wellCentricView/constants';
import { cancelFrontendMetricsRequest } from '../../../../support/interceptions';

const GEOMECHANICS_CURVE_OPTION = 'GEO';
const PPFG_CURVE_OPTION = 'FP';
const OTHER_CURVE_OPTION = 'FIT';

describe('Wells: Geomechanics & Ppfg', () => {
  before(() => {
    cancelFrontendMetricsRequest();

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.log('Perform empty search');
    cy.selectCategory('Wells');

    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_AVAILABILITY,
            subCategory: MEASUREMENTS,
            value: {
              name: 'geomechanics',
              type: 'select',
            },
          },
        ],
      },
    });
    cy.validateSelect(DATA_AVAILABILITY, ['NDS events'], 'NDS events');
    cy.validateSelect(DATA_AVAILABILITY, ['NPT events'], 'NPT events');

    cy.selectFirstWellInResults();

    cy.openInspectView();
    cy.goToWellsInspectTab('Geomechanics & PPFG');
  });

  it('verify well centric view filters', () => {
    cy.log('click on Geomechanics curves filter');
    cy.findByText('Geomechanics curves:').click();

    cy.log('`All` option should be checked');
    cy.get('[id="checkbox-option"]')
      .eq(0)
      .should('be.checked')
      .click({ force: true });

    cy.log('select options from drop down menu');
    cy.findByText(GEOMECHANICS_CURVE_OPTION).click();

    cy.log('click on show more button');
    cy.get('[aria-label="Show more"]').eq(0).click({ force: true });

    cy.log('selected option should visible on legend');
    cy.contains(GEOMECHANICS_CURVE_OPTION).should('be.visible');

    cy.log('click on PPFG curves filter');
    cy.findByText('PPFG curves:').click();

    cy.log('`All` option should be checked');
    cy.get('[id="checkbox-option"]')
      .eq(0)
      .should('be.checked')
      .click({ force: true });

    cy.log('select options from drop down menu');
    cy.findByText(PPFG_CURVE_OPTION).click();

    cy.log('click on NPT filter');
    cy.findByText('NPT:').click();

    cy.log('`All` option should be checked');
    cy.get('[id="All"]').should('be.checked').click({ force: true });

    cy.log('click on NDS filter');
    cy.findByText('NDS:').click();

    cy.log('click on `Other curves` filter');
    cy.findByText('Other curves:').click();

    cy.log('`All` option should be checked');
    cy.get('[id="checkbox-option"]')
      .eq(0)
      .should('be.checked')
      .click({ force: true });

    cy.log('select options from drop down menu');
    cy.findByText(OTHER_CURVE_OPTION).click();
  });

  it('should be able to change pressure unit', () => {
    cy.log('click on menu button');
    cy.findByTestId('measurements-unit-selector').click();

    cy.log(`default pressure unit should be ${PressureUnit.PPG}`);
    cy.contains(`Pressure (${PressureUnit.PPG})`).should('be.visible');

    cy.contains('Pressure unit').click();

    cy.log(`change pressure unit to ${PressureUnit.PSI}`);
    cy.contains(PressureUnit.PSI).click();

    cy.log('x axis label should change with pressure unit');
    cy.contains(`Pressure (${PressureUnit.PSI})`).should('be.visible');

    cy.log(`change pressure unit to ${PressureUnit.SG}`);
    cy.contains(PressureUnit.SG).click();
    cy.contains(`Pressure (${PressureUnit.SG})`).should('be.visible');
  });

  it('verify zoom in, zoom out & reset buttons', () => {
    cy.log('click on zoom in button');
    cy.get('[aria-label="Zoom in"]').eq(0).click();

    cy.log('click on zoom out button');
    cy.get('[aria-label="Zoom out"]').eq(0).click();

    cy.log('click on reset button');
    cy.get('[aria-label="Refresh"]').eq(0).click();
  });

  it('verify compare view', () => {
    cy.log('select first wellbore');
    cy.findAllByTestId('wellbore-details').eq(0).click();

    cy.log('Check bulk actions selection count');
    cy.findByText('1 wellbore selected').should('be.visible');

    cy.log('clear selection');
    cy.get('[aria-label="Clear selection"]').click();

    cy.log('select again first wellbore');
    cy.findAllByTestId('wellbore-details').eq(0).click();

    cy.log(`click ${COMPARE_TEXT} button`);
    cy.contains(COMPARE_TEXT).click();

    cy.log('compare view chart should be visible');
    cy.findByTestId('compare-view-chart').should('be.visible');

    cy.log('click on go back button');
    cy.getButton('Go back', 'aria-label').eq(1).click({ force: true });
  });

  it('verify curve centric view', () => {
    cy.log('click on curve button');
    cy.findByTestId('view-mode-Curves').click();

    cy.log('curve centric view card should be visible');
    cy.findAllByTestId('curve-centric-view-card').should('be.visible');

    cy.log('verify chart options');
    cy.get('[aria-label="Zoom in"]').eq(0).click();
    cy.get('[aria-label="Zoom out"]').eq(0).click();
    cy.get('[aria-label="Refresh"]').eq(0).click();

    cy.log('filtered curves should be visible');
    cy.findByTestId(GEOMECHANICS_CURVE_OPTION).should('be.visible');
    cy.findByTestId(PPFG_CURVE_OPTION).should('be.visible');
    cy.findByTestId(OTHER_CURVE_OPTION).should('be.visible');
  });
});
