export const SVG_ID = 'svg-id';
export const PATH_REPLACEMENT_GROUP = 'path_replacement_group';
export const T_JUNCTION = 'tjunction';

export const T_JUNCTION_SIZE = 2;
export const AUTO_ANALYSIS_DISTANCE_THRESHOLD = 1;
export const AUTO_ANALYSIS_LABEL_THRESHOLD_PID = 10;
export const AUTO_ANALYSIS_LABEL_THRESHOLD_ISO = 40;

export const symbolTypes = [
  'File connection', // this is only in P&IDs
  'Instrument',
  'Valve',
  'Reducer',
  'Flange',
  'Cap',
  'Insolation',
  'Arrow',
  'Custom',
  'Line connection', // This is only in ISOs
] as const;
