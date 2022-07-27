import { symbolTypes, tagTypes } from './constants';

export interface SvgPath {
  svgCommands: string;
  style?: string;
}

export interface SvgPathWithId extends SvgPath {
  id: string;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SvgRepresentation {
  svgPaths: SvgPath[];
  boundingBox: Rect;
}

export type SymbolType = typeof symbolTypes[number];
export type TagType = typeof tagTypes[number];

export interface DiagramSymbol {
  id: string; // uuid
  symbolType: SymbolType;
  description: string;
  svgRepresentation: SvgRepresentation;
  direction?: number; // 0-359 or `undefined` if irrelevant
}

export type DiagramAnnotationType = SymbolType | 'Line' | TagType;

export interface DiagramInstance {
  id: string;
  type: DiagramAnnotationType;
  labelIds: string[];
  assetExternalId?: string;
  assetId?: number;
  assetName?: string;
  lineNumbers: string[];
  inferedLineNumbers: string[];
}

export interface DiagramTag extends DiagramInstance {
  type: TagType;
}

export interface DiagramInstanceWithPaths extends DiagramInstance {
  pathIds: string[];
}

export interface DiagramLineInstance extends DiagramInstanceWithPaths {
  type: 'Line';
}

export interface DiagramSymbolInstance extends DiagramInstanceWithPaths {
  type: SymbolType;
  symbolId: string;
  scale: number;
  rotation: number;
  direction?: number;
}

export type FileDirection = 'In' | 'Out' | 'Unidirectional' | 'Unknown';

export interface PidFileConnectionInstance extends DiagramSymbolInstance {
  type: 'File Connection' | 'Bypass Connection';
  position?: string; // 'A5', 'B3' or similar
  toPosition?: string;
  documentNumber?: number; // points to `PidDocumentMetadata.documentNumber`
  unit?: string; // // points to `DocumentMetadata.unit`
  direction: number;
  fileDirection?: FileDirection;
}

interface LineConnectionInfo {
  letterIndex?: string; // A/B/C
  pointsToFileName?: string; // point to IsoDocumentMetadata.lineNumber or 'SAME' if on the same document
}

export interface LineConnectionInstance
  extends DiagramSymbolInstance,
    LineConnectionInfo {
  type: 'Line Connection';
}

export interface DiagramInstrumentInstance extends DiagramSymbolInstance {
  type: 'Instrument';
}

interface EquipmentTagInfo {
  equipmentTag: string;
}
export interface DiagramEquipmentInstance
  extends DiagramSymbolInstance,
    EquipmentTagInfo {
  type: 'Equipment';
}

export interface DiagramEquipmentTag extends DiagramTag, EquipmentTagInfo {
  type: 'Equipment Tag';
}

export interface DiagramLineConnectionTag
  extends DiagramTag,
    LineConnectionInfo {
  type: 'Line Connection Tag';
}

export type PathReplacementType = 'T-junction' | 'Multi-path';

export interface PathReplacementGroup {
  id: string;
  type: PathReplacementType;
  replacements: PathReplacement[];
}

export interface PathReplacement {
  pathId: string;
  replacementPaths: SvgPathWithId[];
}

export type DiagramInstanceId = string;

export interface DiagramConnection {
  start: DiagramInstanceId;
  end: DiagramInstanceId;
  direction: 'directed' | 'unknown';
}

interface DiagramInstanceOutputFields {
  svgRepresentation: SvgRepresentation;
  labels: DiagramLabelOutputFormat[];
}

export type DiagramInstanceOutputFormat = DiagramInstance &
  DiagramInstanceOutputFields;

export type DiagramSymbolInstanceOutputFormat = DiagramSymbolInstance &
  DiagramInstanceOutputFields;

export type DiagramLineInstanceOutputFormat = DiagramLineInstance &
  DiagramInstanceOutputFields;

export type DiagramEquipmentInstanceOutputFormat = DiagramEquipmentInstance &
  DiagramInstanceOutputFields;

export type DiagramInstrumentInstanceOutputFormat = DiagramInstrumentInstance &
  DiagramInstanceOutputFields;

export type DiagramTagOutputFormat = DiagramTag & DiagramInstanceOutputFields;

export type LineConnectionInstanceOutputFormat = LineConnectionInstance &
  DiagramInstanceOutputFields;

export interface DiagramLabelOutputFormat {
  id: string;
  text: string;
  boundingBox: Rect;
}

export enum DiagramType {
  PID = 'p&id',
  ISO = 'iso',
  UNKNOWN = 'unknown',
}
export interface Legend {
  symbols: DiagramSymbol[];
}

export interface GraphDocument extends Legend {
  documentMetadata: DocumentMetadata;
  viewBox: Rect;
  symbolInstances: DiagramSymbolInstanceOutputFormat[];
  lines: DiagramLineInstanceOutputFormat[];
  connections: DiagramConnection[];
  pathReplacementGroups: PathReplacementGroup[];
  lineNumbers: string[];
  tags: DiagramTagOutputFormat[];
  labels: DiagramLabelOutputFormat[];
}

interface DocumentMetadataBase {
  type: DiagramType;
  name: string;
  unit: string;
}

export interface PidDocumentMetadata extends DocumentMetadataBase {
  type: DiagramType.PID;
  documentNumber: number; // i.e MF_34, MF_034 -> 34
}

export interface IsoDocumentMetadata extends DocumentMetadataBase {
  type: DiagramType.ISO;
  lineNumber: string; // i.e L032, L132, L132-1 -> L132
  pageNumber: number; // i.e. L132-1 -> 1
}

export interface UnknownDocumentMetadata extends DocumentMetadataBase {
  type: DiagramType.UNKNOWN;
}

export type DocumentMetadata =
  | PidDocumentMetadata
  | IsoDocumentMetadata
  | UnknownDocumentMetadata;

export type ToolType =
  | 'addSymbol'
  | 'addLine'
  | 'splitLine'
  | 'connectInstances'
  | 'connectLabels'
  | 'setLineNumber'
  | 'addEquipmentTag';
