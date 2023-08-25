/*!
 * Copyright 2023 Cognite AS
 */

import { type NodeAppearance, type AddModelOptions } from '@cognite/reveal';

import { type Matrix4 } from 'three';
import { type DmsUniqueIdentifier, type Source } from '../../utilities/FdmSDK';
import { type Node3D } from '@cognite/sdk/dist/src';

export type AddImageCollection360Options = {
  siteId: string;
};

export type FdmPropertyType<NodeType> = Record<string, Record<string, NodeType>>;

export type AddResourceOptions = AddReveal3DModelOptions | AddImageCollection360Options;

export type AddReveal3DModelOptions = AddModelOptions & { transform?: Matrix4 } & {
  styling?: { default?: NodeAppearance; mapped?: NodeAppearance };
};
export type TypedReveal3DModel = CadModelOptions | PointCloudModelOptions;

export type CadModelOptions = { type: 'cad' } & AddModelOptions & { transform?: Matrix4 } & {
    styling?: { default?: NodeAppearance; mapped?: NodeAppearance };
  };

export type PointCloudModelOptions = { type: 'pointcloud' } & AddModelOptions & {
    transform?: Matrix4;
  } & {
    styling?: { default?: NodeAppearance };
  };

export type NodeDataResult = {
  fdmNode: DmsUniqueIdentifier;
  view: Source;
  cadNode: Node3D;
};

export type FdmAssetStylingGroup = {
  fdmAssetExternalIds: DmsUniqueIdentifier[];
  style: { cad: NodeAppearance };
};

export type DefaultResourceStyling = {
  cad?: { default?: NodeAppearance; mapped?: NodeAppearance };
  pointcloud?: { default: NodeAppearance };
};

export type Reveal3DResourcesProps = {
  resources: AddResourceOptions[];
  defaultResourceStyling?: DefaultResourceStyling;
  instanceStyling?: FdmAssetStylingGroup[];
  onResourcesAdded?: () => void;
};
