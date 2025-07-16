import { type CadModelOptions } from '../../components/Reveal3DResources/types';
import {
  type ClassicCadAssetTreeIndexMapping,
  type ClassicCadAssetMapping
} from '../../components/CacheProvider/cad/assetMappingTypes';

export type ModelWithAssetMappings = {
  model: CadModelOptions;
  assetMappings: ClassicCadAssetMapping[];
};

export type ModelWithAssetTreeIndexMappings = {
  model: CadModelOptions;
  assetMappings: ClassicCadAssetTreeIndexMapping[];
};
