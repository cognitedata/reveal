import { normalizeRange } from 'domain/wells/summaries/internal/transformers/normalizeRange';
import { getWellFilterFetchers } from 'domain/wells/summaries/service/network/getWellFilterFetchers';
import { toPropertyFilter } from 'domain/wells/utils/toPropertyFilter';

import { toDistanceUnitEnum } from 'utils/units/toDistanceUnitEnum';

import { ProjectConfigWellsWellCharacteristicsFilterDls } from '@cognite/discover-api-types';
import {
  AngleUnitEnum,
  DurationUnitEnum,
  WellFilter,
} from '@cognite/sdk-wells-v3';

import { FEET, UserPreferredUnit } from 'constants/units';
import { FilterIDs } from 'modules/wellSearch/constants';
import {
  NDS_RISKS,
  NPT_EVENTS,
  REGION_FIELD_BLOCK,
  WELL_CHARACTERISTICS,
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
  DATA_AVAILABILITY,
  OPERATOR,
} from 'modules/wellSearch/constantsSidebarFilters';
import {
  FilterConfig,
  FilterConfigMap,
  FilterTypes,
} from 'modules/wellSearch/types';

const wellFilterFetchers = getWellFilterFetchers();

export const filterConfigs = (
  unit = UserPreferredUnit.FEET,
  wellCharacteristicsDls?: ProjectConfigWellsWellCharacteristicsFilterDls
): FilterConfig[] => [
  {
    id: FilterIDs.DATA_SOURCE,
    name: DATA_SOURCE,
    key: 'data_source_filter',
    category: DATA_SOURCE,
    type: FilterTypes.CHECKBOXES,
    fetcher: wellFilterFetchers?.sources,
    filterParameters: (values): WellFilter => ({
      sources: values as string[],
    }),
  },
  {
    id: FilterIDs.REGION,
    category: REGION_FIELD_BLOCK,
    key: 'field_block_operator_filter.region',
    name: REGION,
    type: FilterTypes.MULTISELECT,
    fetcher: wellFilterFetchers?.regions,
    filterParameters: (values): WellFilter => ({
      region: toPropertyFilter(values as string[]),
    }),
  },
  {
    id: FilterIDs.FIELD,
    name: FIELD,
    key: 'field_block_operator_filter.field',
    category: REGION_FIELD_BLOCK,
    type: FilterTypes.CHECKBOXES,
    fetcher: wellFilterFetchers?.fields,
    filterParameters: (values): WellFilter => ({
      field: toPropertyFilter(values as string[]),
    }),
  },
  {
    id: FilterIDs.BLOCK,
    category: REGION_FIELD_BLOCK,
    key: 'field_block_operator_filter.block',
    name: 'Block',
    type: FilterTypes.CHECKBOXES,
    fetcher: wellFilterFetchers?.blocks,
    filterParameters: (values): WellFilter => ({
      block: toPropertyFilter(values as string[]),
    }),
  },
  {
    id: FilterIDs.OPERATOR,
    category: OPERATOR,
    key: 'field_block_operator_filter.operator',
    name: 'Operator',
    type: FilterTypes.MULTISELECT,
    fetcher: wellFilterFetchers?.operators,
    filterParameters: (values): WellFilter => ({
      operator: toPropertyFilter(values as string[]),
    }),
    isTextCapitalized: false,
  },
  {
    id: FilterIDs.DATA_AVAILABILITY,
    name: DATA_AVAILABILITY,
    key: 'data_availabilty',
    category: DATA_AVAILABILITY,
    type: FilterTypes.MULTISELECT,
  },
  {
    id: FilterIDs.MEASUREMENTS,
    name: 'Measurements',
    key: 'measurements_filter',
    category: DATA_AVAILABILITY,
    type: FilterTypes.MULTISELECT,
    isTextCapitalized: false,
    fetcher: wellFilterFetchers?.measurements,
    filterParameters: (values): WellFilter => ({
      depthMeasurements: {
        measurementTypes: {
          containsAny: values as string[],
        },
      },
    }),
  },
  {
    id: FilterIDs.WELL_TYPE,
    name: WELL_TYPE,
    key: 'well_characteristics_filter.well_type',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.MULTISELECT,
    fetcher: () => wellFilterFetchers?.welltypes(),
    filterParameters: (values): WellFilter => ({
      wellType: toPropertyFilter(values as string[]),
    }),
  },
  {
    id: FilterIDs.KB,
    name: `${KB_ELEVATION_TEXT} (${unit})`,
    key: 'well_characteristics_filter.kb_elevation',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: () => {
      return wellFilterFetchers
        ?.kbLimits()
        .then((response) =>
          normalizeRange([response.min, response.max], response.unit, unit)
        );
    },
    filterParameters: (values, userPreferredUnit): WellFilter => ({
      datum: {
        min: Number(values[0]),
        max: Number(values[1]),
        unit: toDistanceUnitEnum(userPreferredUnit),
      },
    }),
  },
  {
    id: FilterIDs.MD,
    name: `${MD_ELEVATION_TEXT} (${unit})`,
    key: 'well_characteristics_filter.md',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: () => {
      return wellFilterFetchers
        ?.mdLimits()
        .then((response) =>
          normalizeRange([response.min, response.max], response.unit, unit)
        );
    },
    filterParameters: (values, userPreferredUnit): WellFilter => ({
      trajectories: {
        maxMeasuredDepth: {
          min: Number(values[0]),
          max: Number(values[1]),
          unit: toDistanceUnitEnum(userPreferredUnit),
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
    fetcher: () => {
      return wellFilterFetchers
        ?.tvdLimits()
        .then((response) =>
          normalizeRange([response.min, response.max], response.unit, unit)
        );
    },
    filterParameters: (values, userPreferredUnit): WellFilter => ({
      trajectories: {
        maxTrueVerticalDepth: {
          min: Number(values[0]),
          max: Number(values[1]),
          unit: toDistanceUnitEnum(userPreferredUnit),
        },
      },
    }),
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
    fetcher: () => {
      return wellFilterFetchers
        ?.dogLegSeverityLimits()
        .then((response) =>
          normalizeRange(
            [response.min, response.max],
            response.unit.distanceUnit,
            unit
          )
        );
    },
    filterParameters: (values, userPreferredUnit): WellFilter => ({
      trajectories: {
        maxDoglegSeverity: {
          min: Number(values[0]),
          max: Number(values[1]),
          unit: {
            angleUnit: 'degree',
            distanceUnit: toDistanceUnitEnum(userPreferredUnit),
            distanceInterval:
              userPreferredUnit === FEET
                ? wellCharacteristicsDls?.feetDistanceInterval
                : wellCharacteristicsDls?.meterDistanceInterval,
          },
        },
      },
    }),
  },
  {
    id: FilterIDs.WATER_DEPTH,
    name: `${WATER_DEPTH} (${unit})`,
    key: 'well_characteristics_filter.water_depth',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: () =>
      wellFilterFetchers
        ?.waterDepthLimits()
        .then((waterDepthLimits) =>
          normalizeRange(
            [waterDepthLimits.min?.value, waterDepthLimits.max?.value],
            waterDepthLimits.min?.unit || waterDepthLimits.max?.unit,
            unit
          )
        ),
    filterParameters: (values, userPreferredUnit): WellFilter => ({
      waterDepth: {
        min: Number(values[0]),
        max: Number(values[1]),
        unit: toDistanceUnitEnum(userPreferredUnit),
      },
    }),
  },
  {
    id: FilterIDs.SPUD_DATE,
    name: SPUD_DATE,
    key: 'well_characteristics_filter.spud_date',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.DATE_RANGE,
    fetcher: wellFilterFetchers?.spudDateLimits,
    filterParameters: (values): WellFilter => ({
      spudDate: {
        min: String(values[0]),
        max: String(values[1]),
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
      trajectories: {
        maxInclination: {
          unit: AngleUnitEnum.Degree,
          min: Number(values[0]),
          max: Number(values[1]),
        },
      },
    }),
  },
  {
    id: FilterIDs.NDS_RISKS_TYPE,
    key: 'nds_filter',
    name: NDS_RISKS_TYPE,
    category: NDS_RISKS,
    type: FilterTypes.CHECKBOXES,
    fetcher: wellFilterFetchers?.ndsRiskTypes,
    filterParameters: (values): WellFilter => ({
      nds: {
        riskTypes: { containsAny: values as string[] },
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
        severities: { containsAny: values as number[] },
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
        probabilities: { containsAny: values as number[] },
      },
    }),
  },
  {
    id: FilterIDs.NPT_DURATION,
    name: `${NPT_DURATION} (hrs)`,
    key: 'npt_filter',
    category: NPT_EVENTS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: wellFilterFetchers?.nptDurations,
    filterParameters: (values): WellFilter => ({
      npt: {
        duration: {
          unit: DurationUnitEnum.Hour,
          min: Number(values[0]),
          max: Number(values[1]),
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
    fetcher: wellFilterFetchers?.nptCodes,
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
    fetcher: wellFilterFetchers?.nptCodeDetails,
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
