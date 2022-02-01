import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbolInstance,
} from '../types';

export interface Graph {
  diagramConnections: DiagramConnection[];
  diagramSymbolInstances: DiagramSymbolInstance[];
  diagramLineInstances: DiagramLineInstance[];
}
