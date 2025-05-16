/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteInternalId } from '@cognite/sdk';
import {
  type ModelRevisionAssetNodesResult,
  type ModelRevisionId
} from '../../components/CacheProvider/types';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useAssetMappingAndNode3DCache } from '../../components/CacheProvider/CacheProvider';

export const useNodesForAssets = (
  models: ModelRevisionId[],
  assetIds: CogniteInternalId[]
): UseQueryResult<ModelRevisionAssetNodesResult[]> => {
  const assetMappingAndNode3DCache = useAssetMappingAndNode3DCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'asset-mapping-nodes',
      ...models.map((model) => `${model.modelId}/${model.revisionId}`),
      ...assetIds.map((id) => `${id}`)
    ],
    queryFn: async () => {
      const modelAndNodeMapPromises = models.map(async (model) => {
        const nodeMap = await assetMappingAndNode3DCache.getNodesForAssetIds(
          model.modelId,
          model.revisionId,
          assetIds
        );
        return { modelId: model.modelId, revisionId: model.revisionId, assetToNodeMap: nodeMap };
      });

      return await Promise.all(modelAndNodeMapPromises);
    },
    staleTime: Infinity,
    enabled: assetIds.length > 0
  });
};
