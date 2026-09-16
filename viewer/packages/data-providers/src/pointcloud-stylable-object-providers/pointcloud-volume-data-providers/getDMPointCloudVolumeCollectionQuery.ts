/*!
 * Copyright 2024 Cognite AS
 */

import type { QueryRequest } from '@cognite/sdk';
import { POINT_CLOUD_VOLUME_REVISIONS_OBJECT3D_PROPERTIES_LIST, ASSET_PROPERTIES_LIST } from './types';
import { isCoreDmObject3DFilter, isCoreDmPointCloudVolumeFilter, isCoreDmVisualizableFilter } from './queryFilters';
import { getRevisionContainsAnyFilter } from './utils';
import {
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  COGNITE_ASSET_SOURCE
} from '../../utilities/constants';
import type { DMInstanceRef } from '@reveal/utilities';

const getDMPointCloudVolumeQuery = (revisionRef: DMInstanceRef) => {
  return {
    with: {
      pointCloudVolumes: {
        nodes: {
          filter: {
            and: [isCoreDmPointCloudVolumeFilter, getRevisionContainsAnyFilter([revisionRef])]
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
          direction: 'outwards',
          filter: isCoreDmObject3DFilter
        },
        limit: 1000
      },
      assets: {
        nodes: {
          from: 'object3D',
          through: {
            view: COGNITE_VISUALIZABLE_SOURCE,
            identifier: 'object3D'
          },
          filter: isCoreDmVisualizableFilter
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
      object3D: { sources: [] },
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

export type CdfDMPointCloudVolumeQuery = ReturnType<typeof getDMPointCloudVolumeQuery>;

export function getDMPointCloudVolumeCollectionQuery(
  revisionExternalId: string,
  space: string
): CdfDMPointCloudVolumeQuery {
  return getDMPointCloudVolumeQuery({ externalId: revisionExternalId, space });
}
