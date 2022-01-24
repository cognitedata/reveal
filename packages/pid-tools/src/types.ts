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

export interface DiagramSymbol {
  id: string; // uuid
  symbolType: string;
  description: string;
  svgRepresentations: SvgRepresentation[];
}

export interface DiagramInstance {
  type: string;
  labelIds: string[];
  lineNumbers: string[];
}

export interface DiagramInstanceWithPaths extends DiagramInstance {
  pathIds: string[];
}

export interface DiagramSymbolInstance extends DiagramInstanceWithPaths {
  symbolId: string;
  scale?: number;
}

export interface DiagramLineInstance extends DiagramInstanceWithPaths {
  type: 'Line';
}

export interface DiagramEquipmentTagInstance extends DiagramInstance {
  description: string[];
  name: string;
  type: 'EquipmentTag';
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

export interface DiagramInstanceOutputFormat extends DiagramInstanceWithPaths {
  symbolId?: string;
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
