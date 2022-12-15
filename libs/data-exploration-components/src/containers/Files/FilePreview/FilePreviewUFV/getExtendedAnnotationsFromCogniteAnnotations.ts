import { CogniteAnnotation } from '@cognite/annotations';
import {
  AnnotationType,
  getDefaultStylesByResourceType,
} from '@cognite/unified-file-viewer';
import { isNotUndefined } from 'utils';
import { getTaggedEventAnnotation } from './migration/utils';
import { ExtendedAnnotation, TaggedEventAnnotation } from './types';

export const getRectangleAnnotationFromLegacyCogniteAnnotation = (
  annotation: CogniteAnnotation,
  containerId?: string
): ExtendedAnnotation<TaggedEventAnnotation> | undefined => {
  /* TODO: resource type is optional in legacy cognite annotations. This type is used to color the annotations.
         should we allow those annotations and color them in default color?
    */
  const { id, resourceId, resourceType, box } = annotation;
  if (!id || !box) {
    // eslint-disable-next-line no-console
    console.warn('id, or box parameters cannot be empty', annotation);
    return undefined;
  }
  if (!containerId && !resourceId) {
    // eslint-disable-next-line no-console
    console.warn(
      'container id and resource id cannot both be empty',
      annotation
    );
    return undefined;
  }
  const { xMin, yMin, xMax, yMax } = box;
  if (
    !Number.isFinite(yMin) ||
    !Number.isFinite(xMin) ||
    !Number.isFinite(yMax) ||
    !Number.isFinite(xMax)
  ) {
    // eslint-disable-next-line no-console
    console.warn('box values cannot be empty', annotation);
    return undefined;
  }

  return {
    id: String(id),
    containerId: containerId || String(resourceId),
    type: AnnotationType.RECTANGLE,
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
    style: getDefaultStylesByResourceType(resourceType),
    // TODO: Fix this, RectangleAnnotation type doesn't support metadata right now
    metadata: getTaggedEventAnnotation(annotation),
  };
};

/**
 * Converts legacy Cognite annotations to UFV annotations
 *
 * supports conversion only into Rectangle annotations
 * container id defaults to stringified resourceId, if not provided
 *
 * @param legacyCogniteAnnotations - array of cognite annotations
 * @param containerId - optional container id
 */
const getAnnotationsFromLegacyCogniteAnnotations = (
  legacyCogniteAnnotations: CogniteAnnotation[],
  containerId?: string
): ExtendedAnnotation[] =>
  legacyCogniteAnnotations
    .map(annotation =>
      getRectangleAnnotationFromLegacyCogniteAnnotation(annotation, containerId)
    )
    .filter(isNotUndefined);

export default getAnnotationsFromLegacyCogniteAnnotations;
