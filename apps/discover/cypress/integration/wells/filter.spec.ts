import {
  REGION_FIELD_BLOCK,
  DATA_AVAILABILITY,
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
  WELL_TYPE,
} from '../../../src/modules/wellSearch/constantsSidebarFilters';
import { ISODateRegex } from '../../../src/utils/isISODateRegex';
import { SOURCE_FILTER } from '../../support/selectors/wells.selectors';

const SELECT_TEXT = 'Select...';
const DATA_AVAILABILITY_SELECT = 'Trajectories';
const MEASUREMENT_SELECT = 'salinity';
const NPT_CODE_SELECT = 'CEMT';
const NPT_DETAILS_CODE_SELECT = 'BARR';
const SEARCH_QUERY = 'Discover';

const checkRequestContainsFilter = (expectedFilter: unknown) => {
  cy.wait('@searchWells')
    .its('request.body.filter')
    .should((body) => {
      return assert.deepNestedInclude(body, expectedFilter);
    });
};

const checkTVDFilter = () => {
  cy.wait('@searchWells')
    .its('request.body.filter')
    .should((body) => {
      assert.nestedProperty(body, 'trajectories.maxTrueVerticalDepth');
      assert.nestedProperty(body, 'trajectories.maxTrueVerticalDepth.min');
      assert.nestedProperty(body, 'trajectories.maxTrueVerticalDepth.max');
      assert.nestedProperty(body, 'trajectories.maxTrueVerticalDepth.unit');
    });
};

const checkDogledFilter = () => {
  cy.wait('@searchWells')
    .its('request.body.filter')
    .should((body) => {
      assert.nestedProperty(body, 'trajectories.maxDoglegSeverity');
      assert.nestedProperty(body, 'trajectories.maxDoglegSeverity.min');
      assert.nestedProperty(body, 'trajectories.maxDoglegSeverity.max');
      assert.nestedProperty(body, 'trajectories.maxDoglegSeverity.unit');
      assert.isAbove(body.trajectories.maxDoglegSeverity.min, 0);
      assert.isAbove(
        body.trajectories.maxDoglegSeverity.max,
        body.trajectories.maxDoglegSeverity.min
      );
    });
};

const checkMaxInclination = () => {
  cy.wait('@searchWells')
    .its('request.body.filter')
    .should((body) => {
      const expected = {
        min: 100,
        max: 180,
        unit: 'degree',
      };

      assert.deepEqual(body.trajectories.maxInclination, expected);
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
      expect(Date.parse(body.spudDate.min)).equal(1625097600000);
      expect(Date.parse(body.spudDate.max)).equal(1625961599999);
    });
};

