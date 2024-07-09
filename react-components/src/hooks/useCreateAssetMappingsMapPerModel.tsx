/*!
 * Copyright 2024 Cognite AS
 */

import { CogniteCadModel, type CogniteModel } from '@cognite/reveal';
import { type AssetMapping3D } from '@cognite/sdk';
import { useMemo } from 'react';
import { type ModelWithAssetMappings } from '../components/CacheProvider/AssetMappingAndNode3DCacheProvider';
import { isDefined } from '../utilities/isDefined';

export const useCreateAssetMappingsMapPerModel = (
  models: CogniteModel[],
  assetMappings: ModelWithAssetMappings[] | undefined
): Map<CogniteCadModel, AssetMapping3D[] | undefined> => {
  return useMemo(() => {
    const mappingsPerModel = new Map<CogniteCadModel, AssetMapping3D[] | undefined>();
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
