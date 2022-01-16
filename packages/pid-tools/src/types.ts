export interface SvgPath {
  svgCommands: string;
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
  pathIds: string[];
  labelIds: string[];
  lineNumbers: string[];
}

export interface DiagramSymbolInstance extends DiagramInstance {
  symbolId: string;
  scale?: number;
}

export interface DiagramLineInstance extends DiagramInstance {
  type: 'Line';
}

export type DiagramInstanceId = string;

export interface DiagramConnection {
  start: DiagramInstanceId;
  end: DiagramInstanceId;
  direction: 'directed' | 'unknown';
}

export interface DiagramInstanceOutputFormat extends DiagramInstance {
  symbolId?: string;
  svgRepresentation: SvgRepresentation;
  labels: DiagramLabelOutputFormat[];
}

export interface DiagramLabelOutputFormat {
  id: string;
  text: string;
  boundingBox: BoundingBox;
}
