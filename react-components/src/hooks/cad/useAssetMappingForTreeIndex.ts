import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchAncestorNodesForTreeIndex } from '../../components/CacheProvider/requests';
import { type AnyIntersection } from '@cognite/reveal';
import { type ClassicCadNodeAssetMappingResult } from '../../components/CacheProvider/cad/ClassicCadAssetMappingCache';
import { useSDK } from '../../components/RevealCanvas/SDKProvider';
import { useClassicCadAssetMappingCache } from '../../components/CacheProvider/CacheProvider';

export const useAssetMappingForTreeIndex = (
  intersection: AnyIntersection | undefined
): UseQueryResult<ClassicCadNodeAssetMappingResult> => {
  const assetMappingAndNode3DCache = useClassicCadAssetMappingCache();
  const cdfClient = useSDK();

  const isCadModel = intersection?.type === 'cad';

  const [modelId, revisionId, treeIndex] = isCadModel
    ? [intersection.model.modelId, intersection.model.revisionId, intersection.treeIndex]
    : [undefined, undefined, undefined];

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'tree-index-asset-mapping',
      `${modelId}/${revisionId}`,
      treeIndex
    ],
    queryFn: async () => {
      const areInputsDefined =
        modelId !== undefined && revisionId !== undefined && treeIndex !== undefined;

      if (!areInputsDefined) {
        return { mappings: [] };
      }

      const ancestors = await fetchAncestorNodesForTreeIndex(
        modelId,
        revisionId,
        treeIndex,
        cdfClient
      );

      return await assetMappingAndNode3DCache.getAssetMappingsForLowestAncestor(
        modelId,
        revisionId,
        ancestors
      );
    },
    staleTime: Infinity
  });
};
