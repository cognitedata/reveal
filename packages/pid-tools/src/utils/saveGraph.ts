import { getEncolosingBoundingBox } from '../geometry';
import { PidDocument } from '../pid';
import {
  DiagramLineInstance,
  DiagramLineInstanceOutputFormat,
  DiagramSymbolInstance,
  DiagramSymbolInstanceOutputFormat,
  DiagramTag,
  DiagramTagOutputFormat,
} from '../types';

export const getDiagramLineInstancesOutputFormat = (
  pidDocument: PidDocument,
  diagramInstances: DiagramLineInstance[]
): DiagramLineInstanceOutputFormat[] => {
  return diagramInstances.map((diagramInstance) => {
    const labels = diagramInstance.labelIds.map((labelId) =>
      pidDocument.getPidTspanById(labelId)!.toDiagramLabelOutputFormat()
    );

    return <DiagramLineInstanceOutputFormat>{
      ...diagramInstance,
      id: diagramInstance.id,
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

    return <DiagramSymbolInstanceOutputFormat>{
      ...diagramInstance,
      id: diagramInstance.id,
      svgRepresentation: pidDocument.createSvgRepresentation(
        diagramInstance.pathIds,
        true,
        4
      ),
      labels,
    };
  });
};

export const getTagOutputFormat = (
  pidDocument: PidDocument,
  tags: DiagramTag[]
): DiagramTagOutputFormat[] => {
  return tags.map((tag) => {
    const labels = tag.labelIds.map((labelId) =>
      pidDocument.getPidTspanById(labelId)!.toDiagramLabelOutputFormat()
    );
    return {
      ...tag,
      labels,
      svgRepresentation: {
        boundingBox: getEncolosingBoundingBox(
          labels.map((label) => label.boundingBox)
        ),
        svgPaths: [],
      },
    };
  });
};
