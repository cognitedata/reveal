import { type CadModelOptions } from '../../components/Reveal3DResources/types';
import { type HybridCadAssetMapping } from '../../components/CacheProvider/cad/assetMappingTypes';

export type ModelWithAssetMappings = {
  model: CadModelOptions;
  assetMappings: HybridCadAssetMapping[];
};
