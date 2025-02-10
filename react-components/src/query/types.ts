/*!
 * Copyright 2025 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import {
  type ListResponse,
  type AssetMapping3D,
  type Asset,
  type NodeDefinition
} from '@cognite/sdk';

export type ModelMappings = {
  model: AddModelOptions;
  mappings: ListResponse<AssetMapping3D[]>;
};

export type ModelMappingsWithAssets = ModelMappings & {
  assets: Asset[];
};

export type AssetPage = {
  assets: Asset[];
  nextCursor: string | undefined;
};

export type ModelAssetPage = {
  modelsAssets: ModelMappingsWithAssets[];
  nextCursor: string | undefined;
};

export type NodeDefinitionWithModelAndMappings = {
  model: AddModelOptions;
  asset: NodeDefinition;
  mappings: AssetMapping3D[];
};
