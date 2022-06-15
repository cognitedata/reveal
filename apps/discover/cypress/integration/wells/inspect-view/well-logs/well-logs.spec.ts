import { DATA_SOURCE } from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { WELL_SOURCE_WITH_ALL } from '../../../../support/constants';
import { TAB_NAMES } from '../../../../../src/pages/authorized/search/well/inspect/constants';
import { GraphTrackEnum } from '../../../../../src/domain/wells/measurements/constants';

describe('Wells: Well Logs', () => {
  before(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.selectCategory('Wells');

    cy.log('click on source filter section');
    cy.clickOnFilterCategory(DATA_SOURCE);

    cy.clickOnNthFilterWrapper(0);
    cy.validateCheck(DATA_SOURCE, [WELL_SOURCE_WITH_ALL], WELL_SOURCE_WITH_ALL);

    cy.toggleSelectAllRows();
    cy.openInspectView();
    cy.goToWellsInspectTab(TAB_NAMES.WELL_LOGS);
  });

  it('Should be able to navigate preview when all logs selected', () => {
    cy.log('Open well log preview');
    cy.clickButton('Preview');

    cy.log('verify chart column names');
    cy.findAllByText(`${GraphTrackEnum.GAMMA_RAY_AND_CALIPER}`).should(
      'be.visible'
    );
    cy.findAllByText('Resistivity').should('be.visible');

    cy.log('Close well log preview');
    cy.clickButton('OK');
  });
  it('Should be able to navigate preview when only one log selected', () => {
    cy.log('uncheck all the wells');
    cy.toggleSelectAllRows();

    cy.log('select first log');
    cy.toggleSelectNthRow(0);

    cy.log('Open well log preview');
    cy.clickButton('Preview');

    cy.log('Close well log preview');
    cy.clickButton('OK');
  });

  it('Should not be able to navigate preview when all logs unselected', () => {
    cy.log('unselect first log');
    cy.toggleSelectNthRow(0);

    cy.log('preview button should disabled');
    cy.isButtonDisabled('Preview');
  });
});
