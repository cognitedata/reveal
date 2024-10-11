/*!
 * Copyright 2024 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type PointCloudModelOptions } from '../Reveal3DResources/types';
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
  getModelEqualsFilter,
  getRevisionContainsAnyFilter,
  isPointCloudVolumeFilter,
  POINT_CLOUD_VOLUME_REVISIONS_OBJECT3D_PROPERTIES_LIST,
  type PointCloudVolumeObject3DProperties
} from '../../data-providers/utils/filters';
import { type PointCloudVolumeWithAsset } from './types';
import { type FdmSDK } from '../../data-providers/FdmSDK';

export const usePointCloudDMAnnotation = (
  models: PointCloudModelOptions[]
): UseQueryResult<PointCloudVolumeWithAsset[]> => {
  const fdmSdk = useFdmSdk();
  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'models-pointcloud-dm-annotations-mappings',
      ...models.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    queryFn: async () => {
      return await Promise.all(
        models.map(async (model) => {
          const annotationModel = await getPointCloudDMAnnotationsForModel(
            model.modelId,
            model.revisionId,
            fdmSdk
          );
          return {
            model,
            annotationModel
          };
        })
      );
    },
    staleTime: Infinity,
    enabled: models.length > 0
  });
};

const getPointCloudDMAnnotationsForModel = async (
  modelId: number,
  revisionId: number,
  fdmSdk: FdmSDK
): Promise<any> => {
  const modelRef = await getDMSModelsForIds([modelId], fdmSdk);
  const revisionRef = await getDMSRevisionsForRevisionIdsAndModelRefs(
    modelRef,
    [revisionId],
    fdmSdk
  );
  const query = getPointCloudDMAnnotationsQuery(modelRef, revisionRef);

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
    const assetProperties = asset.properties.cdf_cdm['CogniteAsset/v1'];
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
      return (
        asset.object3D.space === pointCloudVolume.object3D.space &&
        asset.object3D.externalId === pointCloudVolume.object3D.externalId
      );
    });

    return {
      ...pointCloudVolume,
      asset
    };
  });
  console.log('pointCloudVolumesWithAssets', pointCloudVolumesWithAssets);
  return assets;
};

const getPointCloudDMAnnotationsQuery = (
  modelRef: DmsUniqueIdentifier[],
  revisionRef: DmsUniqueIdentifier[]
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  return {
    with: {
      pointCloudVolumes: {
        nodes: {
          filter: {
            and: [
              isPointCloudVolumeFilter,
              getModelEqualsFilter({
                externalId: modelRef[0].externalId,
                space: modelRef[0].space
              }),
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
