import { type AddModelOptions } from '@cognite/reveal';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type DmsUniqueIdentifier } from '../data-providers';
import { type ThreeDModelFdmMappings } from '../hooks';
import { queryKeys } from '../utilities/queryKeys';
import { UseHybridMappingsForAssetInstancesContext } from './useHybridMappingsForAssetInstances.context';
import { useContext } from 'react';
import { isFdmKey } from '../components/CacheProvider/idAndKeyTranslation';

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

        const fdmMappings = new Map([...mappings.entries()].filter(([key, _]) => isFdmKey(key)));

        return {
          modelId: model.modelId,
          revisionId: model.revisionId,
          mappings: fdmMappings
        };
      });

      const currentPagesOfAssetMappings = await Promise.all(currentPagesOfAssetMappingsPromises);

      return currentPagesOfAssetMappings;
    },
    enabled: assetInstanceIds.length > 0,
    staleTime: Infinity
  });
};
