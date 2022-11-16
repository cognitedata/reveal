import { CogniteAnnotation } from '@cognite/annotations';
import {
  Annotation,
  AnnotationType,
  getAnnotationsFromLegacyCogniteAnnotations,
} from '@cognite/unified-file-viewer';
import { FILE_CONTAINER_ID, styleForSelected } from '../constants';

export const getAnnotationsFromCogniteAnnotation = (
  cogniteAnnotations: CogniteAnnotation[] | undefined,
  clickedId: string | undefined
): Annotation[] => {
  if (!cogniteAnnotations) {
    return [];
  }
  if (cogniteAnnotations.length === 0) {
    return [];
  }

  return getAnnotationsFromLegacyCogniteAnnotations(
    cogniteAnnotations,
    FILE_CONTAINER_ID
  ).map((annotation) => {
    if (annotation.type !== AnnotationType.RECTANGLE) {
      return annotation;
    }

    return `${annotation.id}` === clickedId
      ? {
          ...annotation,
          style: styleForSelected,
        }
      : annotation;
  });
};
