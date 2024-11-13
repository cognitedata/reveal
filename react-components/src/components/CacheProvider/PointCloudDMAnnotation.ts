/*!
 * Copyright 2024 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  type CadPointCloudModelWithModelIdRevisionId,
  type PointCloudModelOptions
} from '../Reveal3DResources/types';
import { type QueryRequest } from '@cognite/sdk';
import {
  COGNITE_ASSET_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE
} from '../../data-providers/core-dm-provider/dataModels';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { useFdmSdk } from '../RevealCanvas/SDKProvider';
import {
  getDMSModelsForIds,
  getDMSRevisionsForRevisionIdsAndModelRefs
} from '../../data-providers/utils/getDMSModelRevisionRefs';
import {
  ASSET_PROPERTIES_LIST,
  type AssetProperties,
  getRevisionContainsAnyFilter,
  isPointCloudVolumeFilter,
  POINT_CLOUD_VOLUME_REVISIONS_OBJECT3D_PROPERTIES_LIST,
  type PointCloudVolumeObject3DProperties
} from '../../data-providers/utils/filters';
import { type PointCloudVolumeWithAsset } from './types';
import { type FdmSDK } from '../../data-providers/FdmSDK';

export const usePointCloudDMAnnotation = (
  modelsData: CadPointCloudModelWithModelIdRevisionId[]
): UseQueryResult<
  Array<{
    model: PointCloudModelOptions;
    pointCloudDMVolumeWithAsset: PointCloudVolumeWithAsset[];
  }>
> => {
  const fdmSdk = useFdmSdk();
  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'models-pointcloud-dm-annotations-mappings',
      ...modelsData.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    queryFn: async () => {
      return await Promise.all(
        modelsData.map(async (model) => {
          const pointCloudDMVolumeWithAsset = await getPointCloudDMAnnotationsForModel(
            model.modelId,
            model.revisionId,
            fdmSdk
          );
          return {
            model: model.modelOptions,
            pointCloudDMVolumeWithAsset
          };
        })
      );
    },
    staleTime: Infinity,
    enabled: modelsData.length > 0
  });
};

const getPointCloudDMAnnotationsForModel = async (
  modelId: number,
  revisionId: number,
  fdmSdk: FdmSDK
): Promise<PointCloudVolumeWithAsset[]> => {
  const modelRef = await getDMSModelsForIds([modelId], fdmSdk);
  const revisionRef = await getDMSRevisionsForRevisionIdsAndModelRefs(
    modelRef,
    [revisionId],
    fdmSdk
  );
  const query = getPointCloudDMAnnotationsQuery(revisionRef);

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
    const pointCloudVolumeProperties = pointCloudVolume.properties.cdf_cdm[
      'CognitePointCloudVolume/v1'
    ] as PointCloudVolumeObject3DProperties;

    const revisionIndex = pointCloudVolumeProperties.revisions.indexOf(revisionRef[0]);

    return {
      externalId: pointCloudVolume.externalId,
      space: pointCloudVolume.space,
      volumeReference: pointCloudVolumeProperties.volumeReferences.at(revisionIndex) ?? 'unknown',
      object3D: pointCloudVolumeProperties.object3D,
      volumeType: pointCloudVolumeProperties.volumeType,
      volume: pointCloudVolumeProperties.volume
    };
  });

  const assets = response.items.assets.map((asset) => {
    const assetProperties = asset.properties.cdf_cdm['CogniteAsset/v1'] as AssetProperties;
    return {
      externalId: asset.externalId,
      space: asset.space,
      object3D: assetProperties.object3D,
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

const getPointCloudDMAnnotationsQuery = (revisionRef: DmsUniqueIdentifier[]): QueryRequest => {
  return {
    with: {
      pointCloudVolumes: {
        nodes: {
          filter: {
            and: [
              isPointCloudVolumeFilter,
              getRevisionContainsAnyFilter([
                {
                  externalId: revisionRef[0].externalId,
                  space: revisionRef[0].space
                }
              ])
            ]
          }
        },
        limit: 1000
      },
      object3D: {
        nodes: {
          from: 'pointCloudVolumes',
          through: {
            view: COGNITE_POINT_CLOUD_VOLUME_SOURCE,
            identifier: 'object3D'
          },
          direction: 'outwards'
        },
        limit: 1000
      },
      assets: {
        nodes: {
          from: 'object3D',
          through: {
            view: COGNITE_VISUALIZABLE_SOURCE,
            identifier: 'object3D'
          }
        },
        limit: 1000
      }
    },
    select: {
      pointCloudVolumes: {
        sources: [
          {
            source: COGNITE_POINT_CLOUD_VOLUME_SOURCE,
            properties: POINT_CLOUD_VOLUME_REVISIONS_OBJECT3D_PROPERTIES_LIST
          }
        ]
      },
      object3D: {},
      assets: {
        sources: [
          {
            source: COGNITE_ASSET_SOURCE,
            properties: ASSET_PROPERTIES_LIST
          }
        ]
      }
    }
  } as const satisfies QueryRequest;
};
