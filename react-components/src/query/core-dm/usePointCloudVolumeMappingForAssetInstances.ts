/*!
 * Copyright 2024 Cognite AS
 */
import {
  type AddModelOptions,
  type ClassicDataSourceType,
  type DMInstanceRef
} from '@cognite/reveal';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { usePointCloudDMVolumes } from './usePointCloudDMVolumes';
import { useMemo } from 'react';
import { useModelIdRevisionIdFromModelOptions } from '../../hooks/useModelIdRevisionIdFromModelOptions';
import { isDefined } from '../../utilities/isDefined';
import {
  type PointCloudModelOptions,
  type CadOrPointCloudModelWithModelIdRevisionId
} from '../../components/Reveal3DResources/types';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { queryKeys } from '../../utilities/queryKeys';
import { type AssetProperties } from '../../data-providers/utils/filters';
import { useModelRevisionIdsForPointCloudModels } from '../useModelRevisionIdsForPointCloudModels';
import { EMPTY_ARRAY } from '../../utilities/constants';

export type PointCloudVolumeMappedAssetData = {
  volumeInstanceRef: DMInstanceRef;
  asset: DMInstanceRef & AssetProperties;
};

export const usePointCloudVolumeMappingForAssetInstances = (
  assetInstanceRefs: DmsUniqueIdentifier[]
): UseQueryResult<PointCloudVolumeMappedAssetData[]> => {
  const { data: models } = useModelRevisionIdsForPointCloudModels();
  const addClassicModelOptionsResults = useModelIdRevisionIdFromModelOptions(models);

  const classicModelOptions = useMemo(
    () => addClassicModelOptionsResults.map((result) => result.data).filter(isDefined),
    [addClassicModelOptionsResults]
  );

  const modelsWithModelIdAndRevision = useModelsWithModelIdAndRevision(
    models as PointCloudModelOptions[],
    classicModelOptions
  );
  const { data: pointCloudVolumeResults, isLoading } = usePointCloudDMVolumes(
    modelsWithModelIdAndRevision
  );

  return useQuery({
    queryKey: [
      queryKeys.pointCloudDMVolumeAssetMappings(),
      modelsWithModelIdAndRevision.map((model) => `${model.modelId}/${model.revisionId}`).sort(),
      assetInstanceRefs
    ],
    queryFn: async () => {
      if (modelsWithModelIdAndRevision.length === 0 || assetInstanceRefs.length === 0) {
        return EMPTY_ARRAY;
      }

      const result: PointCloudVolumeMappedAssetData[] =
        pointCloudVolumeResults?.flatMap((pointCloudVolumeDataResult) =>
          pointCloudVolumeDataResult.pointCloudDMVolumeWithAsset
            .filter((pointCloudDMVolumeWithAsset) =>
              assetInstanceRefs.some(
                (assetInstance) =>
                  pointCloudDMVolumeWithAsset.asset !== undefined &&
                  assetInstance.externalId === pointCloudDMVolumeWithAsset.asset.externalId &&
                  assetInstance.space === pointCloudDMVolumeWithAsset.asset.space
              )
            )
            .map((pointCloudDMVolumeWithAsset) => {
              if (pointCloudDMVolumeWithAsset.asset === undefined) {
                return undefined;
              }
              return {
                volumeInstanceRef: {
                  externalId: pointCloudDMVolumeWithAsset.externalId,
                  space: pointCloudDMVolumeWithAsset.space
                },
                asset: pointCloudDMVolumeWithAsset.asset
              };
            })
            .filter(isDefined)
        ) ?? EMPTY_ARRAY;

      return result;
    },
    staleTime: Infinity,
    enabled:
      pointCloudVolumeResults !== undefined &&
      pointCloudVolumeResults.length > 0 &&
      assetInstanceRefs.length > 0 &&
      !isLoading
  });
};

function useModelsWithModelIdAndRevision(
  models: PointCloudModelOptions[],
  classicModelOptions: Array<AddModelOptions<ClassicDataSourceType>>
): CadOrPointCloudModelWithModelIdRevisionId[] {
  return useMemo(() => {
    return classicModelOptions.map((model, index) => ({
      modelOptions: models[index],
      ...model
    }));
  }, [classicModelOptions, models]);
}
