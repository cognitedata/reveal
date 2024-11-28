import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { CadModelOptions } from '../../components';
import { ModelWithAssetMappings } from './ModelWithAssetMappings';
import { useAssetMappingAndNode3DCache } from '../../components/CacheProvider/CacheProvider';

export const useAssetMappedNodesForRevisions = (
  cadModels: CadModelOptions[]
): UseQueryResult<ModelWithAssetMappings[]> => {
  const assetMappingAndNode3DCache = useAssetMappingAndNode3DCache();

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
    enabled: cadModels.length > 0
  });
};
