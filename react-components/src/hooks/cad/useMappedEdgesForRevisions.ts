import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { type ModelRevisionToConnectionMap } from '../../components/CacheProvider/types';
import { useFdmCadNodeCache } from '../../components/CacheProvider/CacheProvider';

export const useMappedEdgesForRevisions = (
  modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
  fetchViews = false,
  enabled = true
): UseQueryResult<ModelRevisionToConnectionMap> => {
  const content = useFdmCadNodeCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      ...modelRevisionIds.map((modelRevisionId) => modelRevisionId.revisionId.toString()).sort(),
      fetchViews
    ],
    queryFn: async () => await content.getAllMappingExternalIds(modelRevisionIds, fetchViews),
    staleTime: Infinity,
    enabled: enabled && modelRevisionIds.length > 0
  });
};
