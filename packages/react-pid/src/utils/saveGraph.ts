import {
  DiagramInstanceOutputFormat,
  DiagramSymbolInstance,
  getInternalSvgBoundingBox,
  PidDocument,
} from '@cognite/pid-tools';

export const getDiagramInstanceOutputFormat = (
  pidDocument: PidDocument,
  diagramInstances: DiagramSymbolInstance[]
): DiagramInstanceOutputFormat[] => {
  return diagramInstances.map((diagramInstance) => {
    const pidPaths = diagramInstance.pathIds.map(
      (pathId: string) => pidDocument.getPidPathById(pathId)!
    );
    return {
      pathIds: diagramInstance.pathIds,
      symbolName: diagramInstance.symbolName,
      boundingBox: getInternalSvgBoundingBox(pidPaths),
      labels: diagramInstance.labels,
    };
  });
};
