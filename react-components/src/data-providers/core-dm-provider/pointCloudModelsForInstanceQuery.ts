/*!
 * Copyright 2024 Cognite AS
 */
import { type QueryRequest } from '@cognite/sdk';
import { COGNITE_POINT_CLOUD_VOLUME_SOURCE, COGNITE_VISUALIZABLE_SOURCE } from './dataModels';

export const pointCloudModelsForInstanceQuery = {
  with: {
    asset: {
      nodes: {
        filter: {
          and: [
            {
              equals: {
                property: ['node', 'externalId'],
                value: { parameter: 'instanceExternalId' }
              }
            },
            {
              equals: {
                property: ['node', 'space'],
                value: { parameter: 'instanceSpace' }
              }
            }
          ]
        }
      }
    },
    object_3ds: {
      nodes: {
        from: 'asset',
        through: {
          view: COGNITE_VISUALIZABLE_SOURCE,
          identifier: 'object3D'
        },
        direction: 'outwards'
      }
    },
    pointcloud_volumes: {
      nodes: {
        from: 'object_3ds',
        through: { view: COGNITE_POINT_CLOUD_VOLUME_SOURCE, identifier: 'object3D' }
      }
    }
  },
  select: {
    pointcloud_volumes: {
      sources: [
        {
          source: COGNITE_POINT_CLOUD_VOLUME_SOURCE,
          properties: ['*']
        }
      ]
    }
  }
} as const satisfies QueryRequest;
