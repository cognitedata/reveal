import {
  DiagramInstanceOutputFormat,
  DiagramSymbolInstance,
  getInternalSvgBoundingBox,
  SvgDocument,
} from '@cognite/pid-tools';

export const getDiagramInstanceOutputFormat = (
  svgDocument: SvgDocument,
  diagramInstances: DiagramSymbolInstance[]
): DiagramInstanceOutputFormat[] => {
  return diagramInstances.map((diagramInstance) => {
    const internalSvgPaths = diagramInstance.pathIds.map((pathId: string) =>
      svgDocument.getInternalPathById(pathId)
    );
    return {
      pathIds: diagramInstance.pathIds,
      symbolName: diagramInstance.symbolName,
      boundingBox: getInternalSvgBoundingBox(internalSvgPaths),
    };
  });
};
