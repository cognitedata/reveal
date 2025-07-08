import { type CadModelOptions } from '../../components/Reveal3DResources/types';
import { type ClassicCadAssetMapping } from '../../components/CacheProvider/cad/ClassicCadAssetMapping';

export type ModelWithAssetMappings = {
  model: CadModelOptions;
  assetMappings: ClassicCadAssetMapping[];
};
