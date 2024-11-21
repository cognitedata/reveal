/*!
 * Copyright 2024 Cognite AS
 */
import {
  type AddModelOptions,
  type ClassicDataSourceType,
  type DMInstanceRef
} from '@cognite/reveal';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { usePointCloudDMVolume } from './usePointCloudDMVolume';
import { use3dModels } from '../../hooks';
import { useMemo } from 'react';
import { useModelIdRevisionIdFromModelOptions } from '../../hooks/useModelIdRevisionIdFromModelOptions';
import { isDefined } from '../../utilities/isDefined';
import {
  type PointCloudModelOptions,
  type CadPointCloudModelWithModelIdRevisionId
} from '../../components/Reveal3DResources/types';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { queryKeys } from '../../utilities/queryKeys';
import { type AssetProperties } from '../../data-providers/utils/filters';
import { useModelRevisionIds } from '../useModelRevisionIds';

export type PointCloudVolumeMappedAssetData = {
  volumeInstanceRef: DMInstanceRef;
  asset: DMInstanceRef & AssetProperties;
};

export const usePointCloudVolumeMappingForAssetId = (
  assetInstanceRefs: DmsUniqueIdentifier[]
): UseQueryResult<PointCloudVolumeMappedAssetData[]> => {
  const models = useModelRevisionIds();
  const addClassicModelOptionsResults = useModelIdRevisionIdFromModelOptions(models);

  const classicModelOptions = useMemo(
    () => addClassicModelOptionsResults.map((result) => result.data).filter(isDefined),
    [addClassicModelOptionsResults]
  );

  const modelsWithModelIdAndRevision = useModelsWithModelIdAndRevision(
    models as PointCloudModelOptions[],
    classicModelOptions
  );
  const { data: pointCloudVolumeResults, isLoading } = usePointCloudDMVolume(
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
        return [];
      }
      const result: PointCloudVolumeMappedAssetData[] = [];

      pointCloudVolumeResults?.forEach((pointCloudVolumeDataResult) => {
        pointCloudVolumeDataResult.pointCloudDMVolumeWithAsset.forEach(
          (pointCloudDMVolumeWithAsset) => {
            if (
              assetInstanceRefs.some(
                (assetInstance) =>
                  pointCloudDMVolumeWithAsset.asset !== undefined &&
                  assetInstance.externalId === pointCloudDMVolumeWithAsset.asset.externalId &&
                  assetInstance.space === pointCloudDMVolumeWithAsset.asset.space
              )
            ) {
              result.push({
                volumeInstanceRef: {
                  externalId: pointCloudDMVolumeWithAsset.externalId,
                  space: pointCloudDMVolumeWithAsset.space
                },
                asset: pointCloudDMVolumeWithAsset.asset as DMInstanceRef & AssetProperties
              });
            }
          }
        );
      });

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
): CadPointCloudModelWithModelIdRevisionId[] {
  return useMemo(() => {
    return classicModelOptions.map((model, index) => ({
      modelOptions: models[index],
      ...model
    }));
  }, [classicModelOptions, models]);
}