describe('Wells sidebar filters', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.intercept({
      url: '**/wdl/wells/search',
      method: 'POST',
    }).as('searchWells');
    cy.selectCategory('Wells');
  });

  it(`Should display wells sidebar filters: ${REGION_FIELD_BLOCK}`, () => {
    cy.clickOnFilterCategory(DATA_SOURCE);

    cy.log('Checking source values');
    cy.validateSelect(DATA_SOURCE, [SOURCE_FILTER], SOURCE_FILTER);
    cy.contains(SOURCE_FILTER).should('be.visible').click();
    checkRequestContainsFilter({ sources: [SOURCE_FILTER] });

    cy.log('Checking visibility of selected source');
    cy.findAllByTestId('filter-tag')
      .contains(`${DATA_SOURCE} : ${SOURCE_FILTER}`)
      .as(`filter-tag:source-${SOURCE_FILTER}`)
      .should('be.visible');

    cy.log('Minimize source section');
    cy.clickOnFilterCategory(DATA_SOURCE);

    cy.log('Open REGION_FIELD_BLOCK');
    cy.clickOnFilterCategory(REGION_FIELD_BLOCK);

    cy.validateSelect(REGION, ['Discover', 'Jovian System'], 'Jovian System');
    // these are temp changed, so disabling till the new design is in place:
    // cy.validateSelect(FIELD, ['Carme', 'Erinome'], 'Erinome');
    // cy.validateSelect(BLOCK, ['', ''], '');
    cy.clickOnFilterCategory(REGION_FIELD_BLOCK);
    cy.log('Open OPERATOR');
    cy.clickOnFilterCategory(OPERATOR);

    cy.validateSelect(OPERATOR, ['Pretty Polly ASA']);
    cy.clickOnFilterCategory(OPERATOR);

    // cleanup:
    cy.log('Remove source selected filter');
    cy.get(`@filter-tag:source-${SOURCE_FILTER}`).click();
    cy.get(`@filter-tag:source-${SOURCE_FILTER}`).should('not.exist');

    cy.clearAllFilters(false);
  });

  it(`Should display wells sidebar filters: ${DATA_AVAILABILITY}`, () => {
    cy.clickOnFilterCategory(DATA_AVAILABILITY);

    cy.validateSelect(
      DATA_AVAILABILITY,
      [DATA_AVAILABILITY_SELECT],
      DATA_AVAILABILITY_SELECT
    );
    checkRequestContainsFilter({
      trajectories: {},
    });
    cy.validateSelect(MEASUREMENTS, [MEASUREMENT_SELECT], MEASUREMENT_SELECT);
    checkRequestContainsFilter({
      depthMeasurements: {
        measurementTypes: {
          containsAny: [MEASUREMENT_SELECT],
        },
      },
    });
    cy.log(`Minimize ${DATA_AVAILABILITY} filter`);
    cy.clickOnFilterCategory(DATA_AVAILABILITY);
  });

  it(`Should display wells sidebar filters: ${WELL_CHARACTERISTICS}`, () => {
    cy.log(`Expand ${WELL_CHARACTERISTICS} filter`);
    cy.clickOnFilterCategory(WELL_CHARACTERISTICS);

    cy.validateSelect(WELL_TYPE, ['Shallow'], 'Shallow');

    checkRequestContainsFilter({
      wellType: {
        isSet: true,
        oneOf: ['Shallow'],
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

    const maxMeasuredDepth = {
      min: 6237,
      max: 26251,
    };
    const datum = {
      min: 11,
      max: 332,
    };

    const maxWaterDepth = {
      min: 1,
      max: 9846,
    };

    checkRequestContainsFilter({
      datum: {
        min: datum.min,
        max: datum.max,
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
        min: datum.min,
        max: 327,
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

    cy.get('@firstSlider')
      .scrollIntoView()
      .should('be.visible')
      .click()
      .type('{rightarrow}');

    checkRequestContainsFilter({
      trajectories: {
        maxMeasuredDepth: {
          min: maxMeasuredDepth.min,
          max: maxMeasuredDepth.max,
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

    checkTVDFilter();

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

    checkDogledFilter();

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
        max: maxWaterDepth.max,
        unit: 'foot',
      },
    });

    cy.findAllByTestId('filter-item-wrapper')
      .contains(SPUD_DATE)
      .as('spudDate');

    cy.get('@spudDate').siblings().first().findAllByRole('tab').first().click();

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

    checkMaxInclination();

    cy.clickOnFilterCategory(WELL_CHARACTERISTICS);
  });

  it(`should display wells sidebar filter: ${NDS_RISKS}`, () => {
    cy.clickOnFilterCategory(NDS_RISKS);

    cy.validateSelect(NDS_RISKS_TYPE, ['Hydraulics'], 'Hydraulics');
    checkRequestContainsFilter({
      nds: {
        exists: true,
        riskTypes: {
          containsAny: ['Hydraulics'],
        },
      },
    });

    cy.findAllByTestId('filter-item-wrapper')
      .eq(1)
      .scrollIntoView()
      .contains(NDS_SEVERITY);
    cy.findAllByTestId('filter-item-wrapper')
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

    cy.findAllByTestId('filter-item-wrapper')
      .eq(2)
      .scrollIntoView()
      .contains(NDS_PROBABILITY);
    cy.findAllByTestId('filter-item-wrapper')
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
      .scrollIntoView()
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
    cy.findByTestId('clear-all-filter-button').click();

    cy.log('search result on search');
    cy.performSearch(SEARCH_QUERY);

    cy.log('check search query filter tag');
    cy.findAllByTestId('filter-tag')
      .contains(SEARCH_QUERY)
      .should('be.visible');
  });
});
