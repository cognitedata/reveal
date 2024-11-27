/*!
 * Copyright 2024 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type DMVolumeModelDataResult } from '../../components/Reveal3DResources/types';
import {
  type COGNITE_ASSET_SOURCE,
  type COGNITE_POINT_CLOUD_VOLUME_SOURCE
} from '../../data-providers/core-dm-provider/dataModels';
import { useFdmSdk } from '../../components/RevealCanvas/SDKProvider';
import {
  getDMSModelsForIds,
  getDMSRevisionsForRevisionIdsAndModelRefs
} from '../../data-providers/utils/getDMSModelRevisionRefs';
import {
  type AssetProperties,
  type PointCloudVolumeObject3DProperties
} from '../../data-providers/core-dm-provider/utils/filters';
import { type PointCloudVolumeWithAsset } from '../../components/CacheProvider/types';
import { type DmsUniqueIdentifier, type FdmSDK } from '../../data-providers/FdmSDK';
import { pointCloudDMVolumesQuery } from './pointCloudDMVolumesQuery';
import { queryKeys } from '../../utilities/queryKeys';
import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';

export const usePointCloudDMVolumes = (
  modelOptions: Array<AddModelOptions<ClassicDataSourceType>>
): UseQueryResult<DMVolumeModelDataResult[]> => {
  const fdmSdk = useFdmSdk();
  return useQuery({
    queryKey: [
      queryKeys.pointCloudDMVolumeMappings(),
      ...modelOptions.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    queryFn: async () => {
      return await Promise.all(
        modelOptions.map(async (model) => {
          const pointCloudDMVolumeWithAsset = await getPointCloudDMVolumesForModel(
            model.modelId,
            model.revisionId,
            fdmSdk
          );
          return {
            model,
            pointCloudDMVolumeWithAsset
          };
        })
      );
    },
    staleTime: Infinity,
    enabled: modelOptions.length > 0
  });
};

const getPointCloudDMVolumesForModel = async (
  modelId: number,
  revisionId: number,
  fdmSdk: FdmSDK
): Promise<PointCloudVolumeWithAsset[]> => {
  const modelRef = await getDMSModelsForIds([modelId], fdmSdk);
  const revisionRefs = await getDMSRevisionsForRevisionIdsAndModelRefs(
    modelRef,
    [revisionId],
    fdmSdk
  );
  const query = pointCloudDMVolumesQuery(revisionRefs);

  const response = await fdmSdk.queryNodesAndEdges<
    typeof query,
    [
      {
        source: typeof COGNITE_POINT_CLOUD_VOLUME_SOURCE;
        properties: PointCloudVolumeObject3DProperties;
      },
      {
        source: typeof COGNITE_ASSET_SOURCE;
        properties: AssetProperties;
      }
    ]
  >(query);

  const pointCloudVolumes = response.items.pointCloudVolumes.map((pointCloudVolume) => {
    const pointCloudVolumeProperties =
      pointCloudVolume.properties.cdf_cdm['CognitePointCloudVolume/v1'];

    const revisionIndex = (pointCloudVolumeProperties.revisions as DmsUniqueIdentifier[]).indexOf(
      revisionRefs[0]
    );

    return {
      externalId: pointCloudVolume.externalId,
      space: pointCloudVolume.space,
      volumeReference: (pointCloudVolumeProperties.volumeReferences as string[])?.[revisionIndex],
      object3D: pointCloudVolumeProperties.object3D as DmsUniqueIdentifier,
      volumeType: pointCloudVolumeProperties.volumeType as string,
      volume: pointCloudVolumeProperties.volume as number[]
    };
  });

  const assets = response.items.assets.map((asset) => {
    const assetProperties = asset.properties.cdf_cdm['CogniteAsset/v1'];
    return {
      externalId: asset.externalId,
      space: asset.space,
      object3D: assetProperties.object3D as DmsUniqueIdentifier,
      name: assetProperties.name,
      description: assetProperties.description
    };
  });

  const pointCloudVolumesWithAssets = pointCloudVolumes.map((pointCloudVolume) => {
    const asset = assets.find((asset) => {
      const assetObject3D = asset.object3D;
      return (
        assetObject3D.space === pointCloudVolume.object3D.space &&
        assetObject3D.externalId === pointCloudVolume.object3D.externalId
      );
    });

    return {
      ...pointCloudVolume,
      asset
    };
  });
  return pointCloudVolumesWithAssets;
};
