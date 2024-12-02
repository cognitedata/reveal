/*!
 * Copyright 2023 Cognite AS
 */

import { type CadModelOptions } from '../../components/Reveal3DResources/types';
import { type AssetMapping } from '../../components/CacheProvider/AssetMappingAndNode3DCache';

export type ModelWithAssetMappings = {
  model: CadModelOptions;
  assetMappings: AssetMapping[];
};
