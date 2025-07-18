import { type CadModelOptions } from '../../components/Reveal3DResources/types';
import {
  type HybridCadAssetMapping,
  type HybridCadAssetTreeIndexMapping
} from '../../components/CacheProvider/cad/assetMappingTypes';

export type ModelWithAssetMappings = {
  model: CadModelOptions;
  assetMappings: HybridCadAssetMapping[];
};

export type ModelWithAssetTreeIndexMappings = {
  model: CadModelOptions;
  assetMappings: HybridCadAssetTreeIndexMapping[];
};
