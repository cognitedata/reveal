import { type CadModelOptions } from '../../components/Reveal3DResources/types';
import { type ClassicCadAssetMapping } from '../../components/CacheProvider/cad/ClassicAssetMapping';

export type ModelWithAssetMappings = {
  model: CadModelOptions;
  assetMappings: ClassicCadAssetMapping[];
};
