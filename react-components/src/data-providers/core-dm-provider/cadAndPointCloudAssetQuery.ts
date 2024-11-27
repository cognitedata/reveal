/*!
 * Copyright 2024 Cognite AS
 */

import { type QueryRequest } from '@cognite/sdk';
import { type Source, type InstanceFilter } from '../FdmSDK';
import { cogniteAssetSourceWithProperties } from './cogniteAssetSourceWithProperties';
import {
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_ASSET_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  CORE_DM_3D_CONTAINER_SPACE
} from './dataModels';

export function cadAndPointCloudAssetQuery(
  sourcesToSearch: Source[],
  filter: InstanceFilter | undefined,
  limit: number
): QueryRequest {
  return {
    with: {
      cad_nodes: {
        nodes: {
          filter: containsCadRevisionFilter
        },
        limit
      },
      cad_object_3d: {
        nodes: {
          from: 'cad_nodes',
          through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' },
          direction: 'outwards'
        }
      },
      cad_assets: {
        nodes: {
          from: 'cad_object_3d',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          direction: 'inwards',
          filter
        }
      },
      pointcloud_volumes: {
        nodes: {
          filter: containsPointCloudRevisionFilter
        },
        limit
      },
      pointcloud_object_3d: {
        nodes: {
          from: 'pointcloud_volumes',
          through: { view: COGNITE_POINT_CLOUD_VOLUME_SOURCE, identifier: 'object3D' },
          direction: 'outwards'
        }
      },
      pointcloud_assets: {
        nodes: {
          from: 'pointcloud_object_3d',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          filter
        }
      }
    },
    select: {
      cad_assets: {
        sources: [
          ...cogniteAssetSourceWithProperties,
          ...sourcesToSearch.map((source) => ({ source, properties: ['*'] }))
        ]
      },
      pointcloud_assets: {
        sources: [
          ...cogniteAssetSourceWithProperties,
          ...sourcesToSearch.map((source) => ({ source, properties: ['*'] }))
        ]
      }
    }
  } as const satisfies QueryRequest;
}

const containsCadRevisionFilter: InstanceFilter = {
  containsAny: {
    property: [CORE_DM_3D_CONTAINER_SPACE, COGNITE_CAD_NODE_SOURCE.externalId, 'revisions'],
    values: { parameter: 'revisionRefs' }
  }
} as const;

const containsPointCloudRevisionFilter: InstanceFilter = {
  containsAny: {
    property: [
      CORE_DM_3D_CONTAINER_SPACE,
      COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId,
      'revisions'
    ],
    values: { parameter: 'revisionRefs' }
  }
} as const;
