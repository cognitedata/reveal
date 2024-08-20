/*!
 * Copyright 2024 Cognite AS
 */

import { type AnnotationData } from '@cognite/sdk';

export enum ThreeDModelType {
  NONE = 'none',
  CAD = 'cad',
  POINT_CLOUD = 'pointcloud',
  UNKNOWN = 'unknown'
}

export type SelectedNodeAndRange = {
  treeIndex: number;
  nodeId: number;
  subtreeSize: number;
};

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

export enum ToolType {
  SELECT = 'select',
  CREATE = 'create'
}

export enum TransformMode {
  NONE = 'none',
  TRANSLATE = 'translate',
  ROTATE = 'rotate',
  SCALE = 'scale'
}

export type OnDeleteAnnotation = (
  annotation: AnnotationIdentifier,
  metricsOptions?: { source: string }
) => void;

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
