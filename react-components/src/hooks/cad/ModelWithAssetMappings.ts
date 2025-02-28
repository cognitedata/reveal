/*!
 * Copyright 2023 Cognite AS
 */

import { type CadModelOptions } from '../../components/Reveal3DResources/types';
import { type CdfAssetMapping } from '../../components/CacheProvider/types';

export type ModelWithAssetMappings = {
  model: CadModelOptions;
  assetMappings: CdfAssetMapping[];
};
