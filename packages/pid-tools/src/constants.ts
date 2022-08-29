import { FileInfo } from '@cognite/sdk';

export const SVG_ID = 'svg-id';
export const PATH_REPLACEMENT_GROUP = 'path-replacement-group';
export const T_JUNCTION = 'tjunction';
export const BACKGROUND_OVERLAY_GROUP = 'background-overlay-group';

const TYPICAL_DOCUMENT_WIDTH = 1632;
export const AUTO_ANALYSIS_THRESHOLD = {
  SYMBOL_TO_SYMBOL: 3 / TYPICAL_DOCUMENT_WIDTH,
  SYMBOL_TO_LINE: 5 / TYPICAL_DOCUMENT_WIDTH,
  LINE_TO_LINE: 0.5 / TYPICAL_DOCUMENT_WIDTH,
  LINE_JUMP: 30 / TYPICAL_DOCUMENT_WIDTH,
  PRUNE_CONNECTION_START_POINT: 0.5 / TYPICAL_DOCUMENT_WIDTH,
};
export const T_JUNCTION_SIZE = 2; // fix: Normalize
export const AUTO_ANALYSIS_LABEL_THRESHOLD_PID = 10 / TYPICAL_DOCUMENT_WIDTH;
export const AUTO_ANALYSIS_LABEL_THRESHOLD_ISO = 40 / TYPICAL_DOCUMENT_WIDTH;
export const AUTO_ANALYSIS_LINE_CONNECTION_TAG_THRESHOLD =
  20 / TYPICAL_DOCUMENT_WIDTH;

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

export const tagTypes = ['Equipment Tag', 'Line Connection Tag'] as const;

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
  symbolWithAsset: {
    color: 'green',
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

export const VALID_LINE_NUMBER_PREFIXES = ['L', 'UT', 'IP', 'UL'];
export const LINE_CONNECTION_LETTER_REGEX = /('[A-Z]'|"[A-Z]")/;
export const EQUIPMENT_TAG_REGEX = /^[0-9]{2}-[A-Z0-9]{4,5}$/;
export const UNIT_REGEX = /G[0-9]{4}/;

export const DIAGRAM_PARSER_SOURCE = 'COGNITE_DIAGRAM_PARSER';
export const DIAGRAM_PARSER_OUTPUT_TYPE = 'graph';
export const DIAGRAM_PARSER_TYPE = 'COGNITE_DIAGRAM_PARSER_TYPE';
export const DIAGRAM_PARSER_SITE_KEY = 'site';
export const DIAGRAM_PARSER_UNIT_KEY = 'unit';
export const DIAGRAM_PARSER_LAST_PARSED_KEY =
  'COGNITE_DIAGRAM_PARSER_LAST_PARSED';
export const DIAGRAM_PARSER_JSON_EXTERNAL_ID =
  'COGNITE_DIAGRAM_PARSER_JSON_EXTERNAL_ID';

export const LINEWALK_VERSION_KEY = 'LINEWALK_VERSION';
export const LINEWALK_FRONTEND_VERSION = '0.0.29';
export const LINEWALK_DATA_VERSION = '0.0.29';
export const LINE_REVIEW_EVENT_TYPE = 'LINE_REVIEW';
export const LINE_REVIEW_SITE_EVENT_TYPE = 'LINE_REVIEW_SITE';
export const LINE_REVIEW_UNIT_EVENT_TYPE = 'LINE_REVIEW_UNIT';
export const DIAGRAM_PARSER_PARSED_DOCUMENT_EXTERNAL_ID_PREFIX =
  'COGNITE_DIAGRAM_PARSER_PARSED_DOCUMENT_EXTERNAL_ID';

export const getParsedDocumentExternalId = (version: string) =>
  `${DIAGRAM_PARSER_PARSED_DOCUMENT_EXTERNAL_ID_PREFIX}_${version}_`;

const LINEWALK_LINE_REVIEW_EVENT_EXTERNAL_ID_PREFIX =
  'COGNITE_LINEWALK_LINE_REVIEW_EVENT';
export const getLineReviewEventExternalId = (
  version: string,
  site: string,
  unit: string,
  lineNumber: string
): string =>
  `${LINEWALK_LINE_REVIEW_EVENT_EXTERNAL_ID_PREFIX}_${version}_${site}_${unit}_${lineNumber}`;

const LINEWALK_UNIT_EVENT_EXTERNAL_ID_PREFIX = 'COGNITE_LINEWALK_UNIT_EVENT';

export const getUnitEventExternalId = (
  version: string,
  site: string,
  unit: string
): string =>
  `${LINEWALK_UNIT_EVENT_EXTERNAL_ID_PREFIX}_${version}_${site}_${unit}`;

const LINEWALK_SITE_EVENT_EXTERNAL_ID_PREFIX = 'COGNITE_LINEWALK_SITE_EVENT';
export const getSiteEventExternalId = (version: string, site: string): string =>
  `${LINEWALK_SITE_EVENT_EXTERNAL_ID_PREFIX}_${version}_${site}`;

const LINE_LABEL_PREFIX = 'COGNITE_LINE_LABEL';
export const getLineLabelPrefix = (version: string) =>
  `${LINE_LABEL_PREFIX}_${version}`;

const DIAGRAM_PARSER_GRAPH_EXTERNAL_ID =
  'COGNITE_DIAGRAM_PARSER_GRAPH_EXTERNAL_ID';
export const getGraphExternalIdKey = (version: string) =>
  `${DIAGRAM_PARSER_GRAPH_EXTERNAL_ID}_${version}_`;

export const getLineNumberKey = (
  version: string,
  site: string,
  unit: string,
  lineNumber: string
): string => `${getLineLabelPrefix(version)}_${site}_${unit}_${lineNumber}`;

export const getDiagramParserTypeFromFileInfo = (fileInfo: FileInfo) =>
  fileInfo.metadata?.[DIAGRAM_PARSER_TYPE];
