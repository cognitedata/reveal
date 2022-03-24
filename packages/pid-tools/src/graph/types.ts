import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramLineInstanceOutputFormat,
  DiagramSymbolInstance,
  DiagramSymbolInstanceOutputFormat,
} from '../types';

export interface Graph {
  diagramConnections: DiagramConnection[];
  diagramSymbolInstances: DiagramSymbolInstance[];
  diagramLineInstances: DiagramLineInstance[];
}

export interface GraphOutputFormat {
  diagramConnections: DiagramConnection[];
  diagramSymbolInstances: DiagramSymbolInstanceOutputFormat[];
  diagramLineInstances: DiagramLineInstanceOutputFormat[];
}
