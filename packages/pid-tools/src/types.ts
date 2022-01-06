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
  symbolName: string;
  svgRepresentations: SvgRepresentation[];
}

export interface DiagramSymbolInstance {
  symbolName: string;
  pathIds: string[];
  scale?: number;
  labelIds: string[];
}

export interface DiagramLineInstance extends DiagramSymbolInstance {
  symbolName: 'Line';
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
