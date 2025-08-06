import { type AddModelOptions } from '@cognite/reveal';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type DmsUniqueIdentifier } from '../data-providers';
import { type ThreeDModelFdmMappings } from '../hooks';
import { queryKeys } from '../utilities/queryKeys';
import { UseHybridMappingsForAssetInstancesContext } from './useHybridMappingsForAssetInstances.context';
import { useContext } from 'react';
import { FdmKey } from '../components/CacheProvider/types';
import { Node3D } from '@cognite/sdk';

export const useHybridMappingsForAssetInstances = (
  models: AddModelOptions[],
  assetInstanceIds: DmsUniqueIdentifier[]
): UseQueryResult<ThreeDModelFdmMappings[]> => {
  const { useClassicCadAssetMappingCache } = useContext(UseHybridMappingsForAssetInstancesContext);
  const hybridCache = useClassicCadAssetMappingCache();

  return useQuery({
    queryKey: queryKeys.hybridDmAssetMappingsForInstances(
      models.map((model) => `${model.modelId}-${model.revisionId}`),
      assetInstanceIds
    ),
    queryFn: async () => {
      const currentPagesOfAssetMappingsPromises = models.map(async (model) => {
        const mappings = await hybridCache.getNodesForInstanceIds(
          model.modelId,
          model.revisionId,
          assetInstanceIds
        );

        return {
          modelId: model.modelId,
          revisionId: model.revisionId,
          mappings: mappings as Map<FdmKey, Node3D[]>
        };
      });

      const currentPagesOfAssetMappings = await Promise.all(currentPagesOfAssetMappingsPromises);

      return currentPagesOfAssetMappings;
    },
    enabled: assetInstanceIds.length > 0,
    staleTime: Infinity
  });
};
