import {
  FIELD_BLOCK_OPERATOR,
  MEASUREMENTS,
  NDS_RISKS,
  WELL_CHARACTERISTICS,
  NPT_EVENTS,
  OPERATOR,
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
  NDS_PROBABILITY,
  NPT_DURATION,
  NDS_SEVERITY,
} from '../../../src/modules/wellSearch/constantsSidebarFilters';
import { ISODateRegex } from '../../../src/utils/isISODateRegex';
import { SOURCE_FILTER } from '../../support/selectors/wells.selectors';

const SELECT_TEXT = 'Select...';
const MEASUREMENT_SELECT = 'salinity';
const NPT_CODE_SELECT = 'TESTC';
const NPT_DETAILS_CODE_SELECT = 'BARR';
const SEARCH_QUERY = 'Discover';

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

    cy.intercept({
      url: '**/wdl/wells/list',
      method: 'POST',
    }).as('searchWells');
  });

  it(`Should display wells sidebar filters: ${FIELD_BLOCK_OPERATOR}`, () => {
    cy.clickOnFilterCategory(DATA_SOURCE);

    cy.log('Checking source values');
    cy.contains(SOURCE_FILTER).should('be.visible').click();
    checkRequestContainsFilter({ sources: [SOURCE_FILTER] });

    cy.log('Checking visibility of selected source');
    cy.findAllByTestId('filter-tag')
      .contains(`${DATA_SOURCE} : ${SOURCE_FILTER}`)
      .as(`filter-tag:source-${SOURCE_FILTER}`)
      .should('be.visible');

    cy.log('Minimize source section');
    cy.clickOnFilterCategory(DATA_SOURCE);

    cy.log('Open FIELD_BLOCK_OPERATOR');
    cy.clickOnFilterCategory(FIELD_BLOCK_OPERATOR);

    cy.validateSelect(REGION, ['Discover', 'Jovian System'], 'Jovian System');
    // these are temp changed, so disabling till the new design is in place:
    // cy.validateSelect(FIELD, ['Carme', 'Erinome'], 'Erinome');
    // cy.validateSelect(BLOCK, ['', ''], '');
    cy.validateSelect(OPERATOR, ['Pretty Polly ASA']);

    // cleanup:
    cy.log('Remove source selected filter');
    cy.get(`@filter-tag:source-${SOURCE_FILTER}`).click();
    cy.get(`@filter-tag:source-${SOURCE_FILTER}`).should('not.exist');

    cy.clearAllFilters(false);
  });

  it(`Should display wells sidebar filters: ${WELL_CHARACTERISTICS}`, () => {
    cy.log(`Expand ${WELL_CHARACTERISTICS} filter`);
    cy.clickOnFilterCategory(WELL_CHARACTERISTICS);

    // cy.validateSelect(WELL_TYPE, ['shallow'], 'shallow');

    // checkRequestContainsFilter({
    //   wellType: {
    //     isSet: true,
    //     oneOf: ['shallow'],
    //   },
    // });

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
      .findByTestId('To-DoglegSeverityDegree30ft')
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
      .findByTestId('From-WaterDepthft')
      .type('{selectAll}9500{enter}');

    checkRequestContainsFilter({
      waterDepth: {
        min: 9500,
        max: 9813,
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
      .findByTestId('From-MaximumInclinationAngleo')
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

    cy.clickOnFilterCategory(WELL_CHARACTERISTICS);
  });

  it(`Should display wells sidebar filters: ${MEASUREMENTS}`, () => {
    cy.clickOnFilterCategory(MEASUREMENTS);

    cy.log('Check visibility of last value in measurement drop-down');
    cy.findByText(SELECT_TEXT).click();
    cy.contains(MEASUREMENT_SELECT)
      .scrollIntoView()
      .should('be.visible')
      .click();
    checkRequestContainsFilter({
      depthMeasurements: {
        measurementTypes: {
          containsAny: [MEASUREMENT_SELECT],
        },
      },
    });
    cy.log(`Minimize ${MEASUREMENTS} filter`);
    cy.clickOnFilterCategory(MEASUREMENTS);
  });

  it(`should display wells sidebar filter: ${NDS_RISKS}`, () => {
    cy.clickOnFilterCategory(NDS_RISKS);

    cy.log(`Check visibility and expand ${NDS_RISKS_TYPE}`);
    cy.findAllByTestId('filter-item-wrapper')
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

    cy.log('Scrolldown main sidebar container');
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

    cy.clickOnFilterCategory(NDS_RISKS);
  });

  it(`should display wells sidebar filter: ${NPT_EVENTS}`, () => {
    cy.clickOnFilterCategory(NPT_EVENTS);
    cy.findAllByTestId('filter-item-wrapper').as('nptFilters');

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
    cy.findAllByTestId('filter-item-wrapper')
      .eq(1)
      .should('exist')
      .as('nptCode');
    cy.get('@nptCode').contains(NPT_CODE);
    cy.get('@nptCode').contains(SELECT_TEXT).should('be.visible').click();
    cy.findByText(NPT_CODE_SELECT).click();
    checkRequestContainsFilter({
      npt: {
        duration: {
          min: 4,
          max: 10,
          unit: 'hour',
        },
        nptCodes: {
          containsAll: [NPT_CODE_SELECT],
        },
        exists: true,
      },
    });

    cy.log(`Check visibility and expand ${NPT_DETAIL_CODE} filter`);

    cy.findAllByTestId('filter-item-wrapper').eq(2).as('nptDetailCode');
    cy.get('@nptDetailCode').contains(NPT_DETAIL_CODE);
    cy.get('@nptDetailCode').contains(SELECT_TEXT).click();
    cy.findByText(NPT_DETAILS_CODE_SELECT).click();
    checkRequestContainsFilter({
      npt: {
        nptCodeDetails: {
          containsAll: [NPT_DETAILS_CODE_SELECT],
        },
        duration: {
          min: 4,
          max: 10,
          unit: 'hour',
        },
        nptCodes: {
          containsAll: [NPT_CODE_SELECT],
        },
        exists: true,
      },
    });

    cy.clickOnFilterCategory(NPT_EVENTS);

    cy.log('Clear all selected filters');
    cy.findByTestId('clear-all-btn').click();

    cy.log('search result on search');
    cy.performSearch(SEARCH_QUERY);

    cy.log('check search query filter tag');
    cy.findAllByTestId('filter-tag')
      .contains(SEARCH_QUERY)
      .should('be.visible');
  });
});
