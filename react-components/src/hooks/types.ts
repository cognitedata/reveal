import { type Node3D, type Asset, type CogniteInternalId } from '@cognite/sdk';
import {
  type AnyIntersection,
  type DataSourceType,
  type Image360AnnotationIntersection,
  type AssetAnnotationImage360Info
} from '@cognite/reveal';
import { type Source, type DmsUniqueIdentifier } from '../data-providers';
import { type FdmNode } from '../data-providers/FdmSDK';
import { type AssetProperties } from '../data-providers/core-dm-provider/utils/filters';
import { type FdmKey } from '../components/CacheProvider/types';
import { type MOUSE, type Vector2 } from 'three';
import { type PointCloudFdmVolumeMappingWithViews } from '../query/core-dm/usePointCloudVolumeMappingForAssetInstances';
import { AssetInstance } from '../utilities/instances';

export type ThreeDModelFdmMappings = {
  modelId: number;
  revisionId: number;
  mappings: Map<FdmKey, Node3D[]>;
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

export type Reveal360AnnotationAssetData = {
  asset: Asset;
  assetAnnotationImage360Info: AssetAnnotationImage360Info;
};

export type PointCloudAnnotationMappedAssetData = {
  annotationId: number;
  asset: AssetInstance;
};

export type Image360AnnotationMappedAssetData =
  | ClassicImage360AnnotationMappedData
  | DmImage360AnnotationMappedData;

export type ClassicImage360AnnotationMappedData = {
  asset: Asset;
  annotationIds: number[];
};

export type DmImage360AnnotationMappedData = {
  asset: FdmNode<AssetProperties>;
  annotationIds: DmsUniqueIdentifier[];
};

export type AssetMappingDataResult = {
  cadNode: Node3D;
  assetIds: CogniteInternalId[];
};

export type FdmNodeDataResult = {
  fdmNodes: DmsUniqueIdentifier[];
  cadNode: Node3D;
  /**
   * A value of `undefined` means it's not yet finished evaluating.
   * A value of `null` means there was no result
   */
  views?: Source[][] | null;
};

export type ClickedNodeData = {
  mouseButton?: MOUSE;
  position?: Vector2;

  /**
   * A value of `undefined` means it's not yet finished evaluating.
   * A value of `null` means there was no result
   */
  fdmResult?: FdmNodeDataResult | null;

  /**
   * A value of `undefined` means it's not yet finished evaluating.
   * A value of `null` means there was no result
   */
  assetMappingResult?: AssetMappingDataResult | null;

  /**
   * A value of `undefined` means it's not yet finished evaluating.
   * A value of `null` means there was no result
   */
  pointCloudAnnotationMappingResult?: PointCloudAnnotationMappedAssetData[] | null;

  /**
   * A value of `undefined` means it's not yet finished evaluating.
   * A value of `null` means there was no result
   */
  pointCloudFdmVolumeMappingResult?: PointCloudFdmVolumeMappingWithViews[] | null;
  intersection: AnyIntersection | Image360AnnotationIntersection<DataSourceType>;
};
