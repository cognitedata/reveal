import {
  DiagramInstanceOutputFormat,
  DiagramSymbolInstance,
  PidDocument,
} from '@cognite/pid-tools';

export const getDiagramInstanceOutputFormat = (
  pidDocument: PidDocument,
  diagramInstances: DiagramSymbolInstance[]
): DiagramInstanceOutputFormat[] => {
  return diagramInstances.map((diagramInstance) => {
    return {
      pathIds: diagramInstance.pathIds,
      symbolName: diagramInstance.symbolName,
      boundingBox: pidDocument.getBoundingBoxToPaths(diagramInstance.pathIds),
      labels: diagramInstance.labels,
    };
  });
};
