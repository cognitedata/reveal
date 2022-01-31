import {
  DiagramInstanceWithPathsOutputFormat,
  PidDocument,
  getDiagramInstanceId,
  DiagramEquipmentTagInstance,
  DiagramEquipmentTagOutputFormat,
  getEncolosingBoundingBox,
  DiagramInstanceWithPaths,
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
