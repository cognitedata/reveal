/*!
 * Copyright 2023 Cognite AS
 */
import { type Node3D, type CogniteExternalId, type AssetMapping3D } from '@cognite/sdk';

export type ThreeDModelMappings = {
  modelId: number;
  revisionId: number;
  mappings: Map<CogniteExternalId, Node3D[]>;
};

export type Model3DEdgeProperties = {
  revisionId: number;
  revisionNodeId: number;
};

export type Image360LayersUrlStateParam = {
  siteId: string;
  applied: boolean;
};

export type CadLayersUrlStateParam = {
  revisionId: number;
  applied: boolean;
  index: number;
};

export type PointCloudLayersUrlStateParam = {
  revisionId: number;
  applied: boolean;
  index: number;
};

export type LayersUrlStateParam = {
  image360Layers?: Image360LayersUrlStateParam[];
  cadLayers?: CadLayersUrlStateParam[];
  pointCloudLayers?: PointCloudLayersUrlStateParam[];
};

export type Annotation360Data = {
  id: string;
  externalId: string;
  type: string;
  createdTime: string;
  lastUpdatedTime: string;
};

export type AugmentedMapping = Partial<AssetMapping3D> & {
  name: string;
  description?: string;
  annotationId?: number;
  createTime?: Date;
  updateTime?: Date;
};
