/*!
 * Copyright 2024 Cognite AS
 */

import { type QueryRequest } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../data-providers';
import {
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  COGNITE_ASSET_SOURCE
} from '../../data-providers/core-dm-provider/dataModels';
import {
  isPointCloudVolumeFilter,
  getRevisionContainsAnyFilter,
  POINT_CLOUD_VOLUME_REVISIONS_OBJECT3D_PROPERTIES_LIST,
  ASSET_PROPERTIES_LIST
} from '../../data-providers/utils/filters';

export const pointCloudDMVolumesQuery = (revisionRef: DmsUniqueIdentifier[]): QueryRequest => {
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
