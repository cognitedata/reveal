/*!
 * Copyright 2023 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import { type CadModelOptions } from '../../components/Reveal3DResources/types';
import { type ThreeDModelFdmMappings } from '../types';
import { DEFAULT_QUERY_STALE_TIME } from '../../utilities/constants';
import { useAssetMappingAndNode3DCache } from '../../components/CacheProvider/CacheProvider';
import { useAssetMappedNodesForRevisions } from './useAssetMappedNodesForRevisions';
import { isDefined } from '../../utilities/isDefined';
import {
  createFdmKey,
  createModelRevisionKey
} from '../../components/CacheProvider/idAndKeyTranslation';
import { useMemo } from 'react';
import { queryKeys } from '../../utilities/queryKeys';

export const useHybridAssetMappings = (
  hybridFdmAssetExternalIds: DmsUniqueIdentifier[],
  models: CadModelOptions[]
): UseQueryResult<ThreeDModelFdmMappings[]> => {
  const assetMappingAndNode3DCache = useAssetMappingAndNode3DCache();
  const { data: modelWithAssetMappings } = useAssetMappedNodesForRevisions(models);

  const relevantHybridAssetMappings = modelWithAssetMappings?.map((data) => {
    const mappings = data.assetMappings.filter(
      (assetMapping) =>
        isDefined(assetMapping.assetInstanceId) &&
        isDefined(
          hybridFdmAssetExternalIds.find(
            (id) =>
              id.externalId === assetMapping.assetInstanceId?.externalId &&
              id.space === assetMapping.assetInstanceId?.space
          )
        )
    );
    return {
      model: data.model,
      mappings
    };
  });

  const hybridFdmAssetExternalIdsKeys = useMemo(
    () => hybridFdmAssetExternalIds.map(createFdmKey).sort(),
    [hybridFdmAssetExternalIds]
  );

  const modelKeys = useMemo(
    () => models.map((model) => createModelRevisionKey(model.modelId, model.revisionId)),
    [models]
  );

  return useQuery({
    queryKey: queryKeys.hybridAssetMappingsFromFdm(hybridFdmAssetExternalIdsKeys, modelKeys),
    queryFn: async () => {
      const modelAndNodeMapPromises = models.map(async (model) => {
        const mappingsPerModel =
          relevantHybridAssetMappings
            ?.filter(
              (data) =>
                data.model.modelId === model.modelId && data.model.revisionId === model.revisionId
            )
            .map((data) => data.mappings)
            .flat() ?? [];

        const nodeMap = await assetMappingAndNode3DCache.getNodesForAssetInstancesInHybridMappings(
          model.modelId,
          model.revisionId,
          mappingsPerModel
        );
        return { modelId: model.modelId, revisionId: model.revisionId, mappings: nodeMap };
      });

      return await Promise.all(modelAndNodeMapPromises);
    },
    enabled: hybridFdmAssetExternalIds.length > 0 && models.length > 0,
    staleTime: DEFAULT_QUERY_STALE_TIME
  });
};
