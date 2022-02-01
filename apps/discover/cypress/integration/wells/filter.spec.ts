import {
  FIELD_BLOCK_OPERATOR,
  MEASUREMENTS,
  NDS_RISKS,
  WELL_CHARACTERISTICS,
  NPT_EVENTS,
  FIELD,
  WELL_TYPE,
  SPUD_DATE,
  MAXIMUM_INCLINATION_ANGLE,
  NDS_RISKS_TYPE,
  NPT_CODE,
  NPT_DETAIL_CODE,
  REGION,
  DOGLEG_SEVERITY,
  KB_ELEVATION_TEXT,
  MD_ELEVATION_TEXT,
  TVD,
  WATER_DEPTH,
} from '../../../src/modules/wellSearch/constantsSidebarFilters';

const SELECT_TEXT = 'Select...';

describe('Wells: Sidebar filters', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.log('Perform empty search');
    cy.performSearch('');

    cy.goToTab('Wells');
  });

  it('Should display wells sidebar filters and results properly', () => {
    cy.log(`Click Source filter and check`);
    cy.findByTestId('side-bar')
      .contains('Source')
      .as('source')
      .should('be.visible')
      .click();

    cy.log('Checking source values');
    cy.contains('callisto').should('be.visible').click();
    cy.contains('volve').should('be.visible');

    cy.log('Minimize source section');
    cy.get('@source').click();

    cy.log(`Expand ${FIELD_BLOCK_OPERATOR} section and check visibility`);
    cy.findByTestId('side-bar')
      .contains(FIELD_BLOCK_OPERATOR)
      .as('region-field')
      .should('be.visible')
      .click();

    cy.log('Expand region filter and check visibility');
    cy.findAllByTestId('filter-item-wrapper')
      .as('filter-items')
      .eq(1)
      .as('region')
      .contains(REGION)
      .should('be.visible');
    cy.get('@region').contains(SELECT_TEXT).should('be.visible').click();

    cy.log('Check dropdown values');
    cy.contains('Discover').should('be.visible');
    cy.contains('Jovian System').should('be.visible').click();

    cy.log('Expand `Field` section with visibility check');
    cy.get('@filter-items')
      .eq(2)
      .as('field')
      .contains(FIELD)
      .should('be.visible');

    cy.log('Check visibility of `Block` filter');
    cy.get('@filter-items').eq(3).contains('Block').should('be.visible');

    cy.log('Check visibility of `Operator` filter');
    cy.get('@filter-items').eq(4).contains('Operator').should('be.visible');

    cy.get('@filter-items')
      .eq(4)
      .contains('Pretty Polly ASA')
      .should('be.visible')
      .click();

    cy.get('@field').contains(SELECT_TEXT).should('be.visible').click();

    cy.log('Check visibility of drop-down values');
    cy.contains('Carme').should('be.visible');
    cy.contains('Erinome').should('be.visible').click();

    cy.log('Minimize section');
    cy.get('@region-field').click();

    cy.log(`Expand ${WELL_CHARACTERISTICS} filter`);
    cy.findByTestId('side-bar')
      .contains(WELL_CHARACTERISTICS)
      .as('wel-characteristics')
      .should('be.visible')
      .click();

    cy.log(
      `Check visibility and expand ${WELL_TYPE} filter inside ${WELL_CHARACTERISTICS}`
    );
    cy.findAllByTestId('filter-item-wrapper')
      .eq(5)
      .as('well-type')
      .contains(WELL_TYPE)
      .should('be.visible');
    cy.get('@well-type').contains(SELECT_TEXT).click();

    cy.log('Checking last value of the dropdown and minimize');
    cy.contains('shallow').should('be.visible');
    cy.get('@well-type').contains(SELECT_TEXT).click();

    cy.log(`Checking visibility of ${WELL_CHARACTERISTICS} filters`);
    cy.findAllByTestId('filter-item-wrapper')
      .eq(6)
      .contains(KB_ELEVATION_TEXT)
      .should('be.visible');

    cy.findAllByTestId('filter-item-wrapper')
      .eq(7)
      .as('md-elevation')
      .contains(MD_ELEVATION_TEXT)
      .should('be.visible');

    cy.findAllByTestId('filter-item-wrapper')
      .eq(8)
      .contains(TVD)
      .should('be.visible');

    cy.findAllByTestId('filter-item-wrapper')
      .eq(9)
      .contains(DOGLEG_SEVERITY)
      .should('be.visible');

    cy.findAllByTestId('filter-item-wrapper')
      .eq(10)
      .as('water-depth')
      .contains(WATER_DEPTH)
      .should('be.visible');

    cy.get('@water-depth')
      .findByTestId('from')
      .type('{backspace}{backspace}{backspace}950');

    cy.findAllByTestId('filter-item-wrapper')
      .eq(11)
      .contains(SPUD_DATE)
      .should('be.visible');

    cy.findAllByTestId('filter-item-wrapper')
      .eq(12)
      .scrollIntoView()
      .contains(MAXIMUM_INCLINATION_ANGLE)
      .should('be.visible');

    cy.log(`Minimize ${WELL_CHARACTERISTICS} filter`);
    cy.get('@wel-characteristics').click();

    cy.log(`Check visibility and expand ${MEASUREMENTS} filter`);
    cy.findByTestId('side-bar')
      .contains(MEASUREMENTS)
      .as('measurements')
      .should('be.visible')
      .click();

    cy.log('Check visibility of last value in measurement drop-down');
    cy.findAllByTestId('filter-item-wrapper').eq(13).click();
    cy.contains('salinity').scrollIntoView().should('be.visible');

    cy.log(`Minimize ${MEASUREMENTS} filter`);
    cy.findAllByTestId('filter-item-wrapper').eq(13).click();
    cy.get('@measurements').click();

    cy.log('Check visibility and expand `NDS` filter');
    cy.findByTestId('side-bar')
      .contains(NDS_RISKS)
      .as('nds')
      .should('be.visible')
      .click();

    cy.log(`Check visibility and expand ${NDS_RISKS_TYPE}`);
    cy.findAllByTestId('filter-item-wrapper')
      .eq(14)
      .as('nds-risk')
      .contains(NDS_RISKS_TYPE)
      .should('be.visible');
    cy.get('@nds-risk').contains(SELECT_TEXT).click();

    cy.log('Check visibility of last value of drop-down');
    cy.contains('Wellbore stability').scrollIntoView().should('be.visible');

    cy.log('Minimize `NDS` filter');
    cy.get('@nds').click();

    cy.log('Check visibility and expand `NPT` filter');
    cy.findByTestId('side-bar')
      .contains(NPT_EVENTS)
      .as('npt')
      .should('be.visible')
      .click();

    cy.log(`Check visibility and expand ${NPT_CODE} filter`);
    cy.findAllByTestId('filter-item-wrapper')
      .eq(18)
      .as('npt-code')
      .contains(NPT_CODE)
      .should('be.visible');
    cy.get('@npt-code').contains(SELECT_TEXT).click();

    cy.log('Scrolldown main sidebar container');

    cy.log(`Check visibility of last value of ${NPT_CODE} filter`);
    cy.contains('TESTC').scrollIntoView().should('be.visible');

    cy.log(`Minimize ${NPT_CODE} filter`);
    cy.get('@npt-code').contains(SELECT_TEXT).click();

    cy.log(`Check visibility and expand ${NPT_DETAIL_CODE} filter`);
    cy.findAllByTestId('filter-item-wrapper')
      .eq(19)
      .as('npt-detail-code')
      .contains(NPT_DETAIL_CODE)
      .should('be.visible');
    cy.get('@npt-detail-code').contains(SELECT_TEXT).click();

    cy.log('Check visibility of last value of the dropdown');
    cy.contains('XTRE').scrollIntoView().should('be.visible').click();

    cy.log('Minimize NPT filter');
    cy.get('@npt').click();

    cy.findByTestId('well-result-table')
      .findAllByTestId('table-row')
      .should('have.length', 1);
  });
});
