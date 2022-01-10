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

export interface DiagramSymbolInstance {
  pathIds: string[];
  symbolId: string;
  labelIds: string[];
  scale?: number;
}

export interface DiagramLineInstance extends DiagramSymbolInstance {
  symbolId: 'Line';
}

export type DiagramInstanceId = string;

export interface DiagramConnection {
  start: DiagramInstanceId;
  end: DiagramInstanceId;
  direction: 'directed' | 'unknown';
}

export interface DiagramInstanceOutputFormat extends DiagramSymbolInstance {
  id: string;
  svgRepresentation: SvgRepresentation;
  labels: DiagramLabelOutputFormat[];
}

export interface DiagramLabelOutputFormat {
  id: string;
  text: string;
  boundingBox: BoundingBox;
}
