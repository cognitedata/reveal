import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { type CadModelOptions } from '../../components';
import { type ModelWithAssetMappings } from './ModelWithAssetMappings';
import { useAssetMappingAndNode3DCache } from '../../components/CacheProvider/CacheProvider';
import { useIsCoreDmOnly } from '../useIsCoreDmOnly';

export const useAssetMappedNodesForRevisions = (
  cadModels: CadModelOptions[]
): UseQueryResult<ModelWithAssetMappings[]> => {
  const assetMappingAndNode3DCache = useAssetMappingAndNode3DCache();

  const isCoreDmOnly = useIsCoreDmOnly();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'models-asset-mappings',
      ...cadModels.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    queryFn: async () => {
      const fetchPromises = cadModels.map(
        async (model) =>
          await assetMappingAndNode3DCache
            .getAssetMappingsForModel(model.modelId, model.revisionId)
            .then((assetMappings) => ({ model, assetMappings }))
      );
      return await Promise.all(fetchPromises);
    },
    staleTime: Infinity,
    enabled: cadModels.length > 0 && !isCoreDmOnly
  });
};
