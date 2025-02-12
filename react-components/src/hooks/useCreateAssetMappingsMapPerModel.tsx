/*!
 * Copyright 2024 Cognite AS
 */

import { CogniteCadModel, type CogniteModel, type DataSourceType } from '@cognite/reveal';
import { type AssetMapping3D } from '@cognite/sdk';
import { useMemo } from 'react';
import { type ModelWithAssetMappings } from './cad/ModelWithAssetMappings';
import { isDefined } from '../utilities/isDefined';
import { EMPTY_ARRAY } from '../utilities/constants';

export const useCreateAssetMappingsMapPerModel = (
  models: Array<CogniteModel<DataSourceType>>,
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
          .filter(isDefined) ?? EMPTY_ARRAY;

      mappingsPerModel.set(model, flatAssetsMappingsList);
    });

    return mappingsPerModel;
  }, [assetMappings, models]);
};
