/*!
 * Copyright 2024 Cognite AS
 */
import {
  type AnnotationsCogniteAnnotationTypesImagesAssetLink,
  type AnnotationData
} from '@cognite/sdk';

export function is360ImageAnnotation(
  annotationData: AnnotationData
): annotationData is AnnotationsCogniteAnnotationTypesImagesAssetLink {
  const data = annotationData as AnnotationsCogniteAnnotationTypesImagesAssetLink;
  return data.text !== undefined && data.textRegion !== undefined && data.assetRef !== undefined;
}
