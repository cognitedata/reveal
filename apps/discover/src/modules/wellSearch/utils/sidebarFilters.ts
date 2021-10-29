import {
  LengthUnitEnum,
  MeasurementType,
  WellFilter,
} from '@cognite/sdk-wells-v2';

import { endOf, startOf } from '_helpers/date';
import { FEET } from 'constants/units';

import { FilterIDs } from '../constants';
import {
  NDS_RISKS,
  NPT_EVENTS,
  FIELD_BLOCK_OPERATOR,
  WELL_CHARACTERISTICS,
  MEASUREMENTS,
  DATA_SOURCE,
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
import { FilterConfig, FilterConfigMap, FilterTypes } from '../types';
import { getWaterDepthLimitsInFeet, processSpudDateLimits } from '../utils';

const wellFilterFetchers = getWellFilterFetchers();

export const filterConfigs = (unit = FEET): FilterConfig[] => [
  {
    id: FilterIDs.DATA_SOURCE,
    name: 'Source',
    key: 'data_source_filter',
    category: DATA_SOURCE,
    type: FilterTypes.CHECKBOXES,
    fetcher: getSources,
    filterParameters: (values): WellFilter => ({
      sources: values as string[],
    }),
  },
  {
    id: FilterIDs.FIELD,
    name: 'Field',
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
    name: 'Well Type',
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
    name: `KB elevation (${unit})`,
    key: 'well_characteristics_filter.kb_elevation',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
  },
  {
    id: FilterIDs.TVD,
    name: `TVD (${unit})`,
    key: 'well_characteristics_filter.tvd',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
  },
  {
    id: FilterIDs.WATER_DEPTH,
    name: `Water Depth (${unit})`,
    key: 'well_characteristics_filter.water_depth',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: () =>
      getWellsWaterDepthLimits()?.then((response) =>
        getWaterDepthLimitsInFeet(response, unit)
      ),
    filterParameters: (values): WellFilter => ({
      waterDepth: {
        min: values[0] as number,
        max: values[1] as number,
        unit: LengthUnitEnum.FOOT,
      },
    }),
  },
  {
    id: FilterIDs.SPUD_DATE,
    name: 'Spud Date',
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
    name: 'Maximum Inclination Angle (o)',
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
    name: 'NDS Risk Type',
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
    name: 'NDS Severity',
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
    name: 'NDS Probability',
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
    name: 'NPT Duration (hrs)',
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
    name: 'NPT Code',
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
    name: 'NPT Detail Code',
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
