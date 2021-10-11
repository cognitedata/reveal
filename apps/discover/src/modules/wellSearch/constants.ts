import {
  LengthUnitEnum,
  MeasurementType,
  WellFilter,
} from '@cognite/sdk-wells';

import { endOf, isValidDate, startOf } from '_helpers/date';
import { FEET } from 'constants/units';

import { getEventsFilterLabels, getWellFilterLabels } from './sdk';
import { FilterConfig, FilterConfigMap, FilterTypes } from './types';
import { getWaterDepthLimitsInFeet } from './utils';

export const WELL_SEARCH_ACCESS_ERROR =
  'Your account cannot search wells, please contact support.';

export const ASSETS_GROUPED_PROPERTY = 'externalId';

export const CRS_INCONSISTENCY =
  'Inconsistency in CRS. Wells should be ingested relative to WGS84 CRS. We are working to support other CRS during the ingestion.';

export const NO_WELLS_SELECTED_ERROR_MESSAGE = `No wells are selected. At least one well has to be selected.`;

export const CONTEXTUALIZE_TEXT = 'Contextualize';

export const UNKNOWN_NPT_CODE = 'Unknown';
export const UNKNOWN_NPT_DETAIL_CODE = 'Unknown';

export const WELL_FIELDS_WITH_PRODUCTION_DATA = [
  'BYRDING',
  'DUVA',
  'FRAM',
  'FRAM H-NORD',
  'KNARR',
  'SNORRE',
  'STATFJORD ØST',
  'SYGNA',
  'TORDIS',
  'VEGA',
  'VIGDIS',
];

export const TRACK_CONFIG = [
  {
    name: 'MD', //     id: 1,
    type: 'DepthLogs',
    column: 'DEPT',
  },
  {
    name: 'TVD', //    id: 2,
    type: 'DepthLogs',
    column: 'TVD',
  },
  {
    name: 'GR', //    id: 0,
    type: 'DepthLogs',
    column: 'GR',
    domain: [0, 150],
    color: 'green',
    scale: 'linear',
    width: 3,
    trackId: 'GR',
  },
  {
    name: 'Caliper', //    id: 0,
    type: 'DepthLogs',
    column: 'CALI',
    domain: [6, 26],
    color: 'grey',
    scale: 'linear',
    width: 3,
    trackId: 'GR',
  },
  {
    name: 'RDEEP', //     id: 4,
    type: 'DepthLogs',
    column: 'RDEEP',
    domain: [0.2, 2000],
    color: 'red',
    scale: 'log',
    trackId: 'RDEEP',
  },
  {
    name: 'RMED', //    id: 4,
    type: 'DepthLogs',
    column: 'RMED',
    domain: [0.2, 2000],
    color: 'blue',
    scale: 'log',
    trackId: 'RDEEP',
  },
  {
    name: 'Density', //    id: 5,
    type: 'DepthLogs',
    column: 'RHOB',
    domain: [1.45, 2.45],
    scale: 'linear',
    color: 'grey',
    dash: [4, 4],
    width: 2.2,
    trackId: 'D&N',
  },
  {
    name: 'Neutron', //    id: 5,
    type: 'DepthLogs',
    column: 'PHIT',
    domain: [0.45, -0.15],
    scale: 'linear',
    color: 'green',
    dash: [4, 4],
    width: 2.2,
    trackId: 'D&N',
  },
  {
    name: 'MD', //    id: none,
    type: 'FormationTops',
    column: 'MD',
  },
  {
    name: 'Frm', //    id: 3,
    type: 'FormationTops',
    column: 'SURFACE',
  },
  {
    name: 'MD',
    type: 'PPFG',
    column: 'TVD',
  },
  {
    name: 'FP_COMPOSITE_HIGH',
    type: 'PPFG',
    column: 'FP_COMPOSITE_HIGH',
    domain: [0, 25],
    scale: 'linear',
    color: 'blue',
    dash: [4, 4],
    width: 2.2,
    trackId: 'PPFG',
  },
  {
    name: 'FP_COMPOSITE_LOW',
    type: 'PPFG',
    column: 'FP_COMPOSITE_LOW',
    domain: [0, 25],
    scale: 'linear',
    color: 'orange',
    dash: [4, 4],
    width: 2.2,
    trackId: 'PPFG',
  },
  {
    name: 'FP_COMPOSITE_ML',
    type: 'PPFG',
    column: 'FP_COMPOSITE_ML',
    domain: [0, 25],
    scale: 'linear',
    color: 'purple',
    dash: [4, 4],
    width: 2.2,
    trackId: 'PPFG',
  },
  {
    name: 'PNORM',
    type: 'PPFG',
    column: 'PNORM',
    domain: [0, 25],
    scale: 'linear',
    color: 'magenta',
    dash: [4, 4],
    width: 2.2,
    trackId: 'PPFG',
  },
  {
    name: 'PP_COMPOSITE_HIGH',
    type: 'PPFG',
    column: 'PP_COMPOSITE_HIGH',
    domain: [0, 25],
    scale: 'linear',
    color: 'green',
    dash: [4, 4],
    width: 2.2,
    trackId: 'PPFG',
  },
  {
    name: 'PP_COMPOSITE_LOW',
    type: 'PPFG',
    column: 'PP_COMPOSITE_LOW',
    domain: [0, 25],
    scale: 'linear',
    color: 'grey',
    dash: [4, 4],
    width: 2.2,
    trackId: 'PPFG',
  },
  {
    name: 'PP_COMPOSITE_ML',
    type: 'PPFG',
    column: 'PP_COMPOSITE_ML',
    domain: [0, 25],
    scale: 'linear',
    color: 'red',
    dash: [4, 4],
    width: 2.2,
    trackId: 'PPFG',
  },
  {
    name: 'SVERTICAL',
    type: 'PPFG',
    column: 'SVERTICAL',
    domain: [0, 25],
    scale: 'linear',
    color: 'darkgreen',
    dash: [4, 4],
    width: 2.2,
    trackId: 'PPFG',
  },
];

