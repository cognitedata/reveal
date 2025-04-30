/*!
 * Copyright 2024 Cognite AS
 */
import { type AnyIntersection, type DMInstanceRef } from '@cognite/reveal';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { usePointCloudDMVolumes } from './usePointCloudDMVolumes';
import { useMemo } from 'react';
import { useModelIdRevisionIdFromModelOptions } from '../../hooks/useModelIdRevisionIdFromModelOptions';
import { isDefined } from '../../utilities/isDefined';
import { type Source, type DmsUniqueIdentifier } from '../../data-providers';
import { queryKeys } from '../../utilities/queryKeys';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import { usePointCloudModelRevisionIdsFromReveal } from '../usePointCloudModelRevisionIdsFromReveal';
import { useFdmSdk } from '../../components/RevealCanvas/SDKProvider';
import { inspectNodes } from '../../components/CacheProvider/requests';
import { isPointCloudVolumeIntersection } from './typeGuards';

export type PointCloudVolumeMappedAssetData = {
  volumeInstanceRef: DMInstanceRef;
  asset: DMInstanceRef & AssetProperties;
};

export type PointCloudFdmVolumeMappingWithViews = {
  views: Source[];
  assetInstance: DMInstanceRef;
};

export const usePointCloudVolumeMappingForAssetInstances = (
  assetInstanceRefs: DmsUniqueIdentifier[]
): PointCloudVolumeMappedAssetData[] => {
  const { data: models } = usePointCloudModelRevisionIdsFromReveal();
  const addClassicModelOptionsResults = useModelIdRevisionIdFromModelOptions(models);

  const classicModelOptions = useMemo(
    () => addClassicModelOptionsResults.map((result) => result.data).filter(isDefined),
    [addClassicModelOptionsResults]
  );
  const { data: pointCloudVolumeResults } = usePointCloudDMVolumes(classicModelOptions);

  return useMemo(() => {
    if (classicModelOptions.length === 0 || assetInstanceRefs.length === 0) {
      return [];
    }

    const result: PointCloudVolumeMappedAssetData[] =
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
      ) ?? [];

    return result;
  }, [classicModelOptions, assetInstanceRefs]);
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

  const volumeMappings = usePointCloudVolumeMappingForAssetInstances(assetInstanceRefs);

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
        return [];
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
