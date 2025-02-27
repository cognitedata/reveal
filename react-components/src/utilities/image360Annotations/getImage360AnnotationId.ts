/*!
 * Copyright 2025 Cognite AS
 */
import { assertNever } from '../assertNever';
import { isClassicImage360Annotation, isDMImage360Annotation } from './typeGuards';
import { type Image360AnnotationContent, type Image360AnnotationId } from './types';

export function getImage360AnnotationId(
  annotation: Image360AnnotationContent
): Image360AnnotationId {
  if (isClassicImage360Annotation(annotation)) {
    return annotation.id;
  } else if (isDMImage360Annotation(annotation)) {
    return {
      externalId: annotation.annotationIdentifier.externalId,
      space: annotation.annotationIdentifier.space
    };
  }
  assertNever(annotation);
}
