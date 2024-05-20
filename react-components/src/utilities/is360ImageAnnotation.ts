/*!
 * Copyright 2024 Cognite AS
 */
import { type AnnotationData, type AnnotationsBoundingVolume } from '@cognite/sdk';

export function is360ImageAnnotation(
  annotationData: AnnotationData
): annotationData is AnnotationsBoundingVolume {
  return (annotationData as AnnotationsBoundingVolume).region !== undefined;
}
