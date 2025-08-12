import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { type ModelRevisionToConnectionMap } from '../../components/CacheProvider/types';
import { useFdmCadNodeCache } from '../../components/CacheProvider/CacheProvider';

export const useMappedEdgesForRevisions = (
  modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
  fetchViews = false,
  enabled = true
): UseQueryResult<ModelRevisionToConnectionMap> => {
  const fdmNodeCache = useFdmCadNodeCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      ...modelRevisionIds.map((modelRevisionId) => modelRevisionId.revisionId.toString()).sort(),
      fetchViews
    ],
    queryFn: async () => {
      if (fdmNodeCache === undefined) {
        return new Map();
      }
      return await fdmNodeCache.getAllMappingExternalIds(modelRevisionIds, fetchViews);
    },
    staleTime: Infinity,
    enabled: enabled && modelRevisionIds.length > 0
  });
};
