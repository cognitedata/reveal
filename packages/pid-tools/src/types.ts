import { symbolTypes } from './constants';

export interface SvgPath {
  svgCommands: string;
}

export interface SvgPathWithId extends SvgPath {
  id: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SvgRepresentation {
  svgPaths: SvgPath[];
  boundingBox: BoundingBox;
}

export type SymbolTypes = typeof symbolTypes[number];

export interface DiagramSymbol {
  id: string; // uuid
  symbolType: SymbolTypes;
  description: string;
  svgRepresentations: SvgRepresentation[];
}

export type DiagramTypes = SymbolTypes | 'Line' | 'EquipmentTag';

export interface DiagramInstance {
  type: DiagramTypes;
  labelIds: string[];
  assetExternalId?: string;
  lineNumbers: string[];
}

export interface DiagramEquipmentTagInstance extends DiagramInstance {
  description: string[];
  name: string;
  type: 'EquipmentTag';
}

export interface DiagramInstanceWithPaths extends DiagramInstance {
  pathIds: string[];
}

export interface DiagramLineInstance extends DiagramInstanceWithPaths {
  type: 'Line';
}

export interface DiagramSymbolInstance extends DiagramInstanceWithPaths {
  symbolId: string;
  scale?: number;
}

export interface FileConnectionInstance extends DiagramSymbolInstance {
  type: 'File connection';
  position?: string; // 'A5', 'B3' or similar
  toPosition?: string;
  documentNumber?: number; // points to `PidDocumentMetadata.documentNumber`
  unit?: string; // // points to `DocumentMetadata.unit`
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

export interface DiagramInstanceWithPathsOutputFormat
  extends DiagramInstanceWithPaths {
  svgRepresentation: SvgRepresentation;
  labels: DiagramLabelOutputFormat[];
}

export interface DiagramSymbolInstanceOutputFormat
  extends DiagramSymbolInstance {
  id: string;
  svgRepresentation: SvgRepresentation;
  labels: DiagramLabelOutputFormat[];
}

export interface DiagramLabelOutputFormat {
  id: string;
  text: string;
  boundingBox: BoundingBox;
}

export interface DiagramEquipmentTagOutputFormat {
  name: string;
  labels: DiagramLabelOutputFormat[];
  lineNumbers: string[];
  boundingBox: BoundingBox;
}

export enum DocumentType {
  pid = 'P&ID',
  isometric = 'Isometric',
  unknown = 'Unknown',
}

interface DocumentMetadataBase {
  type: DocumentType;
  name: string;
  unit: string;
}

export interface PidDocumentMetadata extends DocumentMetadataBase {
  type: DocumentType.pid;
  documentNumber: number; // i.e MF_34, MF_034 -> 34
}

export interface IsoDocumentMetadata extends DocumentMetadataBase {
  type: DocumentType.isometric;
  lineNumber: string; // i.e L32, L132-1, L132-2
}

export interface UnknownDocumentMetadata extends DocumentMetadataBase {
  type: DocumentType.unknown;
}

export type DocumentMetadata =
  | PidDocumentMetadata
  | IsoDocumentMetadata
  | UnknownDocumentMetadata;
