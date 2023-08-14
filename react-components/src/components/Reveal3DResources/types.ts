/*!
 * Copyright 2023 Cognite AS
 */

import { NodeAppearance, type AddModelOptions, type SupportedModelTypes } from '@cognite/reveal';

import { type Matrix4 } from 'three';
import { type Source } from '../../utilities/FdmSDK';
import { type Node3D } from '@cognite/sdk/dist/src';

export type AddImageCollection360Options = {
  siteId: string;
};

export type FdmPropertyType<NodeType> = Record<string, Record<string, NodeType>>;

export type AddResourceOptions = AddReveal3DModelOptions | AddImageCollection360Options;

export type AddReveal3DModelOptions = AddModelOptions & { transform?: Matrix4 } & {
  styling?: { default: NodeAppearance; mapped: NodeAppearance };
};
export type TypedReveal3DModel = AddReveal3DModelOptions & { type: SupportedModelTypes };

export type NodeDataResult = {
  nodeExternalId: string;
  view: Source;
  cadNode: Node3D;
};
