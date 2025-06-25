import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import { type CadModelOptions } from '../../components/Reveal3DResources/types';
import { type ThreeDModelFdmMappings } from '../types';
import { DEFAULT_QUERY_STALE_TIME } from '../../utilities/constants';
import { useFdmNodeCache } from '../../components/CacheProvider/CacheProvider';

export const useFdmAssetMappings = (
  fdmAssetExternalIds: DmsUniqueIdentifier[],
  models: CadModelOptions[]
): UseQueryResult<ThreeDModelFdmMappings[]> => {
  const nodeCacheContent = useFdmNodeCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'fdm-asset-mappings',
      fdmAssetExternalIds,
      models.map((model) => [model.modelId, model.revisionId])
    ],
    queryFn: async () =>
      await nodeCacheContent.getMappingsForFdmInstances(fdmAssetExternalIds, models),
    enabled: fdmAssetExternalIds.length > 0 && models.length > 0,
    staleTime: DEFAULT_QUERY_STALE_TIME
  });
};
