import head from 'lodash/head';
import last from 'lodash/last';
import { endOf, startOf } from 'utils/date';

import { ProjectConfigWellsWellCharacteristicsFilterDls } from '@cognite/discover-api-types';
import { MeasurementType, WellFilter } from '@cognite/sdk-wells-v2';

import { FEET, UserPrefferedUnit } from 'constants/units';
import { unitToLengthUnitEnum } from 'modules/wellSearch/sdk/utils';

import { FilterIDs } from '../constants';
import {
  NDS_RISKS,
  NPT_EVENTS,
  FIELD_BLOCK_OPERATOR,
  WELL_CHARACTERISTICS,
  MEASUREMENTS,
  DATA_SOURCE,
  FIELD,
  WELL_TYPE,
  SPUD_DATE,
  MAXIMUM_INCLINATION_ANGLE,
  NDS_RISKS_TYPE,
  NPT_CODE,
  NPT_DETAIL_CODE,
  REGION,
  KB_ELEVATION_TEXT,
  MD_ELEVATION_TEXT,
  TVD,
  DOGLEG_SEVERITY,
  WATER_DEPTH,
  NDS_SEVERITY,
  NDS_PROBABILITY,
  NPT_DURATION,
} from '../constantsSidebarFilters';
import {
  getNDSRiskTypes,
  getNPTCodes,
  getNPTDetailCodes,
  getNPTDurationLimits,
  getSources,
  getWellFilterFetchers,
  getWellsSpudDateLimits,
  getWellsWaterDepthLimits,
} from '../sdk';
import {
  FiltersOnlySupportSdkV3,
  FilterConfig,
  FilterConfigMap,
  FilterTypes,
} from '../types';
import {
  getWaterDepthLimitsInUnit,
  processSpudDateLimits,
  getRangeLimitInUnit,
} from '../utils';

const wellFilterFetchers = getWellFilterFetchers();

const DEFAULT_MIN_LIMIT = 0;
const DEFAULT_MAX_LIMIT = 0;

const getLimitRangeInUserPreferredUnit = (
  limitRange: number[],
  unit: UserPrefferedUnit
) =>
  getRangeLimitInUnit(
    head(limitRange) || DEFAULT_MIN_LIMIT,
    last(limitRange) || DEFAULT_MAX_LIMIT,
    unit
  );

