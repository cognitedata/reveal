import { type AnyIntersection } from '@cognite/reveal';
import { type FdmNodeDataPromises } from '../../components/CacheProvider/types';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useFdmNodeCache } from '../../components/CacheProvider/CacheProvider';
import assert from 'assert';

export const useFdm3dNodeDataPromises = (
  intersection: AnyIntersection | undefined
): UseQueryResult<FdmNodeDataPromises> => {
  const content = useFdmNodeCache();

  const isCadModel = intersection?.type === 'cad';

  const [modelId, revisionId, treeIndex] = isCadModel
    ? [intersection.model.modelId, intersection.model.revisionId, intersection.treeIndex]
    : [undefined, undefined, undefined];

  const enableQuery = content !== undefined && isCadModel && treeIndex !== undefined;

  const result = useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'tree-index-to-external-id',
      modelId,
      revisionId,
      treeIndex
    ],
    queryFn: async () => {
      assert(enableQuery);
      return content.getClosestParentDataPromises(modelId, revisionId, treeIndex);
    },

    enabled: enableQuery
  });

  return result;
};
