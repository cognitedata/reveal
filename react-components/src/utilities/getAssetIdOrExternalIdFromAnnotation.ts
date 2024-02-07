/*!
 * Copyright 2024 Cognite AS
 */
import { type AnnotationsBoundingVolume, type AnnotationModel } from '@cognite/sdk';

export function getAssetIdOrExternalIdFromAnnotation(
  annotation: AnnotationModel
): string | number | undefined {
  return (
    (annotation.data as AnnotationsBoundingVolume).assetRef?.id ??
    (annotation.data as AnnotationsBoundingVolume).assetRef?.externalId
  );
}
