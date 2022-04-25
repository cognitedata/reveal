export const accessors = {
  WELL_NAME: 'wellName',
  WELLBORE_NAME: 'wellboreName',
  START_TIME: 'startTime',
  END_TIME: 'endTime',
  MEASURED_DEPTH: 'measuredDepth.value',
  DURATION: 'duration',
  NPT_CODE: 'nptCode',
  NPT_DETAIL_CODE: 'nptCodeDetail',
  DESCRIPTION: 'description',
  ROOT_CAUSE: 'rootCause',
  LOCATION: 'location',
  NPT_LEVEL: 'nptLevel',
  SUBTYPE: 'subtype',
};

export const colors = {
  CEMT: '#8791E7',
  DFAL: '#87E79C',
  RREP: '#87B9E7',
  SFAL: '#AB87E7',
  UFAL: '#F19F9D',
  WAIT: '#FECB4D',
  DPRB: '#FF614B',
};

export const DEFAULT_NPT_COLOR = '#BFBFBF';

export const VIEW_MODES = {
  Graph: 'Graph',
  Table: 'Table',
} as const;

export const DEFAULT_ACTIVE_VIEW_MODE = VIEW_MODES.Graph;

export const DEFINITION = 'Definition';
export const NO_DEFINITION = 'No definition provided';
export const ACTION_MESSAGE = 'Contact your admin user to add it';
