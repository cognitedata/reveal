import { useContext, useMemo } from 'react';
import { type ModelRevisionId } from '../components/CacheProvider/types';
import {
  type CognitePointCloudModel,
  type DataSourceType,
  type DMDataSourceType,
  isDMPointCloudModel
} from '@cognite/reveal';
import { getModelIdAndRevisionIdFromExternalId } from '../hooks/network/getModelIdAndRevisionIdFromExternalId';
import { queryKeys } from '../utilities/queryKeys';
import { getModelKeys } from '../utilities/getModelKeys';
import { UsePointCloudModelRevisionIdsFromRevealContext } from './usePointCloudModelRevisionIdsFromReveal.context';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

type PointCloudModelRevisionIdAndType = ModelRevisionId & { type: 'pointcloud' };

export const usePointCloudModelRevisionIdsFromReveal = (): UseQueryResult<
  PointCloudModelRevisionIdAndType[]
> => {
  const { use3dModels, useFdmSdk } = useContext(UsePointCloudModelRevisionIdsFromRevealContext);

  const viewerModels = use3dModels();
  const fdmSdk = useFdmSdk();

  const dmModels: Array<CognitePointCloudModel<DMDataSourceType>> = useMemo(() => {
    return viewerModels
      .filter(
        (model): model is CognitePointCloudModel<DataSourceType> => model.type === 'pointcloud'
      )
      .filter(isDMPointCloudModel);
  }, [viewerModels]);

  const modelKeys = useMemo(
    () => getModelKeys(dmModels.map((model) => model.modelIdentifier)),
    [dmModels]
  );

  const queryKey = [queryKeys.pointCloudDMModelIdRevisionIds(modelKeys)];

  const queryFn = async (): Promise<PointCloudModelRevisionIdAndType[]> => {
    const modelRevisionIds: PointCloudModelRevisionIdAndType[] = await Promise.all(
      dmModels.map(async (model) => {
        const { modelId, revisionId } = await getModelIdAndRevisionIdFromExternalId(
          model.modelIdentifier.revisionExternalId,
          model.modelIdentifier.revisionSpace,
          fdmSdk
        );
        return {
          modelId,
          revisionId,
          type: 'pointcloud'
        };
      })
    );
    return modelRevisionIds;
  };

  return useQuery({
    queryKey,
    queryFn,
    staleTime: Infinity
  });
};
