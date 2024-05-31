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
import { type CogniteInternalId, type Node3D } from '@cognite/sdk';

export type AddImage360CollectionOptions =
  | AddImage360CollectionEventsOptions
  | AddImage360CollectionDatamodelsOptions;

export type CommonImage360CollectionAddOptions = {
  transform?: Matrix4;
};

export type AddImage360CollectionEventsOptions = {
  siteId: string;
} & CommonImage360CollectionAddOptions;

export type AddImage360CollectionDatamodelsOptions = {
  externalId: string;
  space: string;
} & CommonImage360CollectionAddOptions;

export type FdmPropertyType<NodeType> = Record<string, Record<string, NodeType>>;

export type TaggedAddImage360CollectionOptions = {
  type: 'image360';
  addOptions: AddImage360CollectionOptions;
};
export type TaggedAdd3DModelOptions = {
  type: 'cad' | 'pointcloud';
  addOptions: AddReveal3DModelOptions;
};

export type TaggedAddResourceOptions = TaggedAdd3DModelOptions | TaggedAddImage360CollectionOptions;

export type AddResourceOptions = AddReveal3DModelOptions | AddImage360CollectionOptions;

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
    styling?: { default?: NodeAppearance; mapped?: NodeAppearance };
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

export type AssetStylingGroup = {
  assetIds: CogniteInternalId[];
  style: {
    cad?: NodeAppearance;
    pointcloud?: NodeAppearance;
  };
};

export type Image360AssetStylingGroup = {
  assetIds: CogniteInternalId[];
  style: { image360?: Image360AnnotationAppearance };
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
