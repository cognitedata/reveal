export const SVG_ID = 'svg-id';
export const PATH_REPLACEMENT_GROUP = 'path_replacement_group';
export const T_JUNCTION = 'tjunction';

export const T_JUNCTION_SIZE = 2;
export const AUTO_ANALYSIS_DISTANCE_THRESHOLD_PID = 1;
export const AUTO_ANALYSIS_LINE_JUMP_THRESHOLD = 30;
export const AUTO_ANALYSIS_DISTANCE_THRESHOLD_ISO = 2;
export const AUTO_ANALYSIS_LABEL_THRESHOLD_PID = 10;
export const AUTO_ANALYSIS_LABEL_THRESHOLD_ISO = 40;

export const pidSymbolTypes = [
  'File Connection',
  'Bypass Connection',
  'Shared Instrument',
] as const;
export const isoSymbolTypes = ['Line Connection'] as const;
export const bothSymbolTypes = [
  'Instrument',
  'Valve',
  'Reducer',
  'Flange',
  'Cap',
  'Insulation',
  'Arrow',
  'Custom',
  'Equipment',
  'Line Break',
] as const;

export const symbolTypes = [
  ...isoSymbolTypes,
  ...pidSymbolTypes,
  ...bothSymbolTypes,
] as const;

export const directedDirections: [number, string][] = [
  [0, 'Right'],
  [90, 'Up'],
  [180, 'Left'],
  [270, 'Down'],
];

export const unidirectedDirections: [number, string][] = [
  [0, 'Left / Right'],
  [90, 'Up / Down'],
];

export const COLORS = {
  symbol: {
    color: 'Crimson',
    opacity: 0.9,
  },
  symbolBoundingBox: {
    color: 'DarkRed',
    opacity: 0.05,
    strokeColor: 'black',
    strokeOpacity: 0.3,
    strokeWidth: 0.2,
  },
  diagramLine: {
    color: 'DodgerBlue',
    opacity: 0.9,
  },
  graphPath: 'green',
  symbolSelection: {
    color: 'DarkOrange',
    opacity: 0.75,
  },
  connectionSelection: 'LightGreen',
  labelSelection: 'coral',
  activeLabel: 'red',
  connection: {
    color: 'DarkGreen',
    strokeWidth: 3,
    opacity: 0.4,
  },
  splitLine: 'Peru',
};

export const EQUIPMENT_TAG_REGEX = /^[0-9]{2}-[A-Z0-9]{4,5}$/;
export const VALID_LINE_NUMBER_PREFIXES = ['L', 'UT', 'IP', 'UL'];

export const DIAGRAM_PARSER_SOURCE = 'COGNITE_DIAGRAM_PARSER';
export const DIAGRAM_PARSER_OUTPUT_TYPE = 'graph';
export const DIAGRAM_PARSER_TYPE = 'COGNITE_DIAGRAM_PARSER_TYPE';
export const DIAGRAM_PARSER_PDF_EXTERNAL_ID =
  'COGNITE_DIAGRAM_PARSER_PDF_EXTERNAL_ID';

export const LINE_REVIEW_EVENT_TYPE = 'LINE_REVIEW';

export const LINEWALK_VERSION_KEY = 'LINEWALK_VERSION';
export const DIAGRAM_PARSER_PARSED_DOCUMENT_EXTERNAL_ID_PREFIX =
  'COGNITE_DIAGRAM_PARSER_PARSED_DOCUMENT_EXTERNAL_ID';

export const getVersionedParsedDocumentExternalId = (version: string) =>
  `${DIAGRAM_PARSER_PARSED_DOCUMENT_EXTERNAL_ID_PREFIX}_${version}_`;

export const LINEWALK_LINE_REVIEW_EVENT_EXTERNAL_ID_PREFIX =
  'COGNITE_LINEWALK_LINE_REVIEW_EVENT';

const LINE_LABEL_PREFIX = 'COGNITE_LINE_LABEL';

export const getLineReviewEventExternalId = (
  version: string,
  lineNumber: string
): string =>
  `${LINEWALK_LINE_REVIEW_EVENT_EXTERNAL_ID_PREFIX}_${version}_${lineNumber}`;

export const versionedLineLabelPrefix = (version: string) =>
  `${LINE_LABEL_PREFIX}_${version}_`;

export const lineNumberMetadataKey = (
  version: string,
  lineNumber: string
): string => `${versionedLineLabelPrefix(version)}${lineNumber}`;
