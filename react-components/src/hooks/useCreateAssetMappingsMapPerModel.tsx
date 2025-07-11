import { CogniteCadModel, type CogniteModel, type DataSourceType } from '@cognite/reveal';
import { useMemo } from 'react';
import { type ModelWithAssetMappings } from './cad/modelWithAssetMappings';
import { isDefined } from '../utilities/isDefined';
import { type ClassicCadAssetMapping } from '../components/CacheProvider/cad/ClassicCadAssetMapping';

export const useCreateAssetMappingsMapPerModel = (
  models: Array<CogniteModel<DataSourceType>>,
  assetMappings: ModelWithAssetMappings[] | undefined
): Map<CogniteCadModel, ClassicCadAssetMapping[] | undefined> => {
  return useMemo(() => {
    const mappingsPerModel = new Map<CogniteCadModel, ClassicCadAssetMapping[] | undefined>();
    models.forEach((model) => {
      if (!(model instanceof CogniteCadModel)) {
        return;
      }
      const flatAssetsMappingsList =
        assetMappings
          ?.filter((item) => item.model.modelId === model.modelId)
          .map((item) => item.assetMappings)
          .flat()
          .filter(isDefined) ?? [];

      mappingsPerModel.set(model, flatAssetsMappingsList);
    });

    return mappingsPerModel;
  }, [assetMappings, models]);
};
