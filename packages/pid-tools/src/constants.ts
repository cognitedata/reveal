export const SVG_ID = 'svg-id';
export const PATH_REPLACEMENT_GROUP = 'path_replacement_group';
export const T_JUNCTION = 'tjunction';

export const T_JUNCTION_SIZE = 2;
export const AUTO_ANALYSIS_DISTANCE_THRESHOLD_PID = 1;
export const AUTO_ANALYSIS_DISTANCE_THRESHOLD_ISO = 2;
export const AUTO_ANALYSIS_LABEL_THRESHOLD_PID = 10;
export const AUTO_ANALYSIS_LABEL_THRESHOLD_ISO = 40;

export const pidSymbolTypes = [
  'File connection', // this is only in P&IDs
] as const;

export const isoSymbolTypes = [
  'Line connection', // This is only in ISOs
] as const;

export const bothSymbolTypes = [
  'Instrument',
  'Valve',
  'Reducer',
  'Flange',
  'Cap',
  'Insolation',
  'Arrow',
  'Custom',
  'Equipment',
] as const;

export const symbolTypes = [
  ...isoSymbolTypes,
  ...pidSymbolTypes,
  ...bothSymbolTypes,
] as const;

export const orientations = [
  'Left',
  'Right',
  'Up',
  'Down',
  'Left & Right',
  'Up & Down',
] as const;

export const EQUIPMENT_TAG_REGEX = /^[0-9]{2}-[A-Z0-9]{4,5}$/;
