import {
  DiagramInstanceOutputFormat,
  DiagramSymbolInstance,
  PidDocument,
  getDiagramInstanceId,
} from '@cognite/pid-tools';

export const getDiagramInstanceOutputFormat = (
  pidDocument: PidDocument,
  diagramInstances: DiagramSymbolInstance[]
): DiagramInstanceOutputFormat[] => {
  return diagramInstances.map((diagramInstance) => {
    const labels = diagramInstance.labelIds.map((labelId) =>
      pidDocument.getPidTspanById(labelId)!.toDiagramLabelOutputFormat()
    );

    return {
      id: getDiagramInstanceId(diagramInstance),
      symbolName: diagramInstance.symbolName,
      pathIds: diagramInstance.pathIds,
      svgRepresentation: pidDocument.createSvgRepresentation(
        diagramInstance.pathIds,
        true,
        4
      ),
      labelIds: diagramInstance.labelIds,
      labels,
    };
  });
};