// Well Filters:
export const FLUIDS_TESTS = 'Fluids / Tests';
export const NDS_RISKS = 'NDS - No Drilling Surprise';
export const NPT_EVENTS = 'NPT - Non Productive Time';
export const MARKERS = 'Markers';
export const FIELD_BLOCK_OPERATOR = 'Field / Block / Operator';
export const WELL_CHARACTERISTICS = 'Well Characteristics';
export const MEASUREMENTS = 'Measurements';
export const DATA_SOURCE = 'Source';

export const DOMAINS = {
  WELL: 'WELL',
  WELLBORE: 'WELLBORE',
  TRAJECTORY: 'TRAJECTORY',
  NDS: 'NDS',
  NPT: 'NPT',
  OTHER: 'OTHER',
};

export enum FilterIDs {
  DATA_SOURCE = 1,
  FIELD = 2,
  BLOCK = 3,
  OPERATOR = 4,
  KB = 5,
  TVD = 6,
  WATER_DEPTH = 7,
  SPUD_DATE = 8,
  MAXIMUM_INCLINATION_ANGLE = 9,
  MEASUREMENTS = 10,
  MARKERS = 11,
  NDS_RISKS_TYPE = 12,
  NDS_SEVERITY = 13,
  NDS_PROBABILITY = 14,
  NPT_DURATION = 15,
  NPT_CODE = 16,
  NPT_DETAIL_CODE = 17,
  FLUIDS = 18,
  WELL_TYPE = 19,
}

export const filterConfigs: FilterConfig[] = [
  {
    id: FilterIDs.DATA_SOURCE,
    name: 'Source',
    key: 'data_source_filter',
    category: DATA_SOURCE,
    type: FilterTypes.CHECKBOXES,
    fetcher: getWellFilterLabels()?.sources,
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
    fetcher: getWellFilterLabels()?.fields,
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
    fetcher: getWellFilterLabels()?.blocks,
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
    fetcher: getWellFilterLabels()?.operators,
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
    name: `KB elevation (${FEET})`,
    key: 'well_characteristics_filter.kb_elevation',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
  },
  {
    id: FilterIDs.TVD,
    name: `TVD (${FEET})`,
    key: 'well_characteristics_filter.tvd',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
  },
  {
    id: FilterIDs.WATER_DEPTH,
    name: `Water Depth (${FEET})`,
    key: 'well_characteristics_filter.water_depth',
    category: WELL_CHARACTERISTICS,
    type: FilterTypes.NUMERIC_RANGE,
    fetcher: () =>
      getWellFilterLabels()
        ?.limits()
        .then((response) => getWaterDepthLimitsInFeet(response.waterDepth)),
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
    fetcher: () =>
      getWellFilterLabels()
        ?.limits()
        .then((response) => {
          return [
            isValidDate(response.spudDate.min)
              ? startOf(response.spudDate.min, 'day')
              : undefined,
            isValidDate(response.spudDate.max)
              ? endOf(response.spudDate.max, 'day')
              : undefined,
          ];
        }),
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
    fetcher: getWellFilterLabels()?.measurements,
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
    fetcher: getEventsFilterLabels()?.ndsRiskTypes,
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
    fetcher: () =>
      getWellFilterLabels()
        ?.limits()
        .then(
          (response) =>
            [
              Math.ceil(response.nptDuration.min as number),
              Math.floor(response.nptDuration.max as number),
            ] as number[]
        ),
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
    fetcher: getEventsFilterLabels()?.nptCodes,
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
    fetcher: getEventsFilterLabels()?.nptDetailCodes,
    filterParameters: (values): WellFilter => ({
      npt: {
        nptCodeDetails: {
          containsAll: values as string[],
        },
      },
    }),
  },
];

export const filterConfigsById = filterConfigs.reduce(
  (prev, current) => ({ ...prev, [current.id]: current }),
  {} as FilterConfigMap
);

export const PETREL_LOG_TYPE = 'logType';
export const PPFG_LOG_TYPE = 'ppfg';
export const GEOMECHANIC_LOG_TYPE = 'geomechanic';
