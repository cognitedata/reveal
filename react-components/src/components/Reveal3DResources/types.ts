/*!
 * Copyright 2023 Cognite AS
 */

import { type AddModelOptions, type SupportedModelTypes } from '@cognite/reveal';
import { type Matrix4 } from 'three';

export type AddImageCollection360Options = {
  siteId: string;
};

export type AddResourceOptions = AddReveal3DModelOptions | AddImageCollection360Options;

export type AddReveal3DModelOptions = AddModelOptions & { transform?: Matrix4 };
export type TypedReveal3DModel = AddReveal3DModelOptions & { type: SupportedModelTypes | '' };

export type ViewInfo = {
  type: 'view';
  space: string;
  externalId: string;
  version: string;
};

export type NodeDataResult<NodeType> = {
  data: NodeType;
  view: ViewInfo;
};
