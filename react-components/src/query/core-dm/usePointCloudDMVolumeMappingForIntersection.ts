import { type AnyIntersection, type DMInstanceRef } from '@cognite/reveal';
import { UsePointCloudDMVolumeMappingForIntersectionContext } from './usePointCloudDMVolumeMappingForIntersection.context';
import { type Source } from '../../data-providers/FdmSDK';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useContext, useMemo } from 'react';
import { isPointCloudVolumeIntersection } from './typeGuards';
import { queryKeys } from '../../utilities/queryKeys';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { inspectNodes } from '../../components/CacheProvider/requests';

export type PointCloudDMVolumeMappingWithViews = {
  views: Source[];
  assetInstance: DMInstanceRef;
};

export const usePointCloudDMVolumeMappingForIntersection = (
  intersection: AnyIntersection | undefined
): UseQueryResult<PointCloudDMVolumeMappingWithViews[]> => {
  const { useFdmSdk, usePointCloudDMVolumeMappingForAssetInstances } = useContext(
    UsePointCloudDMVolumeMappingForIntersectionContext
  );

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
      const result: PointCloudDMVolumeMappingWithViews[] = await Promise.all(
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
