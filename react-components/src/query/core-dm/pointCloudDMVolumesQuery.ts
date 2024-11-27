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
  getRevisionContainsAnyFilter
} from '../../data-providers/core-dm-provider/utils/filters';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const pointCloudDMVolumesQuery = (revisionRefs: DmsUniqueIdentifier[]) => {
  return {
    with: {
      pointCloudVolumes: {
        nodes: {
          filter: {
            and: [
              isPointCloudVolumeFilter,
              getRevisionContainsAnyFilter([
                {
                  externalId: revisionRefs[0].externalId,
                  space: revisionRefs[0].space
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
            properties: ['*']
          }
        ]
      },
      object3D: {},
      assets: {
        sources: [
          {
            source: COGNITE_ASSET_SOURCE,
            properties: ['*']
          }
        ]
      }
    }
  } as const satisfies QueryRequest;
};
