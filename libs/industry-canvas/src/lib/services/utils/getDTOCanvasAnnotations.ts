import { CanvasAnnotation } from '../../types';
import { getAnnotationOrContainerExternalId } from '../dataModelUtils';
import { DTOCanvasAnnotation } from '../types';

export const getDTOCanvasAnnotations = (
  canvasAnnotations: CanvasAnnotation[],
  canvasExternalId: string,
  zIndexById: Record<string, number | undefined>
): DTOCanvasAnnotation[] => {
  return canvasAnnotations.map((annotation) => {
    const {
      id,
      type,
      containerId,
      isSelectable,
      isDraggable,
      isResizable,
      ...props
    } = annotation;
    return {
      externalId: getAnnotationOrContainerExternalId(id, canvasExternalId),
      id,
      annotationType: type,
      containerId,
      isSelectable,
      isDraggable,
      isResizable,
      properties: {
        ...props,
        zIndex: zIndexById[id],
      } as DTOCanvasAnnotation['properties'],
    };
  });
};
