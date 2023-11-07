/*!
 * Copyright 2023 Cognite AS
 */
import { type Node3D, type CogniteExternalId, type Asset } from '@cognite/sdk';
import { type AssetAnnotationImage360Info } from '@cognite/reveal';

export type ThreeDModelFdmMappings = {
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

export type Reveal360AnnotationAssetData = {
  asset: Asset;
  assetAnnotationImage360Info: AssetAnnotationImage360Info;
};
