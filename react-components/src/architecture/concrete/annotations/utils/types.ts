/*!
 * Copyright 2024 Cognite AS
 */

import { type AnnotationData } from '@cognite/sdk';

export type LegacyIdentifier = {
  source: 'asset-centric';
  id: number;
};

export type FdmIdentifier = {
  source: 'fdm';
  space: string;
  externalId: string;
};

export type FdmAssetIdentifier = FdmIdentifier & {
  resourceId: number; // Need a numeric identifier for the FDM resource to be used in the DOM
};

export type AnnotationIdentifier = LegacyIdentifier | FdmAssetIdentifier;

export type AssetIdentifier = LegacyIdentifier | FdmAssetIdentifier;

export type PointCloudAnnotation = AnnotationIdentifier & {
  geometry: AnnotationData;
  status: 'approved' | 'suggested' | 'rejected';
  creatingApp: string;
  assetRef?: AssetIdentifier;
};

export type AssetPointCloudAnnotation = PointCloudAnnotation & {
  source: 'asset-centric';
};

export type FdmPointCloudAnnotation = PointCloudAnnotation & {
  source: 'fdm';
};

export function compareAnnotationIdentifiers(
  a: AnnotationIdentifier,
  b: AnnotationIdentifier
): boolean {
  if (a.source === 'asset-centric' && b.source === 'asset-centric') {
    return a.id === b.id;
  } else if (a.source === 'fdm' && b.source === 'fdm') {
    return a.space === b.space && a.externalId === b.externalId;
  }

  return false;
}
