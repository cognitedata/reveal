/*!
 * Copyright 2024 Cognite AS
 */

import { CogniteCadModel, type CogniteModel, type DataSourceType } from '@cognite/reveal';
import { useMemo } from 'react';
import { type ModelWithAssetMappings } from './cad/ModelWithAssetMappings';
import { isDefined } from '../utilities/isDefined';
import { type CdfAssetMapping } from '../components/CacheProvider/types';

export const useCreateAssetMappingsMapPerModel = (
  models: Array<CogniteModel<DataSourceType>>,
  assetMappings: ModelWithAssetMappings[] | undefined
): Map<CogniteCadModel, CdfAssetMapping[] | undefined> => {
  return useMemo(() => {
    const mappingsPerModel = new Map<CogniteCadModel, CdfAssetMapping[] | undefined>();
    models.forEach((model) => {
      if (!(model instanceof CogniteCadModel)) {
        return;
      }
      const flatAssetsMappingsList =
        assetMappings
          ?.filter((item) => item.model.modelId === model.modelId)
          .map((item) => item.assetMappings)
          .flat()
          .filter(isDefined) ?? createEmptyArray();

      mappingsPerModel.set(model, flatAssetsMappingsList);
    });

    return mappingsPerModel;
  }, [assetMappings, models]);
};
