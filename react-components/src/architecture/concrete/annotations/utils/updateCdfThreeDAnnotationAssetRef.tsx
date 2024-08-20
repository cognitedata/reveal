/*!
 * Copyright 2024 Cognite AS
 */

import { toast } from '@cognite/cogs.js';
import { type CogniteClient, type AnnotationChangeById } from '@cognite/sdk';

import { type AssetPointCloudAnnotation } from './types';

import { isAnnotationsBoundingVolume } from './annotationGeometryUtils';

export const updateCdfThreeDAnnotationAssetRef = async ({
  annotation,
  sdk,
  assetId
}: {
  annotation: AssetPointCloudAnnotation;
  sdk: CogniteClient;
  assetId: number;
}): Promise<AssetPointCloudAnnotation | undefined> => {
  try {
    const volume = annotation.geometry;
    if (!isAnnotationsBoundingVolume(volume)) {
      toast.error(
        { fallback: 'Error updating annotation. Please refresh the page or check your permissions' }
          .fallback
      );
      return;
    }
    const changes: AnnotationChangeById[] = [
      {
        id: annotation.id,
        update: {
          status: {
            set: 'approved'
          },
          data: {
            set: {
              region: volume.region,
              assetRef: { id: assetId }
            }
          }
        }
      }
    ];

    await sdk.annotations.update(changes);
    return {
      ...annotation,
      status: 'approved',
      geometry: {
        ...volume,
        assetRef: { id: assetId }
      },
      assetRef: { source: 'asset-centric', id: assetId }
    };
  } catch (error) {
    toast.error(
      { fallback: 'Error updating annotation. Please refresh the page or check your permissions' }
        .fallback
    );
  }
};
