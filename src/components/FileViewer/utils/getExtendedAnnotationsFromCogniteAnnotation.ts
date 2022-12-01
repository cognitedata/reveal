import { CogniteAnnotation } from '@cognite/annotations';
import {
  getAnnotationsFromLegacyCogniteAnnotations,
  RectangleAnnotation,
} from '@cognite/unified-file-viewer';
import { ExtendedAnnotation } from '../types';

const filterApplicableAnnotations = (annotation: ExtendedAnnotation) =>
  annotation.metadata.resourceType === 'asset';

export const getExtendedAnnotationsFromCogniteAnnotation = (
  cogniteAnnotations: CogniteAnnotation[] | undefined,
  containerId: string
): ExtendedAnnotation[] => {
  if (!cogniteAnnotations) {
    return [];
  }
  if (cogniteAnnotations.length === 0) {
    return [];
  }

  return cogniteAnnotations
    .map((cogniteAnnotation) => ({
      ...(getAnnotationsFromLegacyCogniteAnnotations(
        [cogniteAnnotation],
        containerId
      )[0] as RectangleAnnotation),
      metadata: {
        resourceId: cogniteAnnotation.resourceId,
        label: cogniteAnnotation.label,
        resourceType: cogniteAnnotation.resourceType,
        page: cogniteAnnotation.page,
      },
    }))
    .filter(filterApplicableAnnotations);
};
