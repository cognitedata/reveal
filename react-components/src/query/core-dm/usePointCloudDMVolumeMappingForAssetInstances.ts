import { type AnyIntersection, type DMInstanceRef } from '@cognite/reveal';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useMemo, useContext } from 'react';
import { isDefined } from '../../utilities/isDefined';
import { type Source, type DmsUniqueIdentifier } from '../../data-providers';
import { queryKeys } from '../../utilities/queryKeys';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { isPointCloudVolumeIntersection } from './typeGuards';
import { UsePointCloudDMVolumeMappingForAssetInstancesContext } from './usePointCloudDMVolumeMappingForAssetInstances.context';
import { inspectNodes } from '../../components/CacheProvider/requests';
import { useFdmSdk } from '../../components/RevealCanvas/SDKProvider';

export type PointCloudDMVolumeMappedAssetData = {
  volumeInstanceRef: DMInstanceRef;
  asset: DMInstanceRef & AssetProperties;
};

export type PointCloudFdmVolumeMappingWithViews = {
  views: Source[];
  assetInstance: DMInstanceRef;
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

export const usePointCloudFdmVolumeMappingForIntersection = (
  intersection: AnyIntersection | undefined
): UseQueryResult<PointCloudFdmVolumeMappingWithViews[]> => {
  const fdmSdk = useFdmSdk();

  const assetInstanceRefs = useMemo(() => {
    if (isPointCloudVolumeIntersection(intersection)) {
      const assetRef = intersection.volumeMetadata?.assetRef;
      if (assetRef !== undefined) {
        return [assetRef];
      }
    }
    return [];
  }, [intersection]);

  const volumeMappings = usePointCloudDMVolumeMappingForAssetInstances(assetInstanceRefs);

  return useQuery({
    queryKey: [
      queryKeys.pointCloudDMVolumeAssetMappingsWithViews(
        assetInstanceRefs
          .map((assetInstance) => `${assetInstance.externalId}/${assetInstance.space}`)
          .sort()
      )
    ],
    queryFn: async () => {
      if (volumeMappings === undefined || volumeMappings.length === 0) {
        return EMPTY_ARRAY;
      }
      const result: PointCloudFdmVolumeMappingWithViews[] = await Promise.all(
        volumeMappings.map(async (volumeMapping) => {
          const assetInstance = {
            externalId: volumeMapping.asset.externalId,
            space: volumeMapping.asset.space
          };
          const nodeInspectionResults = await inspectNodes(fdmSdk, [assetInstance]);
          return {
            views: nodeInspectionResults.items[0].inspectionResults.involvedViews,
            assetInstance: volumeMapping.asset
          };
        })
      );
      return result;
    },
    enabled: volumeMappings !== undefined && volumeMappings.length > 0
  });
};
