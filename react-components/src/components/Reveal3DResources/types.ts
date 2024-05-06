/*!
 * Copyright 2023 Cognite AS
 */

import {
  type NodeAppearance,
  type AddModelOptions,
  type Image360AnnotationAppearance
} from '@cognite/reveal';

import { type Matrix4 } from 'three';
import { type DmsUniqueIdentifier, type Source } from '../../utilities/FdmSDK';
import { type CogniteInternalId, type Node3D } from '@cognite/sdk/dist/src';

export type AddImageCollection360Options =
  | AddImageCollection360EventsOptions
  | AddImageCollection360DatamodelsOptions;

type CommonAddImageCollection360Options = {
  transform?: Matrix4;
  styling?: { default?: Image360AnnotationAppearance; mapped?: Image360AnnotationAppearance };
};

export type AddImageCollection360EventsOptions = {
  siteId: string;
} & CommonAddImageCollection360Options;

export type AddImageCollection360DatamodelsOptions = {
  externalId: string;
  space: string;
} & CommonAddImageCollection360Options;

export type FdmPropertyType<NodeType> = Record<string, Record<string, NodeType>>;

export type TaggedAddImageCollection360Options = {
  type: 'image360';
} & AddImageCollection360Options;

export type TaggedAdd3DModelOptions = CadModelOptions | PointCloudModelOptions;

export type TaggedAddResourceOptions = TaggedAdd3DModelOptions | TaggedAddImageCollection360Options;

export type AddResourceOptions = AddReveal3DModelOptions | AddImageCollection360Options;

export type AddReveal3DModelOptions = AddModelOptions & { transform?: Matrix4 } & {
  styling?: { default?: NodeAppearance; mapped?: NodeAppearance };
};
export type TypedReveal3DModel = CadModelOptions | PointCloudModelOptions;

export type CadModelOptions = { type: 'cad' } & AddReveal3DModelOptions;
export type PointCloudModelOptions = { type: 'pointcloud' } & AddReveal3DModelOptions;

export type NodeDataResult = {
  fdmNode: DmsUniqueIdentifier;
  view: Source;
  cadNode: Node3D;
};

export type FdmAssetStylingGroup = {
  fdmAssetExternalIds: DmsUniqueIdentifier[];
  style: { cad: NodeAppearance };
};

export type AssetStylingGroup = {
  assetIds: CogniteInternalId[];
  style: {
    cad?: NodeAppearance;
    pointcloud?: NodeAppearance;
  };
};

export type InstanceStylingGroup =
  | FdmAssetStylingGroup
  | AssetStylingGroup
  | Image360AssetStylingGroup;

export type Image360AssetStylingGroup = {
  assetIds: CogniteInternalId[];
  style: { image360: Image360AnnotationAppearance };
};

export type DefaultResourceStyling = {
  cad?: { default?: NodeAppearance; mapped?: NodeAppearance };
  pointcloud?: { default: NodeAppearance; mapped?: NodeAppearance };
  image360?: { default: Image360AnnotationAppearance; mapped: Image360AnnotationAppearance };
};

export type Reveal3DResourcesProps = {
  resources: AddResourceOptions[];
  defaultResourceStyling?: DefaultResourceStyling;
  instanceStyling?: Array<FdmAssetStylingGroup | AssetStylingGroup | Image360AssetStylingGroup>;
  onResourcesAdded?: () => void;
  onResourceLoadError?: (failedResource: AddResourceOptions, error: any) => void;
};
