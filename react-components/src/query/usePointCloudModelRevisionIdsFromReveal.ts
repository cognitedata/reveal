/*!
 * Copyright 2024 Cognite AS
 */
import { useMemo } from 'react';
import { use3dModels } from '../hooks';
import { type ModelRevisionId } from '../components/CacheProvider/types';
import {
  CognitePointCloudModel,
  type DataSourceType,
  type DMDataSourceType,
  isDMPointCloudModel
} from '@cognite/reveal';
import { getModelIdAndRevisionIdFromExternalId } from '../hooks/network/getModelIdAndRevisionIdFromExternalId';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '../utilities/queryKeys';
import { getModelKeys } from '../utilities/getModelKeys';

type PointCloudModelRevisionIdAndType = ModelRevisionId & { type: 'pointcloud' };

export const usePointCloudModelRevisionIdsFromReveal = (): UseQueryResult<
  PointCloudModelRevisionIdAndType[]
> => {
  const viewerModels = use3dModels();
  const fdmSdk = useFdmSdk();

  const dmModels: Array<CognitePointCloudModel<DMDataSourceType>> = useMemo(() => {
    return viewerModels
      .filter(
        (model): model is CognitePointCloudModel<DataSourceType> =>
          model instanceof CognitePointCloudModel && model.type === 'pointcloud'
      )
      .filter(isDMPointCloudModel);
  }, [viewerModels]);

  const modelKeys = useMemo(() => getModelKeys(dmModels), [dmModels]);

  const queryKey = [queryKeys.pointCloudDMModelIdRevisionIds(), modelKeys];

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
