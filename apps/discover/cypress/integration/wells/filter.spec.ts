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
  DATA_SOURCE,
  NDS_SEVERITY,
  NDS_PROBABILITY,
  NPT_DURATION,
} from '../../../src/modules/wellSearch/constantsSidebarFilters';
import { ISODateRegex } from '../../../src/utils/isISODateRegex';

const SELECT_TEXT = 'Select...';

const checkRequestContainsFilter = (expectedFilter: unknown) => {
  cy.wait('@searchWells')
    .its('request.body.filter')
    .should((body) => {
      return assert.deepInclude(body, expectedFilter);
    });
};

const checkSpudDateFilter = () => {
  cy.wait('@searchWells')
    .its('request.body.filter')
    .should((body) => {
      expect(body.spudDate).haveOwnProperty('min');
      expect(body.spudDate).haveOwnProperty('max');
      expect(body.spudDate.min).match(ISODateRegex);
      expect(body.spudDate.max).match(ISODateRegex);
      expect(new Date(body.spudDate.min).getFullYear()).eq(2021);
      expect(new Date(body.spudDate.max).getFullYear()).eq(2021);

      expect(new Date(body.spudDate.min).getMonth()).eq(6);
      expect(new Date(body.spudDate.max).getMonth()).eq(6);

      expect(new Date(body.spudDate.min).getDate()).eq(1);
      expect(new Date(body.spudDate.max).getDate()).eq(10);
    });
};

