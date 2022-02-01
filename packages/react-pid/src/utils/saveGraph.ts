import {
  PidDocument,
  getDiagramInstanceId,
  DiagramEquipmentTagInstance,
  DiagramEquipmentTagOutputFormat,
  getEncolosingBoundingBox,
  DiagramSymbolInstanceOutputFormat,
  DiagramSymbolInstance,
  DiagramInstanceWithPaths,
  DiagramInstanceWithPathsOutputFormat,
} from '@cognite/pid-tools';

export const getDiagramInstancesOutputFormat = (
  pidDocument: PidDocument,
  diagramInstances: DiagramInstanceWithPaths[]
): DiagramInstanceWithPathsOutputFormat[] => {
  return diagramInstances.map((diagramInstance) => {
    const labels = diagramInstance.labelIds.map((labelId) =>
      pidDocument.getPidTspanById(labelId)!.toDiagramLabelOutputFormat()
    );

    return {
      ...diagramInstance,
      id: getDiagramInstanceId(diagramInstance),
      svgRepresentation: pidDocument.createSvgRepresentation(
        diagramInstance.pathIds,
        true,
        4
      ),
      labels,
    };
  });
};

export const getDiagramSymbolInstancesOutputFormat = (
  pidDocument: PidDocument,
  symbolInstances: DiagramSymbolInstance[]
): DiagramSymbolInstanceOutputFormat[] => {
  return symbolInstances.map((diagramInstance) => {
    const labels = diagramInstance.labelIds.map((labelId) =>
      pidDocument.getPidTspanById(labelId)!.toDiagramLabelOutputFormat()
    );

    return {
      ...diagramInstance,
      id: getDiagramInstanceId(diagramInstance),
      svgRepresentation: pidDocument.createSvgRepresentation(
        diagramInstance.pathIds,
        true,
        4
      ),
      labels,
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
      labelIds: equipmentTag.labelIds,
      type: equipmentTag.type,
      lineNumbers: equipmentTag.lineNumbers,
      boundingBox: getEncolosingBoundingBox(
        labels.map((label) => label.boundingBox)
      ),
    };
  });
};
