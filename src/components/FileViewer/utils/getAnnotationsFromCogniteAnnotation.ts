import { CogniteAnnotation } from '@cognite/annotations';
import {
  Annotation,
  getAnnotationsFromLegacyCogniteAnnotations,
} from '@cognite/unified-file-viewer';
import { FILE_CONTAINER_ID } from '../constants';

export const getAnnotationsFromCogniteAnnotation = (
  cogniteAnnotations: CogniteAnnotation[] | undefined
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
  );
};