export const filterConfigs = (
  unit = UserPrefferedUnit.FEET,
  wellCharacteristicsDls?: ProjectConfigWellsWellCharacteristicsFilterDls
): FilterConfig[] => [
  {
    id: FilterIDs.DATA_SOURCE,
    name: DATA_SOURCE,
    key: 'data_source_filter',
    category: DATA_SOURCE,
    type: FilterTypes.CHECKBOXES,
    fetcher: getSources,
    filterParameters: (values): WellFilter => ({
      sources: values as string[],
    }),
  },
  {
    id: FilterIDs.REGION,
    category: FIELD_BLOCK_OPERATOR,
    key: 'field_block_operator_filter.region',
    name: REGION,
    type: FilterTypes.MULTISELECT,
    fetcher: wellFilterFetchers?.regions,
    filterParameters: (values): WellFilter => ({
      regions: values as string[],
    }),
  },
  {
    id: FilterIDs.FIELD,
    name: FIELD,
    key: 'field_block_operator_filter.field',
    category: FIELD_BLOCK_OPERATOR,
    type: FilterTypes.CHECKBOXES,
    fetcher: wellFilterFetchers?.fields,
    filterParameters: (values): WellFilter => ({
      fields: values as string[],
    }),
  },
  {
    id: FilterIDs.BLOCK,
    category: FIELD_BLOCK_OPERATOR,
    key: 'field_block_operator_filter.block',
    name: 'Block',
    type: FilterTypes.CHECKBOXES,
    fetcher: wellFilterFetchers?.blocks,
    filterParameters: (values): WellFilter => ({
      blocks: values as string[],
    }),
  },
  {
    id: FilterIDs.OPERATOR,
    category: FIELD_BLOCK_OPERATOR,
    key: 'field_block_operator_filter.operator',
    name: 'Operator',
    type: FilterTypes.CHECKBOXES,
    fetcher: wellFilterFetchers?.operators,
    filterParameters: (values): WellFilter => ({
      operators: values as string[],
    }),
    isTextCapitalized: false,
  },
  {
    id: FilterIDs.WELL_TYPE,
    name: WELL_TYPE,
    key: 'well_characteristics_filter.well_type',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.MULTISELECT,
    fetcher: () =>
      // Later these will be taken from the sdk
      Promise.resolve(['exploration', 'development', 'abandoned', 'shallow']),
    filterParameters: (values): WellFilter => ({
      wellTypes: values as string[],
    }),
  },
  {
    id: FilterIDs.KB,
    name: `${KB_ELEVATION_TEXT} (${unit})`,
    key: 'well_characteristics_filter.kb_elevation',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: () =>
      wellFilterFetchers
        ?.kbLimits()
        .then((response) => getLimitRangeInUserPreferredUnit(response, unit)),
    filterParameters: (values, userPreferredUnit): FiltersOnlySupportSdkV3 => ({
      datum: {
        min: values[0] as number,
        max: values[1] as number,
        unit: unitToLengthUnitEnum(userPreferredUnit),
      },
    }),
    enableOnlySdkV3: true,
  },
  {
    id: FilterIDs.MD,
    name: `${MD_ELEVATION_TEXT} (${unit})`,
    key: 'well_characteristics_filter.md',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: () =>
      wellFilterFetchers
        ?.mdLimits()
        .then((response) => getLimitRangeInUserPreferredUnit(response, unit)),
    filterParameters: (values, userPreferredUnit): WellFilter => ({
      hasTrajectory: {
        maxMeasuredDepth: {
          min: values[0] as number,
          max: values[1] as number,
          unit: unitToLengthUnitEnum(userPreferredUnit),
        },
      },
    }),
  },
  {
    id: FilterIDs.TVD,
    name: `${TVD} (${unit})`,
    key: 'well_characteristics_filter.tvd',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: () =>
      wellFilterFetchers
        ?.tvdLimits()
        .then((response) => getLimitRangeInUserPreferredUnit(response, unit)),
    filterParameters: (values, userPreferredUnit): FiltersOnlySupportSdkV3 => ({
      trajectories: {
        maxTrueVerticalDepth: {
          min: values[0] as number,
          max: values[1] as number,
          unit: unitToLengthUnitEnum(userPreferredUnit),
        },
      },
    }),
    enableOnlySdkV3: true,
  },
  {
    id: FilterIDs.DOG_LEG_SEVERITY,
    name: `${DOGLEG_SEVERITY} (Degree/ ${
      unit === FEET
        ? wellCharacteristicsDls?.feetDistanceInterval
        : wellCharacteristicsDls?.meterDistanceInterval
    } ${unit})`,
    key: 'well_characteristics_filter.dls',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: () =>
      wellFilterFetchers
        ?.dogLegSeverityLimts()
        .then((response) => getLimitRangeInUserPreferredUnit(response, unit)),
    filterParameters: (values, userPreferredUnit): FiltersOnlySupportSdkV3 => ({
      trajectories: {
        maxDoglegSeverity: {
          min: values[0] as number,
          max: values[1] as number,
          unit: {
            angleUnit: 'degree',
            distanceUnit: unitToLengthUnitEnum(userPreferredUnit),
            distanceInterval:
              userPreferredUnit === FEET
                ? wellCharacteristicsDls?.feetDistanceInterval
                : wellCharacteristicsDls?.meterDistanceInterval,
          },
        },
      },
    }),
    enableOnlySdkV3: true,
  },
  {
    id: FilterIDs.WATER_DEPTH,
    name: `${WATER_DEPTH} (${unit})`,
    key: 'well_characteristics_filter.water_depth',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: () =>
      getWellsWaterDepthLimits()?.then((response) =>
        getWaterDepthLimitsInUnit(response, unit)
      ),
    filterParameters: (values, userPreferredUnit): WellFilter => ({
      waterDepth: {
        min: values[0] as number,
        max: values[1] as number,
        unit: unitToLengthUnitEnum(userPreferredUnit),
      },
    }),
  },
  {
    id: FilterIDs.SPUD_DATE,
    name: SPUD_DATE,
    key: 'well_characteristics_filter.spud_date',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.DATE_RANGE,
    fetcher: () => getWellsSpudDateLimits()?.then(processSpudDateLimits),
    filterParameters: (values): WellFilter => ({
      spudDate: {
        min: startOf(values[0] as Date, 'day'),
        max: endOf(values[1] as Date, 'day'),
      },
    }),
  },
  {
    id: FilterIDs.MAXIMUM_INCLINATION_ANGLE,
    name: MAXIMUM_INCLINATION_ANGLE,
    key: 'well_characteristics_filter.maximum_inclination_angle',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: () =>
      // Later these will be taken from the sdk
      Promise.resolve([0, 180]),
    filterParameters: (values): WellFilter => ({
      hasTrajectory: {
        maxInclination: {
          min: values[0] as number,
          max: values[1] as number,
        },
      },
    }),
  },
  {
    id: FilterIDs.MEASUREMENTS,
    name: '',
    key: 'measurements_filter',
    category: MEASUREMENTS,
    type: FilterTypes.MULTISELECT,
    isTextCapitalized: false,
    fetcher: wellFilterFetchers?.measurements,
    filterParameters: (values): WellFilter => ({
      hasMeasurements: {
        containsAny: (values as MeasurementType[]).map((measurementType) => ({
          measurementType,
        })),
      },
    }),
  },
  {
    id: FilterIDs.NDS_RISKS_TYPE,
    key: 'nds_filter',
    name: NDS_RISKS_TYPE,
    category: NDS_RISKS,
    type: FilterTypes.CHECKBOXES,
    fetcher: getNDSRiskTypes,
    filterParameters: (values): WellFilter => ({
      nds: {
        riskTypes: values as string[],
      },
    }),
  },
  {
    id: FilterIDs.NDS_SEVERITY,
    key: 'nds_filter',
    name: NDS_SEVERITY,
    category: NDS_RISKS,
    type: FilterTypes.CHECKBOXES,
    fetcher: () => Promise.resolve([0, 1, 2, 3, 4]),
    filterParameters: (values): WellFilter => ({
      nds: {
        severities: values as number[],
      },
    }),
  },
  {
    id: FilterIDs.NDS_PROBABILITY,
    key: 'nds_filter',
    name: NDS_PROBABILITY,
    category: NDS_RISKS,
    type: FilterTypes.CHECKBOXES,
    fetcher: () => Promise.resolve([0, 1, 2, 3, 4, 5]),
    filterParameters: (values): WellFilter => ({
      nds: {
        probabilities: values as number[],
      },
    }),
  },
  {
    id: FilterIDs.NPT_DURATION,
    name: `${NPT_DURATION} (hrs)`,
    key: 'npt_filter',
    category: NPT_EVENTS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: getNPTDurationLimits,
    filterParameters: (values): WellFilter => ({
      npt: {
        duration: {
          min: values[0] as number,
          max: values[1] as number,
        },
      },
    }),
  },
  {
    id: FilterIDs.NPT_CODE,
    name: NPT_CODE,
    key: 'npt_filter',
    category: NPT_EVENTS,
    type: FilterTypes.CHECKBOXES,
    fetcher: getNPTCodes,
    filterParameters: (values): WellFilter => ({
      npt: {
        nptCodes: {
          containsAll: values as string[],
        },
      },
    }),
  },
  {
    id: FilterIDs.NPT_DETAIL_CODE,
    name: NPT_DETAIL_CODE,
    key: 'npt_filter',
    category: NPT_EVENTS,
    type: FilterTypes.CHECKBOXES,
    fetcher: getNPTDetailCodes,
    filterParameters: (values): WellFilter => ({
      npt: {
        nptCodeDetails: {
          containsAll: values as string[],
        },
      },
    }),
  },
];

export const filterConfigsById = filterConfigs().reduce(
  (prev, current) => ({ ...prev, [current.id]: current }),
  {} as FilterConfigMap
);
