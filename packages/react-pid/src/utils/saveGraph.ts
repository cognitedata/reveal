import {
  DiagramInstanceOutputFormat,
  DiagramSymbolInstance,
  PidDocument,
  getDiagramInstanceId,
  DiagramLineInstance,
  DiagramEquipmentTagInstance,
  DiagramEquipmentTagOutputFormat,
  getEncolosingBoundingBox,
} from '@cognite/pid-tools';

export const getSymbolInstancesOutputFormat = (
  pidDocument: PidDocument,
  diagramInstances: DiagramSymbolInstance[]
): DiagramInstanceOutputFormat[] => {
  return diagramInstances.map((diagramInstance) => {
    const labels = diagramInstance.labelIds.map((labelId) =>
      pidDocument.getPidTspanById(labelId)!.toDiagramLabelOutputFormat()
    );

    return {
      id: getDiagramInstanceId(diagramInstance),
      type: diagramInstance.type,
      symbolId: diagramInstance.symbolId,
      pathIds: diagramInstance.pathIds,
      svgRepresentation: pidDocument.createSvgRepresentation(
        diagramInstance.pathIds,
        true,
        4
      ),
      labelIds: diagramInstance.labelIds,
      labels,
      lineNumbers: diagramInstance.lineNumbers,
    };
  });
};

export const getLineInstancesOutputFormat = (
  pidDocument: PidDocument,
  lineInstances: DiagramLineInstance[]
): DiagramInstanceOutputFormat[] => {
  return lineInstances.map((diagramInstance) => {
    const labels = diagramInstance.labelIds.map((labelId) =>
      pidDocument.getPidTspanById(labelId)!.toDiagramLabelOutputFormat()
    );

    return {
      id: getDiagramInstanceId(diagramInstance),
      type: diagramInstance.type,
      pathIds: diagramInstance.pathIds,
      svgRepresentation: pidDocument.createSvgRepresentation(
        diagramInstance.pathIds,
        true,
        4
      ),
      labelIds: diagramInstance.labelIds,
      labels,
      lineNumbers: diagramInstance.lineNumbers,
    };
  });
};

export const getEquipmentTagOutputFormat = (
  pidDocument: PidDocument,
  equipmentTags: DiagramEquipmentTagInstance[]
): DiagramEquipmentTagOutputFormat[] => {
  return equipmentTags.map((equipmentTag) => {
    const labels = equipmentTag.labelIds.map((labelId) =>
      pidDocument.getPidTspanById(labelId)!.toDiagramLabelOutputFormat()
    );
    return {
      name: equipmentTag.name,
      labels,
      lineNumbers: equipmentTag.lineNumbers,
      boundingBox: getEncolosingBoundingBox(
        labels.map((label) => label.boundingBox)
      ),
    };
  });
};
