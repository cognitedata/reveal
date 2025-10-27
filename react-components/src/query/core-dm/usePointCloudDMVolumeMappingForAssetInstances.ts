import { type DMInstanceRef } from '@cognite/reveal';
import { useMemo, useContext } from 'react';
import { isDefined } from '../../utilities/isDefined';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { UsePointCloudDMVolumeMappingForAssetInstancesContext } from './usePointCloudDMVolumeMappingForAssetInstances.context';

export type PointCloudDMVolumeMappedAssetData = {
  volumeInstanceRef: DMInstanceRef;
  asset: DMInstanceRef & AssetProperties;
};

export const usePointCloudDMVolumeMappingForAssetInstances = (
  assetInstanceRefs: DmsUniqueIdentifier[]
): PointCloudDMVolumeMappedAssetData[] => {
  const {
    usePointCloudModelRevisionIdsFromReveal,
    useModelIdRevisionIdFromModelOptions,
    usePointCloudDMVolumes
  } = useContext(UsePointCloudDMVolumeMappingForAssetInstancesContext);

  const { data: models } = usePointCloudModelRevisionIdsFromReveal();
  const classicAddModelOptions = useModelIdRevisionIdFromModelOptions(models);

  const { data: pointCloudVolumeResults } = usePointCloudDMVolumes(classicAddModelOptions);

  return useMemo(() => {
    if (classicAddModelOptions.length === 0 || assetInstanceRefs.length === 0) {
      return EMPTY_ARRAY;
    }

    const result: PointCloudDMVolumeMappedAssetData[] =
      pointCloudVolumeResults?.flatMap((pointCloudVolumeDataResult) =>
        pointCloudVolumeDataResult.pointCloudDMVolumeWithAsset
          .filter((pointCloudDMVolumeWithAsset) =>
            assetInstanceRefs.some(
              (assetInstance) =>
                pointCloudDMVolumeWithAsset.dmAsset !== undefined &&
                assetInstance.externalId === pointCloudDMVolumeWithAsset.dmAsset.externalId &&
                assetInstance.space === pointCloudDMVolumeWithAsset.dmAsset.space
            )
          )
          .map((pointCloudDMVolumeWithAsset) => {
            if (pointCloudDMVolumeWithAsset.dmAsset === undefined) {
              return undefined;
            }
            return {
              volumeInstanceRef: {
                externalId: pointCloudDMVolumeWithAsset.externalId,
                space: pointCloudDMVolumeWithAsset.space
              },
              asset: pointCloudDMVolumeWithAsset.dmAsset
            };
          })
          .filter(isDefined)
      ) ?? EMPTY_ARRAY;

    return result;
  }, [classicAddModelOptions, assetInstanceRefs]);
};