describe('Wells sidebar filters', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.log('Perform empty search');
    cy.performSearch('');

    cy.goToTab('Wells');
  });

  it('Should display wells sidebar filters and results properly', () => {
    cy.intercept({
      url: '**/wdl/wells/list',
      method: 'POST',
    }).as('searchWells');

    cy.clickOnFilter(DATA_SOURCE);

    cy.log('Checking source values');
    cy.contains('callisto').should('be.visible').click();
    cy.contains('volve').should('be.visible');
    checkRequestContainsFilter({ sources: ['callisto'] });

    cy.log('Checking visibility of selected source');
    cy.findAllByTestId('filter-tag')
      .contains(`${DATA_SOURCE} : callisto`)
      .as('sourec-callisto')
      .should('be.visible');

    cy.log('Minimize source section');
    cy.clickOnFilter(DATA_SOURCE);

    cy.clickOnFilter(FIELD_BLOCK_OPERATOR);

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

    checkRequestContainsFilter({
      region: {
        isSet: true,
        oneOf: ['Jovian System'],
      },
    });

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
    checkRequestContainsFilter({
      operator: {
        isSet: true,
        oneOf: ['Pretty Polly ASA'],
      },
    });

    cy.get('@field')
      .contains(SELECT_TEXT)
      .should('be.visible')
      .click({ force: true });

    cy.log('Check visibility of drop-down values');
    cy.contains('Carme').should('be.visible');
    cy.contains('Erinome').should('be.visible').click();
    checkRequestContainsFilter({
      field: {
        isSet: true,
        oneOf: ['Erinome'],
      },
    });

    /**
     * Block is not covered with test yet, missing data
     * */

    cy.log('Checking visibility of selected field');
    cy.findAllByTestId('filter-tag')
      .contains(`${FIELD} : Erinome`)
      .should('be.visible');

    cy.clickOnFilter(FIELD_BLOCK_OPERATOR);

    cy.clickOnFilter(WELL_CHARACTERISTICS);

    cy.log(
      `Check visibility and expand ${WELL_TYPE} filter inside ${WELL_CHARACTERISTICS}`
    );
    cy.findAllByTestId('filter-item-wrapper')
      .contains(WELL_TYPE)
      .should('be.visible')
      .siblings()
      .first()
      .click();

    cy.log('Checking last value of the dropdown and minimize');
    cy.contains('shallow').should('be.visible').click();
    checkRequestContainsFilter({
      wellType: {
        isSet: true,
        oneOf: ['shallow'],
      },
    });

    cy.log(`Checking visibility of ${WELL_CHARACTERISTICS} filters`);
    cy.findAllByTestId('filter-item-wrapper')
      .contains(KB_ELEVATION_TEXT)
      .as('kb-elevation')
      .scrollIntoView()
      .should('be.visible');

    // move first slider to the right 2 times
    cy.get('@kb-elevation')
      .siblings()
      .first()
      .findAllByRole('slider')
      .first()
      .click()
      .type('{rightarrow}{rightarrow}');

    checkRequestContainsFilter({
      datum: {
        min: 2,
        max: 100,
        unit: 'foot',
      },
    });

    // move second slider to the left 5 times
    cy.get('@kb-elevation')
      .siblings()
      .first()
      .findAllByRole('slider')
      .last()
      .click()
      .type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}');

    checkRequestContainsFilter({
      datum: {
        min: 2,
        max: 95,
        unit: 'foot',
      },
    });

    cy.findAllByTestId('filter-item-wrapper')
      .contains(MD_ELEVATION_TEXT)
      .scrollIntoView()
      .should('be.visible')
      .as('md-elevation');

    // move first slider to the right 1 time
    cy.get('@md-elevation')
      .siblings()
      .first()
      .findAllByRole('slider')
      .first()
      .as('firstSlider');

    cy.get('@firstSlider').click().type('{rightarrow}');

    checkRequestContainsFilter({
      trajectories: {
        maxMeasuredDepth: {
          min: 1,
          max: 50000,
          unit: 'foot',
        },
      },
    });

    cy.findAllByTestId('filter-item-wrapper')
      .contains(TVD)
      .scrollIntoView()
      .should('be.visible')
      .as('tvd');

    cy.get('@tvd')
      .siblings()
      .first()
      .findAllByRole('slider')
      .last()
      .click()
      .type('{leftArrow}{leftArrow}');
    checkRequestContainsFilter({
      trajectories: {
        maxMeasuredDepth: {
          min: 1,
          max: 50000,
          unit: 'foot',
        },
        maxTrueVerticalDepth: {
          min: 0,
          max: 49998,
          unit: 'foot',
        },
      },
    });

    cy.findAllByTestId('filter-item-wrapper')
      .contains(DOGLEG_SEVERITY)
      .scrollIntoView()
      .should('be.visible')
      .as('doglegSeverity');

    cy.get('@doglegSeverity')
      .siblings()
      .first()
      .findAllByRole('slider')
      .first()
      .click()
      .type('{rightarrow}');

    checkRequestContainsFilter({
      trajectories: {
        maxMeasuredDepth: {
          min: 1,
          max: 50000,
          unit: 'foot',
        },
        maxTrueVerticalDepth: {
          min: 0,
          max: 49998,
          unit: 'foot',
        },
        maxDoglegSeverity: {
          min: 1,
          max: 100,
          unit: {
            angleUnit: 'degree',
            distanceUnit: 'foot',
          },
        },
      },
    });

    cy.findAllByTestId('filter-item-wrapper')
      .contains(DOGLEG_SEVERITY)
      .siblings()
      .last()
      .findByTestId('to')
      .type('{selectAll}50{enter}');
    checkRequestContainsFilter({
      trajectories: {
        maxMeasuredDepth: {
          min: 1,
          max: 50000,
          unit: 'foot',
        },
        maxTrueVerticalDepth: {
          min: 0,
          max: 49998,
          unit: 'foot',
        },
        maxDoglegSeverity: {
          min: 1,
          max: 50,
          unit: {
            angleUnit: 'degree',
            distanceUnit: 'foot',
          },
        },
      },
    });

    cy.findAllByTestId('filter-item-wrapper')
      .contains(WATER_DEPTH)
      .as('water-depth');

    cy.get('@water-depth')
      .siblings()
      .last()
      .findByTestId('from')
      .type('{backspace}{backspace}{backspace}950{enter}');

    checkRequestContainsFilter({
      waterDepth: {
        min: 9500,
        max: 9843,
        unit: 'foot',
      },
    });

    cy.findAllByTestId('filter-item-wrapper')
      .contains(SPUD_DATE)
      .as('spudDate');

    cy.get('@spudDate')
      .siblings()
      .first()
      .findByPlaceholderText('From')
      .click();

    const currentMonth = new Date().toLocaleString('default', {
      month: 'long',
    });
    const currentYear = new Date().getFullYear();

    cy.findByDisplayValue(currentYear).should('exist').select('2021');
    cy.findByDisplayValue(currentMonth).should('exist').select('July');
    // accessing by class is wrong, but there was no other option in this case, until COGS provides a better accessor
    cy.get('.rdrDayNumber').contains('1').click();
    cy.get('.rdrDayNumber').contains('10').click();
    cy.findByRole('button', { name: 'Apply' }).click();
    checkSpudDateFilter();

    cy.findAllByTestId('filter-item-wrapper')
      .contains(MAXIMUM_INCLINATION_ANGLE)
      .siblings()
      .last()
      .findByTestId('from')
      .type('100{enter}');

    checkRequestContainsFilter({
      trajectories: {
        maxMeasuredDepth: {
          min: 1,
          max: 50000,
          unit: 'foot',
        },
        maxTrueVerticalDepth: {
          min: 0,
          max: 49998,
          unit: 'foot',
        },
        maxDoglegSeverity: {
          min: 1,
          max: 50,
          unit: {
            angleUnit: 'degree',
            distanceUnit: 'foot',
          },
        },
        maxInclination: {
          min: 100,
          max: 180,
          unit: 'degree',
        },
      },
    });

    cy.clickOnFilter(WELL_CHARACTERISTICS);
    cy.clickOnFilter(MEASUREMENTS);

    cy.log('Check visibility of last value in measurement drop-down');
    cy.findByTestId('Measurements').findByText(SELECT_TEXT).click();
    cy.contains('salinity').scrollIntoView().should('be.visible').click();
    checkRequestContainsFilter({
      depthMeasurements: {
        containsAny: [
          {
            measurementType: 'salinity',
          },
        ],
      },
    });
    cy.log(`Minimize ${MEASUREMENTS} filter`);
    // cy.findAllByTestId('filter-item-wrapper').eq(13).click();
    cy.clickOnFilter(MEASUREMENTS);

    cy.clickOnFilter(NDS_RISKS);

    cy.log(`Check visibility and expand ${NDS_RISKS_TYPE}`);
    cy.findByTestId(NDS_RISKS)
      .findAllByTestId('filter-item-wrapper')
      .as('ndsFilters')
      .first()
      .as('nds-risk')
      .contains(NDS_RISKS_TYPE)
      .should('be.visible');
    cy.get('@nds-risk').contains(SELECT_TEXT).click();
    cy.findByText('Hydraulics').click();
    checkRequestContainsFilter({
      nds: {
        exists: true,
        riskTypes: {
          containsAny: ['Hydraulics'],
        },
      },
    });

    cy.get('@ndsFilters').eq(1).contains(NDS_SEVERITY);
    cy.get('@ndsFilters')
      .eq(1)
      .findAllByTestId('filter-checkbox-label')
      .eq(2)
      .click();

    checkRequestContainsFilter({
      nds: {
        exists: true,
        riskTypes: {
          containsAny: ['Hydraulics'],
        },
        severities: {
          containsAny: [2],
        },
      },
    });

    cy.get('@ndsFilters').eq(2).contains(NDS_PROBABILITY);
    cy.get('@ndsFilters')
      .eq(2)
      .findAllByTestId('filter-checkbox-label')
      .last()
      .click();

    checkRequestContainsFilter({
      nds: {
        exists: true,
        riskTypes: {
          containsAny: ['Hydraulics'],
        },
        severities: {
          containsAny: [2],
        },
        probabilities: {
          containsAny: [5],
        },
      },
    });

    cy.clickOnFilter(NDS_RISKS);

    cy.clickOnFilter(NPT_EVENTS);

    cy.findByTestId(NPT_EVENTS)
      .findAllByTestId('filter-item-wrapper')
      .as('nptFilters');

    cy.get('@nptFilters')
      .first()
      .as('nptDurationFilter')
      .contains(NPT_DURATION);
    cy.get('@nptDurationFilter')
      .findAllByRole('slider')
      .first()
      .click()
      .type('{rightarrow}{rightarrow}{rightarrow}{rightarrow}');
    checkRequestContainsFilter({
      npt: {
        duration: {
          min: 4,
          max: 10,
          unit: 'hour',
        },
        exists: true,
      },
    });

    cy.log(`Check visibility and expand ${NPT_CODE} filter`);
    cy.get('@nptFilters').eq(1).as('nptCode');
    cy.get('@nptCode').contains(NPT_CODE);
    cy.get('@nptCode').contains(SELECT_TEXT).click();
    cy.findByText('TESTC').click();
    checkRequestContainsFilter({
      npt: {
        duration: {
          min: 4,
          max: 10,
          unit: 'hour',
        },
        nptCodes: {
          containsAll: ['TESTC'],
        },
        exists: true,
      },
    });

    cy.log(`Check visibility and expand ${NPT_DETAIL_CODE} filter`);

    cy.get('@nptFilters').eq(2).as('nptDetailCode');
    cy.get('@nptDetailCode').contains(NPT_DETAIL_CODE);
    cy.get('@nptDetailCode').contains(SELECT_TEXT).click();
    cy.findByText('BARR').click();
    checkRequestContainsFilter({
      npt: {
        nptCodeDetails: {
          containsAll: ['BARR'],
        },
        duration: {
          min: 4,
          max: 10,
          unit: 'hour',
        },
        nptCodes: {
          containsAll: ['TESTC'],
        },
        exists: true,
      },
    });

    cy.clickOnFilter(NPT_EVENTS);

    cy.log('Clear all selected filters');
    cy.findByTestId('clear-all-btn').click();

    cy.log('Selecting filters for check filter labels');
    cy.clickOnFilter(DATA_SOURCE);
    cy.contains('callisto').should('be.visible').click();
    cy.clickOnFilter(FIELD_BLOCK_OPERATOR);
    cy.get('@region').contains(SELECT_TEXT).should('be.visible').click();
    cy.contains('Jovian System').should('be.visible').click();

    cy.log('Remove selected filter');
    cy.get('@sourec-callisto').click();
    cy.get('@sourec-callisto').should('not.exist');

    cy.log('Remove all selected filters');
    cy.findAllByTestId('clear-all-filter-button').should('be.visible').click();
    cy.findAllByTestId('filter-tag').should('not.exist');
  });
});
