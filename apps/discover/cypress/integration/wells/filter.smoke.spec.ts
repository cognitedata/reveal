import {
  REGION_FIELD_BLOCK,
  DATA_AVAILABILITY,
  MEASUREMENTS,
  NDS_RISKS,
  WELLBORE_CHARACTERISTICS,
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
import { interceptCoreNetworkRequests } from '../../support/commands/helpers';
import { WELLS_SEARCH_ALIAS } from '../../support/interceptions';
import { SOURCE_FILTER } from '../../support/selectors/wells.selectors';

const DATA_AVAILABILITY_SELECT = 'Trajectories';
const MEASUREMENT_SELECT = 'salinity';
const NPT_CODE_SELECT = 'CEMT';
const NPT_DETAILS_CODE_SELECT = 'BARR';
const SEARCH_QUERY = 'Discover';

const KEYSTROKE_DELAY = 10;

const checkRequestContainsFilter = (expectedFilter: unknown) => {
  cy.wait(`@${WELLS_SEARCH_ALIAS}`)
    .its('request.body.filter')
    .should((filter) => {
      return assert.deepNestedInclude(filter, expectedFilter);
    });
};

const checkTVDFilter = () => {
  cy.wait(`@${WELLS_SEARCH_ALIAS}`)
    .its('request.body.filter')
    .should((body) => {
      assert.nestedProperty(body, 'trajectories.maxTrueVerticalDepth');
      assert.nestedProperty(body, 'trajectories.maxTrueVerticalDepth.min');
      assert.nestedProperty(body, 'trajectories.maxTrueVerticalDepth.max');
      assert.nestedProperty(body, 'trajectories.maxTrueVerticalDepth.unit');
    });
};

const checkDogledFilter = () => {
  cy.wait(`@${WELLS_SEARCH_ALIAS}`)
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
  cy.wait(`@${WELLS_SEARCH_ALIAS}`)
    .its('request.body.filter')
    .should((body) => {
      const expected = {
        min: 20,
        max: 69.23,
        unit: 'degree',
      };

      assert.deepEqual(body.trajectories.maxInclination, expected);
    });
};

const checkSpudDateFilter = () => {
  cy.wait(`@${WELLS_SEARCH_ALIAS}`)
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
    const coreRequests = interceptCoreNetworkRequests();

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);
    cy.selectCategory('Wells');
  });

  // TODO(PP-3315) Fix flaky test
  it.skip(`Should display wells sidebar filters: ${REGION_FIELD_BLOCK}`, () => {
    cy.clickOnFilterCategory(DATA_SOURCE);

    cy.log('Checking source values');
    cy.validateSelect(DATA_SOURCE, [SOURCE_FILTER], SOURCE_FILTER);
    checkRequestContainsFilter({ sources: [SOURCE_FILTER] });

    cy.log('Checking visibility of selected source');
    cy.findAllByTestId('filter-tag')
      .contains(`${DATA_SOURCE}: ${SOURCE_FILTER}`)
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
      trajectories: {
        exists: true,
      },
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

  // TODO(PP-3316) Fix flaky test
  it.skip(`Should display wells sidebar filters: ${WELLBORE_CHARACTERISTICS}`, () => {
    cy.log(`Expand ${WELLBORE_CHARACTERISTICS} filter`);
    cy.clickOnFilterCategory(WELLBORE_CHARACTERISTICS);

    cy.validateSelect(WELL_TYPE, ['Shallow'], 'Shallow');

    checkRequestContainsFilter({
      wellType: {
        isSet: true,
        oneOf: ['Shallow'],
      },
    });

    cy.log(`Checking visibility of ${WELLBORE_CHARACTERISTICS} filters`);
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
      .type('{rightarrow}{rightarrow}', { delay: KEYSTROKE_DELAY });

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
      .type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}', {
        delay: KEYSTROKE_DELAY,
      });

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
      .type('{leftArrow}{leftArrow}', { delay: KEYSTROKE_DELAY });

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

    // can't use year/month as we get range from backend spud date which might not contain latest dates.
    // hence, using the safest class available from cogs.
    cy.get('.rdrYearPicker')
      .should('exist')
      .find('select')
      .should('exist')
      .select('2021');
    cy.get('.rdrMonthPicker')
      .should('exist')
      .find('select')
      .should('exist')
      .select('July');
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
      .type('{selectAll}20{enter}');

    checkMaxInclination();

    cy.clickOnFilterCategory(WELLBORE_CHARACTERISTICS);
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
      .clickCheckbox();

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
      .clickCheckbox();

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
      .scrollIntoView({ duration: 300 })
      .as('nptDurationFilter')
      .contains(NPT_DURATION);

    cy.get('@nptDurationFilter')
      .findAllByRole('slider')
      .first()
      .should('be.visible')
      .click()
      .should('be.visible')
      .type('{rightarrow}{rightarrow}', {
        force: true,
        delay: KEYSTROKE_DELAY,
      });

    checkRequestContainsFilter({
      npt: {
        duration: {
          min: 2,
          max: 10,
          unit: 'hour',
        },
        exists: true,
      },
    });

    cy.log(`Check visibility and expand ${NPT_CODE} filter`);
    cy.validateSelect(NPT_CODE, [NPT_CODE_SELECT], NPT_CODE_SELECT);
    checkRequestContainsFilter({
      npt: {
        duration: {
          min: 2,
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

    cy.validateSelect(
      NPT_DETAIL_CODE,
      [NPT_DETAILS_CODE_SELECT],
      NPT_DETAILS_CODE_SELECT
    );
    checkRequestContainsFilter({
      npt: {
        nptCodeDetails: {
          containsAll: [NPT_DETAILS_CODE_SELECT],
        },
        duration: {
          min: 2,
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
