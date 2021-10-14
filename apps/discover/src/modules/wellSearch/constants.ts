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

export const PETREL_LOG_TYPE = 'logType';
export const PPFG_LOG_TYPE = 'ppfg';
export const GEOMECHANIC_LOG_TYPE = 'geomechanic';

export const DIGITAL_ROCKS_ACCESSORS = {
  DIMENSION_X: 'metadata.SIM_XDIM',
  DIMENSION_Y: 'metadata.SIM_YDIM',
  DIMENSION_Z: 'metadata.SIM_ZDIM',
  PLUG_DEPTH: 'metadata.PLUG_DEPTH',
  IMAGE_RESOLUTION: 'metadata.IMAGE_RESOLUTION',
  DEPTH_DATUM: 'metadata.DEPTH_DATUM',
  IDENTIFIER: 'metadata.PARENT_IMAGE_ID',
  CORE_IDENTIFIER: 'metadata.CORE_ID',
  PLUG_IDENTIFIER: 'metadata.PLUG_ID',
  SOURCE_OF_METRIAL: 'metadata.PLUG_TYPE',
  DEPTH_UNIT: 'metadata.DEPTH_UNITS',
  DIMENSION_UNIT: 'metadata.IMAGE_UNITS',
};

export const DIGITAL_ROCK_SAMPLES_ACCESSORS = {
  NAME: 'name',
  DESCRIPTION: 'description',
  SOURCE: 'source',
  DIMENSION_X: 'metadata.IMAGE_XDIM',
  DIMENSION_Y: 'metadata.IMAGE_YDIM',
  DIMENSION_Z: 'metadata.IMAGE_ZDIM',
  R_MEDIAN_TRASK: 'metadata.R_MEDIAN_TRASK',
  R_MEAN_TRASK: 'metadata.R_MEAN_TRASK',
  UNCERTAINTY: 'metadata.UNCERTAINTY',
  VOLUME_ID: 'metadata.VOLUME_ID',
  ORIENTATION: 'metadata.ORIENTATION',
};
