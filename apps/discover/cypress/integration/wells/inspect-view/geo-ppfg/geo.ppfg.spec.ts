import { PressureUnit } from '../../../../../src/constants/units';
import {
  DATA_AVAILABILITY,
  MEASUREMENTS,
} from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { COMPARE_TEXT } from '../../../../../src/pages/authorized/search/well/inspect/modules/measurements/wellCentricView/constants';
import { interceptCoreNetworkRequests } from '../../../../support/commands/helpers';
import {
  cancelFrontendMetricsRequest,
  interceptGetNptCodes,
  interceptGetNptDetailCodes,
  NPT_CODE,
  NPT_DETAIL_CODE,
  WELLS_SEARCH_ALIAS,
} from '../../../../support/interceptions';

const GEOMECHANICS_CURVE_OPTION = 'GEO_PRE_DRILL';
const PPFG_CURVE_OPTION = 'FP';
const OTHER_CURVE_OPTION = 'FIT';

describe('Wells: Geomechanics & Ppfg', () => {
  before(() => {
    cancelFrontendMetricsRequest();
    const coreRequests = interceptCoreNetworkRequests();
    cy.addWaitForWdlResources('nds/list', 'POST', 'ndsEvents');
    cy.addWaitForWdlResources('npt/list', 'POST', 'nptEvents');
    cy.addWaitForWdlResources(
      'measurements/depth/list',
      'POST',
      'measurementDepthList'
    );
    cy.addWaitForWdlResources(
      'measurements/depth/data',
      'POST',
      'measurementDepthData'
    );
    interceptGetNptCodes();
    interceptGetNptDetailCodes();

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);

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
    cy.validateSelect(
      DATA_AVAILABILITY,
      ['NDS events', 'NPT events'],
      ['NDS events', 'NPT events']
    );
    cy.wait(`@${WELLS_SEARCH_ALIAS}`);
    cy.selectFirstWellInResults();

    cy.openInspectView();
    cy.goToWellsInspectTab('Geomechanics & PPFG');
    cy.wait([
      '@measurementDepthList',
      '@measurementDepthData',
      '@ndsEvents',
      '@nptEvents',
    ]);

    cy.wait([`@${NPT_CODE}`, `@${NPT_DETAIL_CODE}`], {
      requestTimeout: 100000,
    });
  });

  it('verify well centric view filters', () => {
    cy.log('click on Geomechanics curves filter');
    const geoCurvesFilterTestId = 'geo-curves-filter';
    cy.findByTestId(geoCurvesFilterTestId).click();

    cy.log('`All` option should be checked');
    cy.findByTestId(geoCurvesFilterTestId)
      .get('[id="checkbox-option"]')
      .eq(0)
      .should('be.checked');

    cy.findByTestId(geoCurvesFilterTestId)
      .get('[id="checkbox-option"]')
      .eq(0)
      .clickCheckbox();

    cy.findByTestId(geoCurvesFilterTestId)
      .get('[id="checkbox-option"]')
      .each((checkbox) => {
        cy.wrap(checkbox).should('not.be.checked');
      });
    cy.findByTestId(geoCurvesFilterTestId).click();

    cy.findAllByTestId('legends-wrapper')
      .first()
      .click()
      .should('not.contain', 'GEO')
      .should('not.contain', 'GEO_PRE_DRILL')
      .should('not.contain', 'GEO_POST_DRILL');

    cy.findByTestId(geoCurvesFilterTestId).click();

    /**
     * There is a bug where clicking one item it's checking all the items.
     * It's probably the components fault but didn't find a lead why it happens yet.
     * */
    cy.findByTestId(geoCurvesFilterTestId)
      .findByText(GEOMECHANICS_CURVE_OPTION)
      .clickCheckbox();

    cy.log('click on show more button');
    cy.get('[aria-label="Show more"]').eq(0).click({ force: true });

    cy.findAllByTestId('legends-wrapper')
      .first()
      .should('contain', GEOMECHANICS_CURVE_OPTION);

    cy.log('click on PPFG curves filter');
    cy.findByText('PPFG curves:').click();

    cy.log('`All` option should be checked');
    cy.get('[id="checkbox-option"]')
      .eq(0)
      .should('be.checked')
      .click({ force: true });

    cy.log('select options from drop down menu');
    cy.findByText(PPFG_CURVE_OPTION).clickCheckbox();

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
    cy.findByText(OTHER_CURVE_OPTION).clickCheckbox();
  });

  it('should be able to change pressure unit', () => {
    cy.log('click on menu button');
    cy.findByTestId('measurements-unit-selector').click();

    cy.log(`default pressure unit should be ${PressureUnit.PPG}`);
    cy.contains(`Pressure (${PressureUnit.PPG})`)
      .scrollIntoView()
      .should('be.visible');

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
    cy.findAllByTestId('wellbore-details').eq(0).clickCheckbox();

    cy.log('Check bulk actions selection count');
    cy.findByText('1 wellbore selected').should('be.visible');

    cy.log('clear selection');
    cy.get('[aria-label="Clear selection"]').click();

    cy.log('select again first wellbore');
    cy.findAllByTestId('wellbore-details').eq(0).clickCheckbox();

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
    cy.get('[aria-label="Zoom in"]').eq(0).click({ force: true });
    cy.get('[aria-label="Zoom out"]').eq(0).click({ force: true });
    cy.get('[aria-label="Refresh"]').eq(0).click();

    cy.log('filtered curves should be visible');
    cy.findByTestId(GEOMECHANICS_CURVE_OPTION)
      .scrollIntoView()
      .should('be.visible');
    cy.findByTestId(PPFG_CURVE_OPTION).scrollIntoView().should('be.visible');
    cy.findByTestId(OTHER_CURVE_OPTION).scrollIntoView().should('be.visible');
  });
});
